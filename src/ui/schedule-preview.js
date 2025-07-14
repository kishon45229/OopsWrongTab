import { DateUtils } from "../utils/date.js";

/**
 * Utility class for updating the working hours schedule preview.
 */
export class SchedulePreviewUI {
  /**
   * Updates the schedule preview UI based on the controller's state.
   * @param {object} controller - The popup controller instance.
   */
  static updateSchedulePreview(controller) {
    const statusText = document.querySelector(".schedule-preview .status-text");
    if (!statusText) return;

    const { workingHours } = controller.settings;
    const selectedDays = workingHours.weekdays;
    const startTime = workingHours.start;
    const endTime = workingHours.end;
    const todayIdx = new Date().getDay();

    if (!workingHours.enabled) {
      statusText.textContent = "Protection runs 24/7 (working hours disabled)";
      return;
    }

    if (!selectedDays.length) {
      statusText.textContent = "No work days selected - protection inactive";
      return;
    }

    const dayText = this.#formatDayText(selectedDays);
    const timeRange = this.#formatTimeRange(startTime, endTime);
    const todayStatus = this.#formatTodayStatus(selectedDays, todayIdx);

    statusText.innerHTML = `
      <div style="margin-bottom: 4px;">Active on ${dayText}, ${timeRange}</div>
      <div style="font-size: 11px; font-weight: 600;">${todayStatus}</div>
    `;
  }

  /**
   * Helper function to format the selected days as a human-readable string.
   * @private
   * @param {number[]} selectedDays
   * @returns {string}
   */
  static #formatDayText(selectedDays) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const allWeekdays = [1, 2, 3, 4, 5];
    const hasAllWeekdays = allWeekdays.every((d) => selectedDays.includes(d));
    const hasSaturday = selectedDays.includes(6);
    const hasSunday = selectedDays.includes(0);

    if (selectedDays.length === 7) {
      return "every day";
    } else if (hasAllWeekdays && (hasSaturday || hasSunday)) {
      const extras = [];
      if (hasSaturday) extras.push("Saturday");
      if (hasSunday) extras.push("Sunday");
      let text = "weekdays";
      if (extras.length === 1) {
        text += " and " + extras[0];
      } else if (extras.length === 2) {
        text += ", Saturday and Sunday";
      }
      return text;
    } else if (selectedDays.length === 5 && hasAllWeekdays) {
      return "weekdays";
    } else if (selectedDays.length === 2 && hasSaturday && hasSunday) {
      return "weekends";
    } else {
      const sortedDays = selectedDays.slice().sort((a, b) => a - b);
      const names = sortedDays.map((day) => dayNames[day]);
      if (names.length <= 2) {
        return names.join(" and ");
      } else {
        return (
          names.slice(0, -1).join(", ") + ", and " + names[names.length - 1]
        );
      }
    }
  }

  /**
   * Helper function to format the time range.
   * @param {string} start
   * @param {string} end
   * @returns {string}
   */
  static #formatTimeRange(start, end) {
    return `${this.#formatTime(start)} - ${this.#formatTime(end)}`;
  }

  /**
   * Helper function to format a time string as 12-hour AM/PM.
   * @param {string} time
   * @returns {string}
   */
  static #formatTime(time) {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  /**
   * Helper function to format today's protection status.
   * @param {number[]} selectedDays
   * @param {number} todayIdx
   * @returns {string}
   */
  static #formatTodayStatus(selectedDays, todayIdx) {
    const todayName =
      typeof DateUtils !== "undefined"
        ? DateUtils.getDayName(todayIdx)
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][todayIdx];
    return selectedDays.includes(todayIdx)
      ? `🟢 Today (${todayName}) is protected`
      : `🔴 Today (${todayName}) is not protected`;
  }
}
