/**
 * Utility class for error handling.
 */
export class ErrorHandler {
  /**
   * Displays a modal with a generic error message.
   */
  static showErrorModal(
    message = "Something went wrong. Please reload or try again later."
  ) {
    if (document.querySelector(".error-modal")) return;

    const modal = document.createElement("div");
    modal.className = "error-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    `;

    modalContent.innerHTML = `
      <h2 style="margin-bottom: 10px; font-size: 18px; color: #333;">Oops!</h2>
      <p style="margin-bottom: 20px; font-size: 14px; color: #555;">${message}</p>
      <button id="errorModalReloadBtn" style="
        padding: 10px 20px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      ">Reload</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal
      .querySelector("#errorModalReloadBtn")
      .addEventListener("click", () => {
        location.reload();
      });
  }
}
