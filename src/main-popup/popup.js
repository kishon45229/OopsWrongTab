import { StorageUtil } from "../utils/storage.js";
import { UIUpdater } from "../utils/ui-updater.js";
import { DomainModal } from "../domain-popup/domain-modal.js";
import { DateUtils } from "../utils/date.js";
import { WeekDaysUtil } from "../utils/week-days.js";
import { WorkingHoursUI } from "../ui/working-hours.js";
import { SchedulePreviewUI } from "../ui/schedule-preview.js";
import { ErrorHandler } from "../utils/error-handler.js";

/**
 * Controller for the OopsWrongTab popup UI.
 */
class PopupController {
  #settings = null;
  #domainModal = null;

  /**
   * Constructs the PopupController.
   */
  constructor() {
    this.#init();
  }

  /**
   * Initializes the popup.
   * @private
   * @throws {Error} If there is an error during initialization.
   */
  async #init() {
    try {
      await this.#loadSettings();
      this.#domainModal = new DomainModal(
        this.#settings,
        this.refreshUI.bind(this),
        this.#loadSettings.bind(this),
        this.showModalError.bind(this)
      );
      this.#setupEventListeners();
      await this.refreshUI();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Loads settings from storage and syncs with domain modal.
   * @private
   * @throws {Error} If there is an error loading settings.
   */
  async #loadSettings() {
    try {
      this.#settings = await StorageUtil.getSettings();
      if (this.#domainModal) {
        this.#domainModal.settings = this.#settings;
      }
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Bind event helper function.
   * @private
   * @param {string} selector - CSS selector
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   */
  static #bindEvent(selector, event, handler, context) {
    const element = document.querySelector(selector);
    if (element) element.addEventListener(event, handler.bind(context));
  }

