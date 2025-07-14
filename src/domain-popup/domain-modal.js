import { DomainUtil } from "../utils/domain.js";
import { DateUtils } from "../utils/date.js";
import { StorageUtil } from "../utils/storage.js";
import { ErrorHandler } from "../utils/error-handler.js";

/**
 * Modal for managing blocked domains.
 */
export class DomainModal {
  /**
   * @param {object} settings - The current extension settings object.
   * @param {Function} updateUI - Callback to update the main UI.
   * @param {Function} loadSettings - Callback to reload settings from storage.
   * @param {Function} showError - Callback to show error messages.
   */
  constructor(settings, updateUI, loadSettings, showError) {
    this.settings = settings;
    this.updateUI = updateUI;
    this.loadSettings = loadSettings;
    this.showError = showError;
    this.modal = null;
  }

  /**
   * Add a domain to the blocklist after validation.
   * @param {string} domain
   * @throws {Error} If the domain is invalid or already blocked.
   * @returns {Promise<void>}
   */
  async addDomain(domain) {
    try {
      const settings = await StorageUtil.getSettings();
      this.settings = settings;
      const validation = DomainUtil.validate(domain, settings.blockedDomains);
      if (!validation.isValid) throw new Error(validation.message);

      await StorageUtil.addBlockedDomain(domain);
      await this.loadSettings();

      this.settings = await StorageUtil.getSettings();
      if (this.modal) this.updateModalUI();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Remove a domain from the blocklist.
   * @param {string} domain
   * @throws {Error} If the domain cannot be removed.
   * @returns {Promise<void>}
   */
  async removeDomain(domain) {
    try {
      await StorageUtil.removeBlockedDomain(domain);
      await this.loadSettings();

      this.settings = await StorageUtil.getSettings();
      if (this.modal) this.updateModalUI();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Handles removal of a domain from the modal UI.
   * @param {string} domain
   * @throws {Error} If the domain cannot be removed.
   * @returns {Promise<void>}
   */
  async handleModalRemoveDomain(domain) {
    try {
      await this.removeDomain(domain);
    } catch (error) {
      ErrorHandler.showErrorModal();
      if (
        this.modal &&
        this.settings &&
        this.settings.blockedDomains &&
        this.settings.blockedDomains.includes(domain)
      ) {
        this.showError(this.modal, "Failed to remove domain from modal");
      }
    }
  }

  /**
   * Render the blocked domains list as HTML for the modal.
   * @returns {string}
   */
  renderDomains() {
    const domains =
      this.settings && this.settings.blockedDomains
        ? this.settings.blockedDomains
        : [];
    if (!domains.length) {
      return '<div class="domains-list-empty">No domains blocked yet. Add some above!</div>';
    }

    return domains
      .map(
        (domain) => `
      <div class="domains-item">
        <span class="domains-name">${domain}</span>
        <button class="domains-remove-btn" data-domain="${domain}">Remove</button>
      </div>
    `
      )
      .join("");
  }

  /**
   * Show the domain management modal.
   * @returns {Promise<void>}
   */
  async show() {
    try {
      this.modal = document.createElement("div");
      this.modal.className = "domains-modal";
      const response = await fetch(
        chrome.runtime.getURL("src/domain-popup/domain-modal.html")
      );
      const html = await response.text();
      this.modal.innerHTML = html;
      document.body.appendChild(this.modal);
      this.updateModalUI();

      this.setupValidation(this.modal);

      this.modal.querySelector("#cancelDomains").onclick = () =>
        this.closeModal();
      this.modal.querySelector("#closeDomains").onclick = () =>
        this.closeModal();
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.closeModal();
      });

      this.modal
        .querySelector("#modalDomainsList")
        .addEventListener("click", async (e) => {
          if (e.target.classList.contains("domains-remove-btn")) {
            const domain = e.target.dataset.domain;
            await this.handleModalRemoveDomain(domain);
          }
        });

      this.modal.querySelector("#modalDomainInput").focus();
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Close the modal and remove it from the DOM.
   */
  closeModal() {
    try {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
        this.modal = null;
      }
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Update the modal UI.
   */
  updateModalUI() {
    if (!this.modal) return;
    this.modal.querySelector(
      ".domains-count"
    ).textContent = `${this.settings.blockedDomains.length} domains`;

    this.modal.querySelector("#modalDomainsList").innerHTML =
      this.renderDomains();

    const input = this.modal.querySelector("#modalDomainInput");
    const addBtn = this.modal.querySelector("#modalAddDomainBtn");
    const validationMessage = this.modal.querySelector("#validationMessage");

    if (input && addBtn && validationMessage) {
      input.disabled = false;
      addBtn.disabled = false;
      input.placeholder = "Enter domain name (e.g., youtube.com)";
      validationMessage.textContent = "";
      validationMessage.classList.remove("error", "success", "info");
      input.classList.remove("valid", "invalid");
    }
  }

  /**
   * Set up input validation and event listeners for the modal.
   * @param {HTMLElement} modal
   */
  setupValidation(modal) {
    const input = modal.querySelector("#modalDomainInput");
    const addBtn = modal.querySelector("#modalAddDomainBtn");
    const message = modal.querySelector("#validationMessage");
    let timeout;

    input.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.validateInput(input, addBtn, message);
      }, 300);
    });

    addBtn.addEventListener("click", async () => {
      await this.handleAddDomain(modal);
    });

    input.addEventListener("keypress", async (e) => {
      if (e.key === "Enter" && !addBtn.disabled) {
        await this.handleAddDomain(modal);
      }
    });

    this.validateInput(input, addBtn, message);
  }

  /**
   * Validate the domain input and update the UI accordingly.
   * @param {HTMLInputElement} input
   * @param {HTMLButtonElement} addBtn
   * @param {HTMLElement} messageBox
   */
  validateInput(input, addBtn, messageBox) {
    const domain = input.value.trim().toLowerCase();
    input.classList.remove("valid", "invalid");
    messageBox.classList.remove("error", "success", "info");

    if (!domain) {
      messageBox.textContent = "";
      addBtn.disabled = true;
      return;
    }

    StorageUtil.getSettings().then((settings) => {
      const result = DomainUtil.validate(domain, settings.blockedDomains);
      if (result.isValid) {
        input.classList.add("valid");
        messageBox.textContent = result.message;
        messageBox.classList.add("success");
        addBtn.disabled = false;
      } else {
        input.classList.add("invalid");
        messageBox.textContent = result.message;
        messageBox.classList.add("error");
        addBtn.disabled = true;
      }
    });
  }

  /**
   * Handle adding a domain from the modal UI.
   * @param {HTMLElement} modal
   * @returns {Promise<void>}
   */
  async handleAddDomain(modal) {
    try {
      const input = modal.querySelector("#modalDomainInput");
      const domain = input.value
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "");

      if (!domain) return;

      await this.addDomain(domain);
      input.value = "";

      const messageBox = modal.querySelector("#validationMessage");
      input.classList.remove("valid", "invalid");
      messageBox.textContent = "";
      messageBox.classList.remove("error", "success", "info");

      this.updateModalUI();

      const btn = modal.querySelector("#modalAddDomainBtn");
      const originalText = btn.textContent;
      btn.innerHTML = '<i class="fa fa-check"></i>';
      btn.style.background = "#10b981";

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = "";
      }, 1000);
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Show an error message in the modal.
   * @param {HTMLElement} modal
   * @param {string} message
   */
  showModalError(modal, message) {
    DateUtils.showModalError(modal, message);
  }
}
