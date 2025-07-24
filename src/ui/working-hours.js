import { WeekDaysUtil } from "../utils/week-days.js";
import { SchedulePreviewUI } from "../ui/schedule-preview.js";

/**
 * Utility class for updating the working hours UI.
 */
export class WorkingHoursUI {
  /**
   * Updates the working hours UI based on the controller's state.
   * @param {object} controller - The popup controller instance.
   */
  static updateWorkingHoursUI(controller) {
    const workingHoursToggle = document.getElementById("workingHoursToggle");
    const workingHoursContent = document.getElementById("workingHoursContent");

    workingHoursToggle.checked = controller.settings.workingHours.enabled;
    workingHoursToggle.disabled = !controller.settings.enabled;

    if (controller.settings.workingHours.enabled) {
      workingHoursContent.classList.add("enabled");
    } else {
      workingHoursContent.classList.remove("enabled");
    }

    const startTimeInput = document.getElementById("startTime");
    const endTimeInput = document.getElementById("endTime");

    const startTime = controller.settings.workingHours.start || "09:00";
    const endTime = controller.settings.workingHours.end || "17:00";

    startTimeInput.value = startTime;
    endTimeInput.value = endTime;

    WorkingHoursUI.#generateWeekdayButtons(controller);

    WorkingHoursUI.#updateSchedulePreview(controller);
  }

  /**
   * Helper function to generate weekday buttons.
   * @private
   * @param {object} controller
   */
  static #generateWeekdayButtons(controller) {
    if (
      typeof WeekDaysUtil !== "undefined" &&
      WeekDaysUtil.generateWeekdayButtons
    ) {
      WeekDaysUtil.generateWeekdayButtons(controller);
    }
  }

  /**
   * Helper to update the schedule preview.
   * @private
   * @param {object} controller
   */
  static #updateSchedulePreview(controller) {
    if (
      typeof SchedulePreviewUI !== "undefined" &&
      SchedulePreviewUI.updateSchedulePreview
    ) {
      SchedulePreviewUI.updateSchedulePreview(controller);
    }
  }
}
