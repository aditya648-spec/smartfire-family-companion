// ==========================================
// SMART FIRE GUARDIAN
// FAMILY COMPANION APP
// ==========================================


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyCjFneNv4UqsfG8i46YXSeFuuEcLL3JE2A",
    authDomain: "smartfire-guardian.firebaseapp.com",
    databaseURL: "https://smartfire-guardian-default-rtdb.firebaseio.com",
    projectId: "smartfire-guardian",
    storageBucket: "smartfire-guardian.firebasestorage.app",
    messagingSenderId: "911423950287",
    appId: "1:911423950287:web:5416e1f0ce6ef2150216ba",
    measurementId: "G-KTGH9K5HCJ"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


// ==========================================
// DEVICE CONFIGURATION
// ==========================================

const DEVICE_ID = "SF-003";

const deviceRef = ref(
    db,
    `devices/${DEVICE_ID}`
);


// ==========================================
// HTML ELEMENTS
// ==========================================

const connectionStatus =
    document.getElementById("connectionStatus");

const deviceStatus =
    document.getElementById("deviceStatus");

const deviceStatusText =
    document.getElementById("deviceStatusText");

const homeScreen =
    document.getElementById("homeScreen");

const emergencyScreen =
    document.getElementById("emergencyScreen");

const countdownElement =
    document.getElementById("countdown");

const cancelEmergencyBtn =
    document.getElementById("cancelEmergencyBtn");


// ==========================================
// VARIABLES
// ==========================================

let emergencyActive = false;

let countdownTimer = null;


// ==========================================
// FIREBASE DEVICE LISTENER
// ==========================================

onValue(
    deviceRef,

    (snapshot) => {

        const data = snapshot.val();


        // --------------------------------------
        // DEVICE NOT FOUND
        // --------------------------------------

        if (!data) {

            connectionStatus.textContent =
                "● Device not found";

            connectionStatus.classList.remove(
                "connected"
            );

            return;
        }


        // --------------------------------------
        // FIREBASE CONNECTED
        // --------------------------------------

        connectionStatus.textContent =
            "● Connected";

        connectionStatus.classList.add(
            "connected"
        );


        // --------------------------------------
        // FIRE STATUS
        // --------------------------------------

        const isFire =
            data.fireAlert === true ||
            data.status === "FIRE";


        if (isFire) {

            showEmergency();

        } else {

            hideEmergency();

        }


        // --------------------------------------
        // NORMAL STATUS
        // --------------------------------------

        updateNormalStatus(
            data.status
        );

    },

    (error) => {

        console.error(
            "Firebase error:",
            error
        );


        connectionStatus.textContent =
            "● Connection error";

        connectionStatus.classList.remove(
            "connected"
        );
    }
);


// ==========================================
// UPDATE NORMAL STATUS
// ==========================================

function updateNormalStatus(status) {

    if (!deviceStatus) {
        return;
    }


    // --------------------------------------
    // FIRE
    // --------------------------------------

    if (status === "FIRE") {

        deviceStatus.textContent =
            "FIRE";

        deviceStatus.className =
            "status fire";

        deviceStatusText.textContent =
            "Fire emergency detected.";

        return;
    }


    // --------------------------------------
    // HEAT DETECTED
    // --------------------------------------

    if (status === "HEAT DETECTED") {

        deviceStatus.textContent =
            "HEAT DETECTED";

        deviceStatus.className =
            "status warning";

        deviceStatusText.textContent =
            "Heat detected. Smoke confirmation is being checked.";

        return;
    }


    // --------------------------------------
    // SAFE
    // --------------------------------------

    deviceStatus.textContent =
        "SAFE";

    deviceStatus.className =
        "status safe";

    deviceStatusText.textContent =
        "No fire emergency detected.";
}


// ==========================================
// SHOW EMERGENCY SCREEN
// ==========================================

function showEmergency() {

    // Prevent the countdown from
    // restarting every Firebase update.

    if (emergencyActive) {
        return;
    }


    emergencyActive = true;


    // Hide normal screen

    if (homeScreen) {
        homeScreen.classList.add(
            "hidden"
        );
    }


    // Show emergency screen

    if (emergencyScreen) {
        emergencyScreen.classList.remove(
            "hidden"
        );
    }


    // Start 12 second countdown

    startCountdown();
}


// ==========================================
// HIDE EMERGENCY SCREEN
// ==========================================

function hideEmergency() {

    if (!emergencyActive) {
        return;
    }


    emergencyActive = false;


    // Stop countdown

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

        countdownTimer = null;
    }


    // Hide emergency screen

    if (emergencyScreen) {
        emergencyScreen.classList.add(
            "hidden"
        );
    }


    // Show normal screen

    if (homeScreen) {
        homeScreen.classList.remove(
            "hidden"
        );
    }
}


// ==========================================
// START 12 SECOND COUNTDOWN
// ==========================================

function startCountdown() {

    let seconds = 12;


    if (countdownElement) {

        countdownElement.textContent =
            seconds;
    }


    countdownTimer = setInterval(
        () => {

            seconds--;


            if (countdownElement) {

                countdownElement.textContent =
                    seconds;
            }


            // ----------------------------------
            // COUNTDOWN FINISHED
            // ----------------------------------

            if (seconds <= 0) {

                clearInterval(
                    countdownTimer
                );

                countdownTimer = null;


                startEmergencyCall();
            }

        },
        1000
    );
}


// ==========================================
// CANCEL EMERGENCY
// ==========================================

if (cancelEmergencyBtn) {

    cancelEmergencyBtn.addEventListener(
        "click",
        () => {

            // Stop countdown

            if (countdownTimer) {

                clearInterval(
                    countdownTimer
                );

                countdownTimer = null;
            }


            // Reset emergency state

            emergencyActive = false;


            // Return to home screen

            if (emergencyScreen) {

                emergencyScreen.classList.add(
                    "hidden"
                );
            }


            if (homeScreen) {

                homeScreen.classList.remove(
                    "hidden"
                );
            }

        }
    );
}


// ==========================================
// EMERGENCY CALL
// ==========================================

function startEmergencyCall() {

    console.log(
        "Emergency countdown finished."
    );


    console.log(
        "Primary family contact call should start here."
    );


    /*
    ==========================================
    IMPORTANT
    ==========================================

    We are NOT automatically calling anyone
    yet.

    The next part of the project will add:

    1. Read family members from Firebase
    2. Find the primary family member
    3. Read their phone number
    4. Display the emergency contact
    5. Add the call action
    6. Prepare it for Android conversion
    7. Add police/fire-station information
    8. Add the emergency location
    ==========================================
    */
}


console.log(
    "SmartFire Family Companion started."
);
