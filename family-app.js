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
    apiKey: "YOUR_API_KEY",
    authDomain: "smartfire-guardian.firebaseapp.com",
    databaseURL: "https://smartfire-guardian-default-rtdb.firebaseio.com",
    projectId: "smartfire-guardian",
    storageBucket: "smartfire-guardian.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ==========================================
// DEVICE
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
// FIRE STATUS
// ==========================================

let emergencyActive = false;
let countdownTimer = null;


// ==========================================
// FIREBASE LISTENER
// ==========================================

onValue(
    deviceRef,
    (snapshot) => {

        const data = snapshot.val();

        if (!data) {
            connectionStatus.textContent =
                "● Device not found";

            return;
        }


        // Firebase connection is working
        connectionStatus.textContent =
            "● Connected";


        // Read the fire status
        const isFire =
            data.fireAlert === true ||
            data.status === "FIRE";


        if (isFire) {

            showEmergency();

        } else {

            hideEmergency();

        }


        // Update normal status screen
        updateNormalStatus(data.status);

    },

    (error) => {

        console.error(
            "Firebase error:",
            error
        );

        connectionStatus.textContent =
            "● Connection error";
    }
);


// ==========================================
// NORMAL STATUS
// ==========================================

function updateNormalStatus(status) {

    if (!deviceStatus) return;


    if (status === "FIRE") {

        deviceStatus.textContent = "FIRE";
        deviceStatus.className = "status fire";

        deviceStatusText.textContent =
            "Fire emergency detected.";

    }

    else if (status === "HEAT DETECTED") {

        deviceStatus.textContent =
            "HEAT DETECTED";

        deviceStatus.className =
            "status warning";

        deviceStatusText.textContent =
            "Heat detected. Smoke confirmation is being checked.";

    }

    else {

        deviceStatus.textContent =
            "SAFE";

        deviceStatus.className =
            "status safe";

        deviceStatusText.textContent =
            "No fire emergency detected.";
    }
}


// ==========================================
// SHOW EMERGENCY
// ==========================================

function showEmergency() {

    // Don't restart countdown repeatedly
    if (emergencyActive) return;

    emergencyActive = true;


    homeScreen.classList.add("hidden");

    emergencyScreen.classList.remove("hidden");


    startCountdown();
}


// ==========================================
// HIDE EMERGENCY
// ==========================================

function hideEmergency() {

    if (!emergencyActive) return;

    emergencyActive = false;


    clearInterval(countdownTimer);

    countdownTimer = null;


    emergencyScreen.classList.add("hidden");

    homeScreen.classList.remove("hidden");
}


// ==========================================
// 12 SECOND COUNTDOWN
// ==========================================

function startCountdown() {

    let seconds = 12;

    countdownElement.textContent =
        seconds;


    countdownTimer = setInterval(() => {

        seconds--;

        countdownElement.textContent =
            seconds;


        if (seconds <= 0) {

            clearInterval(countdownTimer);

            countdownTimer = null;

            startEmergencyCall();
        }

    }, 1000);
}


// ==========================================
// CANCEL BUTTON
// ==========================================

cancelEmergencyBtn.addEventListener(
    "click",
    () => {

        clearInterval(countdownTimer);

        countdownTimer = null;

        emergencyActive = false;

        emergencyScreen.classList.add("hidden");

        homeScreen.classList.remove("hidden");

    }
);


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
       IMPORTANT:

       We will NOT automatically call anyone
       from the browser yet.

       In the next steps we will add:
       1. Family member loading
       2. Primary contact selection
       3. Phone number
       4. Emergency call button
       5. Android-app compatible calling
    */
}
