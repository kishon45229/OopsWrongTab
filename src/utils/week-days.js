import { DateUtils } from "../utils/date.js";

/**
 * Utility class for generating weekday buttons in the UI.
 */
export class WeekDaysUtil {
  /**
   * Generates weekday buttons for the working hours UI.
   * @param {object} controller - The popup controller instance.
   */
  static generateWeekdayButtons(controller) {
    const weekdayButtonsContainer = document.getElementById("weekdayButtons");
    if (!weekdayButtonsContainer) return;

    weekdayButtonsContainer.innerHTML = "";

    const today = new Date();
    const currentWeekDates = controller.getCurrentWeekDates();

    for (let i = 0; i < 7; i++) {
      const dateForDay = currentWeekDates[i];
      const dayIndex = dateForDay.getDay();
      const dayName = WeekDaysUtil.#getDayName(dayIndex);

      const btn = document.createElement("button");
      btn.className = "weekday-btn";
      btn.dataset.day = dayIndex;

      btn.innerHTML = `
        <span class="weekday-letter">${dayName}</span>
        <span class="weekday-date">${dateForDay.getDate()}</span>
      `;

      const isPastDay = WeekDaysUtil.#isDayInPast(dateForDay, today);

      if (isPastDay) {
        btn.classList.add("disabled");
        btn.disabled = true;
        btn.style.pointerEvents = "none";
      } else {
        btn.classList.remove("disabled");
        btn.disabled = false;
        btn.style.pointerEvents = "auto";
      }

      if (
        today.getFullYear() === dateForDay.getFullYear() &&
        today.getMonth() === dateForDay.getMonth() &&
        today.getDate() === dateForDay.getDate()
      ) {
        btn.classList.add("today");
      }

      if (
        controller.settings.workingHours.weekdays.includes(dayIndex) &&
        !isPastDay
      ) {
        btn.classList.add("active");
      }

      btn.addEventListener(
        "click",
        controller.handleWeekdayToggle.bind(controller)
      );

      weekdayButtonsContainer.appendChild(btn);
    }
  }

  /**
   * Helper function to get the short name for a day index.
   * @private
   * @param {number} day
   * @returns {string}
   */
  static #getDayName(day) {
    if (typeof DateUtils !== "undefined" && DateUtils.getDayName) {
      return DateUtils.getDayName(day);
    }
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day];
  }

  /**
   * Helper function to check if a date is in the past
   * @private
   * @param {Date} dateForDay
   * @param {Date} today
   * @returns {boolean}
   */
  static #isDayInPast(dateForDay, today) {
    if (typeof DateUtils !== "undefined" && DateUtils.isDayInPast) {
      return DateUtils.isDayInPast(dateForDay, today);
    }
    const dayStart = new Date(dateForDay);
    dayStart.setHours(0, 0, 0, 0);

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    return dayStart < todayStart;
  }
}