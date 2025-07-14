import { StorageUtil } from "../utils/storage.js";

/**
 * Utility class for updating the popup UI.
 */
export class UIUpdater {
  /**
   * Updates the popup UI based on the controller's state.
   * @param {object} controller - The popup controller instance.
   * @returns {Promise<void>}
   */
  static async updateUI(controller) {
    try {
      const statusIndicator = document.getElementById("statusIndicator");
      const statusText = statusIndicator?.querySelector(".status-text");
      const header = document.querySelector(".popup-header");

      const isWorkingHours = await StorageUtil.isInWorkingHours();
      const isEffectivelyActive =
        controller.settings.enabled &&
        (!controller.settings.workingHours.enabled || isWorkingHours);

      if (!controller.settings.workingHours.enabled && isWorkingHours) {
        UIUpdater.#setStatus(
          statusText,
          header,
          statusIndicator,
          "Protection is ON (All Days Active)",
          true
        );
      } else if (isEffectivelyActive) {
        UIUpdater.#setStatus(
          statusText,
          header,
          statusIndicator,
          "Protection is ON (Working Hours Active)",
          true
        );
      } else if (!controller.settings.enabled) {
        UIUpdater.#setStatus(
          statusText,
          header,
          statusIndicator,
          "Protection Disabled",
          false
        );
      } else if (controller.settings.workingHours.enabled && !isWorkingHours) {
        UIUpdater.#setStatus(
          statusText,
          header,
          statusIndicator,
          "Protection is OFF (Outside Working Hours)",
          false
        );
      }

      const enabledToggle = document.getElementById("enabledToggle");
      const workingHoursToggle = document.getElementById("workingHoursToggle");

      if (enabledToggle) enabledToggle.checked = controller.settings.enabled;
      if (workingHoursToggle)
        workingHoursToggle.checked = controller.settings.workingHours.enabled;

      controller.updateWorkingHoursUI();
    } catch (error) {
      ErrorHandler.showErrorModal();
      return;
    }
  }

  /**
   * Helper to set status bar and header.
   * @private
   * @param {HTMLElement} statusText
   * @param {HTMLElement} header
   * @param {HTMLElement} statusIndicator
   * @param {string} text
   * @param {boolean} isActive
   */
  static #setStatus(statusText, header, statusIndicator, text, isActive) {
    if (statusText) statusText.textContent = text;
    if (header && statusIndicator) {
      if (isActive) {
        header.classList.add("active");
        header.classList.remove("inactive");
        statusIndicator.classList.add("active");
        statusIndicator.classList.remove("inactive");
      } else {
        header.classList.add("inactive");
        header.classList.remove("active");
        statusIndicator.classList.add("inactive");
        statusIndicator.classList.remove("active");
      }
    }
  }
}
