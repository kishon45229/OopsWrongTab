import { Config } from "../config/config.js";
import { ErrorHandler } from "./error-handler.js";

/**
 * Utility to handle extension settings and browser storage.
 */
export class StorageUtil {
  /**
   * Get extension settings from storage and merged with defaults.
   * @throws If If there is an error retrieving settings.
   * @returns {Promise<Object>}
   *
   */
  static async getSettings() {
    try {
      const result = await chrome.storage.local.get("settings");

      return { ...Config.DEFAULT_SETTINGS, ...result.settings };
    } catch (error) {
      ErrorHandler.showErrorModal();
      return Config.DEFAULT_SETTINGS;
    }
  }

  /**
   * Save extension settings to storage.
   * @param {Object} settings
   * @throws If there is an error saving settings.
   * @returns {Promise<boolean>}
   */
  static async saveSettings(settings) {
    try {
      await chrome.storage.local.set({ settings });
      return true;
    } catch (error) {
      ErrorHandler.showErrorModal();
      return false;
    }
  }

  /**
   * Add a domain to the blocked list.
   * @param {string} domain
   * @returns {Promise<void>}
   */
  static async addBlockedDomain(domain) {
    const settings = await this.getSettings();
    if (!settings.blockedDomains.includes(domain)) {
      settings.blockedDomains.push(domain);
      await this.saveSettings(settings);
    }
  }

  /**
   * Remove a domain from the blocked list.
   * @param {string} domain
   * @returns {Promise<void>}
   */
  static async removeBlockedDomain(domain) {
    const settings = await this.getSettings();
    settings.blockedDomains = settings.blockedDomains.filter(
      (d) => d !== domain
    );
    await this.saveSettings(settings);
  }

  /**
   * Returns true if now is within working hours, or if working hours are disabled.
   * @throws If there is an error checking working hours.
   * @returns {Promise<boolean>}
   */
  static async isInWorkingHours() {
    try {
      const settings = await this.getSettings();
      if (!settings.workingHours.enabled) return true;

      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const [startHour = 9, startMin = 0] = settings.workingHours.start
        .split(":")
        .map(Number);
      const [endHour = 17, endMin = 0] = settings.workingHours.end
        .split(":")
        .map(Number);

      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      const isWorkingDay = settings.workingHours.weekdays.includes(currentDay);
      const isWorkingTime = currentTime >= startTime && currentTime <= endTime;

      return isWorkingDay && isWorkingTime;
    } catch (error) {
      ErrorHandler.showErrorModal();
      return true;
    }
  }
}