  /**
   * Sets up all popup event listeners.
   * @private
   */
  #setupEventListeners() {
    PopupController.#bindEvent(
      "#enabledToggle",
      "change",
      this.handleToggleChange,
      this
    );
    PopupController.#bindEvent(
      "#workingHoursToggle",
      "change",
      this.handleWorkingHoursToggle,
      this
    );
    PopupController.#bindEvent(
      "#workingHoursToggle",
      "click",
      this.preventWorkingHoursToggleWhenDisabled,
      this
    );
    PopupController.#bindEvent(
      "#startTime",
      "change",
      this.handleTimeChange,
      this
    );
    PopupController.#bindEvent(
      "#endTime",
      "change",
      this.handleTimeChange,
      this
    );
    PopupController.#bindEvent(
      "#selectWeekdays",
      "click",
      this.selectWeekdays,
      this
    );
    PopupController.#bindEvent(
      "#selectWeekend",
      "click",
      this.selectWeekend,
      this
    );
    PopupController.#bindEvent("#selectAll", "click", this.selectAllDays, this);
    PopupController.#bindEvent(
      "#manageDomainsBtn",
      "click",
      this.showDomainsModal,
      this
    );
    PopupController.#bindEvent(
      "#buyMeCoffeeBtn",
      "click",
      this.openBuyMeCoffee,
      this
    );
    PopupController.#bindEvent("#githubBtn", "click", this.openGitHub, this);
    PopupController.#bindEvent("#helpBtn", "click", this.openHelp, this);
  }

  /**
   * Prevents enabling workingHoursToggle when enabledToggle is off.
   * @param {Event} event
   */
  preventWorkingHoursToggleWhenDisabled(event) {
    if (!this.#settings.enabled) {
      event.preventDefault();
      const infoMessage = document.getElementById("workingHoursInfo");
      if (infoMessage) {
        infoMessage.style.display = "inline";
        setTimeout(() => {
          infoMessage.style.display = "none";
        }, 3000);
      }
    }
  }

  /**
   * Updates the working hours UI.
   */
  updateWorkingHoursUI() {
    if (
      typeof WorkingHoursUI !== "undefined" &&
      WorkingHoursUI.updateWorkingHoursUI
    ) {
      WorkingHoursUI.updateWorkingHoursUI(this);
    }
  }

  /**
   * Renders weekday buttons.
   */
  generateWeekdayButtons() {
    WeekDaysUtil.generateWeekdayButtons(this);
  }

  /**
   * Updates the schedule preview.
   */
  updateSchedulePreview() {
    SchedulePreviewUI.updateSchedulePreview(this);
  }

  /**
   * Gets the current settings.
   * @returns {object}
   */
  get settings() {
    return this.#settings;
  }

  /**
   * Gets Date objects for the current week.
   * @returns {Date[]}
   */
  getCurrentWeekDates() {
    return DateUtils.getCurrentWeekDates(
      new Date(),
      this.#settings.firstDayOfWeek
    );
  }

  /**
   * Selects weekdays (Mon-Fri) for working hours and updates state.
   * @throws {Error} If there is an error selecting weekdays.
   */
  async selectWeekdays() {
    try {
      const firstDay = this.#settings.firstDayOfWeek;
      this.#settings.workingHours.weekdays = [1, 2, 3, 4, 5];

      await StorageUtil.saveSettings(this.#settings);
      this.updateWorkingHoursUI();

      await this.refreshProtectionState();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Selects weekend (Sat, Sun) for working hours and updates state.
   * @throws {Error} If there is an error selecting weekend.
   */
  async selectWeekend() {
    try {
      this.#settings.workingHours.weekdays = [0, 6];
      await StorageUtil.saveSettings(this.#settings);

      this.updateWorkingHoursUI();
      await this.refreshProtectionState();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Selects all days for working hours and updates state.
   * @throws {Error} If there is an error selecting all days.
   */
  async selectAllDays() {
    try {
      this.#settings.workingHours.weekdays = [0, 1, 2, 3, 4, 5, 6];
      await StorageUtil.saveSettings(this.#settings);

      this.updateWorkingHoursUI();
      await this.refreshProtectionState();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Handles the main enable/disable toggle.
   * @param {Event} event
   * @throws {Error} If there is an error handling the toggle change.
   */
  async handleToggleChange(event) {
    try {
      this.#settings.enabled = event.target.checked;

      if (!event.target.checked) {
        this.#settings.workingHours.enabled = false;
        const workingHoursToggle =
          document.getElementById("workingHoursToggle");
        if (workingHoursToggle) workingHoursToggle.checked = false;
      }

      await StorageUtil.saveSettings(this.#settings);
      await this.refreshUI();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Handles the working hours enable/disable toggle.
   * @param {Event} event
   * @throws {Error} If there is an error handling the toggle change.
   */
  async handleWorkingHoursToggle(event) {
    try {
      this.#settings.workingHours.enabled = event.target.checked;
      await StorageUtil.saveSettings(this.#settings);

      this.updateWorkingHoursUI();
      await this.refreshProtectionState();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Handles changes to working hours start/end time.
   * @throws {Error} If there is an error handling the time change.
   */
  async handleTimeChange() {
    try {
      const startTime = document.getElementById("startTime").value;
      const endTime = document.getElementById("endTime").value;

      this.#settings.workingHours.start = startTime;
      this.#settings.workingHours.end = endTime;

      await StorageUtil.saveSettings(this.#settings);
      this.updateSchedulePreview();

      await this.refreshProtectionState();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Handles toggling a weekday button for working hours.
   * @param {Event} event
   * @throws {Error} If there is an error handling the weekday toggle.
   */
  async handleWeekdayToggle(event) {
    try {
      const btn = event.target.closest(".weekday-btn");
      if (btn.disabled || btn.classList.contains("disabled")) {
        return;
      }

      const day = parseInt(btn.dataset.day);
      const weekdays = [...this.#settings.workingHours.weekdays];
      if (weekdays.includes(day)) {
        weekdays.splice(weekdays.indexOf(day), 1);
      } else {
        weekdays.push(day);
      }

      this.#settings.workingHours.weekdays = weekdays;
      await StorageUtil.saveSettings(this.#settings);

      this.updateWorkingHoursUI();
      await this.refreshProtectionState();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Reloads settings and updates UI.
   * @throws {Error} If there is an error refreshing the protection state.
   */
  async refreshProtectionState() {
    try {
      await this.#loadSettings();
      await this.refreshUI();

      DateUtils.showProtectionStateUpdate(
        document.getElementById("statusIndicator")
      );
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Updates the popup UI using UIUpdater.
   * @throws {Error} If there is an error updating the UI.
   */
  async refreshUI() {
    try {
      await UIUpdater.updateUI(this);
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Adds a domain to the blocklist.
   * @param {string} domain
   * @throws {Error} If there is an error adding the domain.
   * @returns {Promise<void>}
   */
  async addDomain(domain) {
    try {
      return await this.#domainModal.addDomain(domain);
    } catch (error) {
      ErrorHandler.showErrorModal();
      throw error;
    }
  }

  /**
   * Removes a domain from the blocklist.
   * @param {string} domain
   * @throws {Error} If there is an error removing the domain.
   * @returns {Promise<void>}
   */
  async handleRemoveDomain(domain) {
    try {
      return await this.#domainModal.removeDomain(domain);
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Handles domain removal.
   * @param {string} domain
   * @throws {Error} If there is an error handling the domain removal.
   * @returns {Promise<void>}
   */
  async handleModalRemoveDomain(domain) {
    try {
      return await this.#domainModal.handleModalRemoveDomain(domain);
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Renders the domains list for the modal.
   * @returns {string}
   */
  renderDomainsForModal() {
    return this.#domainModal.renderDomains();
  }

  /**
   * Shows the domain modal.
   * @throws {Error} If there is an error showing the modal.
   * @returns {Promise<void>}
   */
  async showDomainsModal() {
    try {
      return await this.#domainModal.show();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Validates a domain.
   * @param {string} domain
   * @returns {object}
   */
  validateDomain(domain) {
    return this.#domainModal.validate(domain);
  }

  /**
   * Handles adding a domain from the modal UI.
   * @param {HTMLElement} modal
   * @throws {Error} If there is an error handling the modal add domain.
   * @returns {Promise<void>}
   */
  async handleModalAddDomain(modal) {
    try {
      return await this.#domainModal.handleAddDomain(modal);
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Shows an error message in the modal.
   * @param {HTMLElement} modal
   * @param {string} message
   */
  showModalError(modal, message) {
    DateUtils.showModalError(modal, message);
  }

  /**
   * Buy Me a Coffee page.
   */
  openBuyMeCoffee() {
    chrome.tabs.create({ url: "https://buymeacoffee.com/kishon45229" });
    window.close();
  }

  /**
   * GitHub repository.
   */
  openGitHub() {
    chrome.tabs.create({
      url: "https://github.com/kishon45229/OopsWrongTab.git",
    });
    window.close();
  }

  /**
   * FAQ page.
   */
  openHelp() {
    chrome.tabs.create({ url: "https://oopswrongtab.net/faq" });
    window.close();
  }
}

/**
 * Initializes the PopupController
 * @throws {Error} If there is an error initializing the controller.
 */
document.addEventListener("DOMContentLoaded", () => {
  try {
    new PopupController();
  } catch (error) {
    ErrorHandler.showErrorModal();
  }
});
