/* =========================================================
   COUNTDOWN
   ========================================================= */

function startCountdown() {

  stopCountdown();

  countdownValue = 12;

  countdown.textContent =
    countdownValue;

  countdownCard.style.display =
    "block";

  countdownCard.querySelector(
    ".countdown-text"
  ).textContent =
    "Calling primary contact when countdown ends...";

  countdownTimer =
    setInterval(() => {

      countdownValue--;

      countdown.textContent =
        countdownValue;

      if (
        countdownValue <= 0
      ) {

        stopCountdown();

        countdown.textContent =
          "0";

        countdownCard.querySelector(
          ".countdown-text"
        ).textContent =
          "Emergency contact is ready.";

        if (
          primaryContact &&
          primaryContact.phone
        ) {

          const phone =
            String(
              primaryContact.phone
            ).replace(
              /[^0-9+]/g,
              ""
            );

          if (phone) {

            callPrimaryBtn.href =
              `tel:${phone}`;

            callPrimaryBtn.classList.remove(
              "disabled"
            );

            callPrimaryBtn.style.display =
              "flex";

            callPrimaryBtn.textContent =
              "📞 Call Primary Contact";

          }

        }

      }

    }, 1000);
}
