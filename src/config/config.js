/**
 * Configuration for OopsWrongTab extension.
 */
export class Config {
  /**
   * Default settings for the extension.
   * @type {Readonly<Object>}
   */
  static get DEFAULT_SETTINGS() {
    return Config.#DEFAULTS;
  }

  /**
   * Default working hours config.
   * @returns {Readonly<Object>}
   */
  static get DEFAULT_WORKING_HOURS() {
    return { ...Config.#DEFAULTS.workingHours };
  }

  /**
   * Default blocked domains.
   * @returns {Readonly<Array<string>>}
   */
  static get DEFAULT_BLOCKED_DOMAINS() {
    return [...Config.#DEFAULTS.blockedDomains];
  }

  /**
   * Default redirect URL.
   * @returns {string}
   */
  static get DEFAULT_REDIRECT_URL() {
    return Config.#DEFAULTS.redirectUrl;
  }

  /**
   * Default first day of week.
   * @returns {number}
   */
  static get DEFAULT_FIRST_DAY_OF_WEEK() {
    return Config.#DEFAULTS.firstDayOfWeek;
  }

  static #DEFAULTS = Object.freeze({
    enabled: true,
    workingHours: Object.freeze({
      enabled: false,
      start: "09:00",
      end: "17:00",
      weekdays: [1, 2, 3, 4, 5],
    }),
    siteUrl: "https://oopswrongtab.net/",
    redirectUrl: "https://calendar.google.com",
    blockedDomains: Object.freeze([
      //Example blocked domains
      "facebook.com",
      "instagram.com",
      "twitter.com",
      "youtube.com",
      "reddit.com",
    ]),
    firstDayOfWeek: 1,
  });
}
