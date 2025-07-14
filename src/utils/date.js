/**
 * Utility class for date-related operations.
 */
export class DateUtils {
  /**
   * Returns an array of Date objects for the current week.
   * @param {Date} date - The reference date
   * @param {number} firstDayOfWeek - 0 (Sunday) or 1 (Monday)
   * @returns {Date[]} Array of 7 Date objects for the week
   */
  static getCurrentWeekDates(date = new Date(), firstDayOfWeek = 1) {
    const week = [];
    const day = date.getDay();
    const diff =
      day < firstDayOfWeek
        ? -((7 - firstDayOfWeek + day) % 7)
        : -(day - firstDayOfWeek);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      week.push(d);
    }
    return week;
  }

  /**
   * Returns true if dateForDay is before today
   * @param {Date} dateForDay
   * @param {Date} today
   * @returns {boolean}
   */
  static isDayInPast(dateForDay, today = new Date()) {
    const dayStart = new Date(dateForDay);
    dayStart.setHours(0, 0, 0, 0);

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    return dayStart < todayStart;
  }

  /**
   * Returns the short name for a day index
   * @param {number} day
   * @returns {string}
   */
  static getDayName(day) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day];
  }

  /**
   * Subtle flash effect to the status indicator element to show state update.
   * @param {HTMLElement} statusIndicator
   * @returns {void}
   */
  static showProtectionStateUpdate(statusIndicator) {
    if (!statusIndicator) return;
    const originalTransition = statusIndicator.style.transition;
    statusIndicator.style.transition = "all 0.15s ease";
    statusIndicator.style.transform = "scale(1.02)";

    setTimeout(() => {
      statusIndicator.style.transform = "scale(1)";
      setTimeout(() => {
        statusIndicator.style.transition = originalTransition;
      }, 150);
    }, 150);
  }

  /**
   * Shows an error message in a modal's validation area and marks the input as invalid.
   * @param {HTMLElement} modal
   * @param {string} message
   * @returns {void}
   */
  static showModalError(modal, message) {
    if (!modal || typeof modal.querySelector !== "function") return;

    const input = modal.querySelector("#modalDomainInput");
    const messageBox = modal.querySelector("#validationMessage");
    if (!input || !messageBox) return;

    messageBox.textContent = message;
    messageBox.classList.remove("success", "info");
    messageBox.classList.add("error");

    input.classList.remove("valid");
    input.classList.add("invalid");
  }
}
