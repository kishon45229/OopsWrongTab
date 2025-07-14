import { StorageUtil } from "../utils/storage.js";
import { Config } from "../config/config.js";
import { ErrorHandler } from "../utils/error-handler.js";

/**
 * Class to handle tab redirection based on user settings.
 */
class TabRedirector {
  #redirectQueue = new Set();

  /**
   * Constructor to initialize the TabRedirector.
   */
  constructor() {
    this.#init();
  }

  /**
   * Initializes the TabRedirector by setting up event listeners.
   * @private
   * @returns {void}
   */
  #init() {
    this.#setupEventListeners();
  }

  /**
   * Sets up event listeners for tab navigation and commands.
   * @private
   * @returns {void}
   */
  #setupEventListeners() {
    chrome.webNavigation.onBeforeNavigate.addListener(
      this.#handleBeforeNavigate.bind(this)
    );
    chrome.commands.onCommand.addListener(this.#handleCommand.bind(this));
    chrome.runtime.onInstalled.addListener(this.#handleInstall.bind(this));
  }

  /**
   * Handles the before navigation event to check if the URL should be blocked.
   * @private
   * @param {Object} details
   * @throws {Error} If there is an error during processing.
   * @returns {Promise<void>}
   */
  async #handleBeforeNavigate(details) {
    if (details.frameId !== 0) return;
    try {
      const settings = await StorageUtil.getSettings();
      if (!settings.enabled) return;

      if (this.#redirectQueue.has(details.tabId)) return;

      const inWorkingHours = await StorageUtil.isInWorkingHours();
      if (settings.workingHours.enabled && !inWorkingHours) return;

      if (this.#shouldBlockUrl(details.url, settings)) {
        this.#redirectQueue.add(details.tabId);
        chrome.tabs.update(details.tabId, {
          url: settings.redirectUrl,
        });

        setTimeout(() => {
          this.#redirectQueue.delete(details.tabId);
        }, 2000);
      }
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Checks if the URL should be blocked based on user settings.
   * @private
   * @param {String} url
   * @param {Object} settings
   * @throws {Error} If there is an error during processing.
   * @returns {Object}
   */
  #shouldBlockUrl(url, settings) {
    try {
      if (
        url.startsWith("chrome://") ||
        url.startsWith("chrome-extension://") ||
        url.startsWith("moz-extension://") ||
        url.startsWith("edge://") ||
        url.startsWith("about:") ||
        url.includes("calendar.google.com")
      ) {
        return false;
      }
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/^www\./, "").toLowerCase();

      return settings.blockedDomains.some((blocked) =>
        domain.includes(blocked.toLowerCase())
      );
    } catch (error) {
      ErrorHandler.showErrorModal();
      return false;
    }
  }

  /**
   * Handles commands issued by the user.
   * @param {String} command
   * @private
   * @throws {Error} If there is an error during processing.
   * @returns {Promise<void>}
   */
  async #handleCommand(command) {
    try {
      if (command === "emergency_redirect") {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tabs[0]) {
          chrome.tabs.update(tabs[0].id, {
            url: Config.DEFAULT_SETTINGS.redirectUrl,
          });
        }
      }
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }

  /**
   * Install & set up default settings.
   * @private
   * @param {Object} details
   * @throws {Error} If there is an error during processing.
   * @returns {Promise<void>}
   */
  async #handleInstall(details) {
    try {
      if (details.reason === "install") {
        await StorageUtil.saveSettings(Config.DEFAULT_SETTINGS);
        chrome.tabs.create({
          url: Config.DEFAULT_SETTINGS.siteUrl,
        });
      }
    } catch (error) {
      ErrorHandler.showErrorModal();
    }
  }
}

new TabRedirector();