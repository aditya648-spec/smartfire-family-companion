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
// DEVICE
// ==========================================

const DEVICE_ID = "SF-003";

const deviceRef = ref(
    db,
    `devices/${DEVICE_ID}`
);


// ==========================================
// FAMILY
// ==========================================

const familyRef = ref(
    db,
    `familyMembers/${DEVICE_ID}`
);


// ==========================================
// VARIABLES
// ==========================================

let emergencyActive = false;

let countdownTimer = null;


// ==========================================
// WAIT FOR HTML
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeFamilyApp();

    }
);


// ==========================================
// INITIALIZE APP
// ==========================================

function initializeFamilyApp() {

    console.log(
        "SmartFire Family Companion loaded."
    );


    // --------------------------------------
    // GET HTML ELEMENTS
    // --------------------------------------

    const connectionStatus =
        document.getElementById(
            "connectionStatus"
        );

    const deviceStatus =
        document.getElementById(
            "deviceStatus"
        );

    const deviceStatusText =
        document.getElementById(
            "deviceStatusText"
        );

    const homeScreen =
        document.getElementById(
            "homeScreen"
        );

    const emergencyScreen =
        document.getElementById(
            "emergencyScreen"
        );

    const countdownElement =
        document.getElementById(
            "countdown"
        );

    const cancelEmergencyBtn =
        document.getElementById(
            "cancelEmergencyBtn"
        );

    const manageFamilyBtn =
        document.getElementById(
            "manageFamilyBtn"
        );

    const familyManagement =
        document.getElementById(
            "familyManagement"
        );

    const familyList =
        document.getElementById(
            "familyList"
        );


    // ======================================
    // CHECK ELEMENTS
    // ======================================

    console.log(
        "Manage Family button:",
        manageFamilyBtn
    );

    console.log(
        "Family section:",
        familyManagement
    );


    // ======================================
    // MANAGE FAMILY BUTTON
    // ======================================

    if (manageFamilyBtn) {

        manageFamilyBtn.type = "button";


        manageFamilyBtn.addEventListener(
            "click",
            function () {

                console.log(
                    "Manage Family clicked."
                );


                // Show family management

                if (familyManagement) {

                    familyManagement.classList.remove(
                        "hidden"
                    );

                    // Extra safety:
                    // force it to display

                    familyManagement.style.display =
                        "block";
                }


                // Scroll to family section

                if (familyManagement) {

                    setTimeout(
                        () => {

                            familyManagement.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        },
                        100
                    );
                }

            }
        );

    } else {

        console.error(
            "Manage Family button was not found!"
        );

    }


    // ======================================
    // LOAD FAMILY MEMBERS
    // ======================================

    if (familyList) {

        onValue(
            familyRef,

            (snapshot) => {

                const members =
                    snapshot.val();


                console.log(
                    "Family data:",
                    members
                );


                // ----------------------------------
                // NO MEMBERS
                // ----------------------------------

                if (!members) {

                    familyList.innerHTML = `

                        <div class="family-empty">

                            <strong>
                                No family members registered.
                            </strong>

                            <p>
                                Add family members from
                                the Family Members page.
                            </p>

                        </div>

                    `;

                    return;
                }


                // ----------------------------------
                // CLEAR LIST
                // ----------------------------------

                familyList.innerHTML = "";


                // ----------------------------------
                // DISPLAY MEMBERS
                // ----------------------------------

                Object.entries(
                    members
                ).forEach(
                    ([memberId, member]) => {


                        const card =
                            document.createElement(
                                "div"
                            );


                        card.className =
                            "family-member";


                        const name =
                            escapeHTML(
                                member.name ||
                                "Unnamed"
                            );


                        const relation =
                            escapeHTML(
                                member.relation ||
                                "Family"
                            );


                        const phone =
                            escapeHTML(
                                member.phone ||
                                "No phone number"
                            );


                        const primary =
                            member.isPrimary === true;


                        card.innerHTML = `

                            <div class="family-member-name">
                                ${name}
                            </div>

                            <div class="family-member-relation">
                                ${relation}
                            </div>

                            <div class="family-member-phone">
                                📞 ${phone}
                            </div>

                            <div class="family-member-primary">
                                ${
                                    primary
                                    ? "⭐ Primary Contact"
                                    : "Family Member"
                                }
                            </div>

                        `;


                        familyList.appendChild(
                            card
                        );

                    }
                );

            },

            (error) => {

                console.error(
                    "Family Firebase error:",
                    error
                );


                familyList.innerHTML = `

                    <p>
                        Unable to load family members.
                    </p>

                `;

            }
        );

    }


    // ======================================
    // DEVICE FIREBASE LISTENER
    // ======================================

    onValue(
        deviceRef,

        (snapshot) => {

            const data =
                snapshot.val();


            // ----------------------------------
            // DEVICE NOT FOUND
            // ----------------------------------

            if (!data) {

                if (connectionStatus) {

                    connectionStatus.textContent =
                        "● Device not found";

                    connectionStatus.classList.remove(
                        "connected"
                    );

                }

                return;
            }


            // ----------------------------------
            // CONNECTED
            // ----------------------------------

            if (connectionStatus) {

                connectionStatus.textContent =
                    "● Connected";

                connectionStatus.classList.add(
                    "connected"
                );

            }


            // ----------------------------------
            // FIRE CHECK
            // ----------------------------------

            const isFire =
                data.fireAlert === true ||
                data.status === "FIRE";


            if (isFire) {

                showEmergency(
                    homeScreen,
                    emergencyScreen,
                    countdownElement
                );

            } else {

                hideEmergency(
                    homeScreen,
                    emergencyScreen
                );

            }


            // ----------------------------------
            // STATUS
            // ----------------------------------

            updateNormalStatus(
                data.status,
                deviceStatus,
                deviceStatusText
            );

        },

        (error) => {

            console.error(
                "Device Firebase error:",
                error
            );


            if (connectionStatus) {

                connectionStatus.textContent =
                    "● Connection error";

                connectionStatus.classList.remove(
                    "connected"
                );

            }

        }
    );


    // ======================================
    // CANCEL EMERGENCY
    // ======================================

    if (cancelEmergencyBtn) {

        cancelEmergencyBtn.type =
            "button";


        cancelEmergencyBtn.addEventListener(
            "click",
            () => {

                console.log(
                    "Emergency cancelled."
                );


                if (countdownTimer) {

                    clearInterval(
                        countdownTimer
                    );

                    countdownTimer = null;
                }


                emergencyActive =
                    false;


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

}


// ==========================================
// UPDATE NORMAL STATUS
// ==========================================

function updateNormalStatus(
    status,
    deviceStatus,
    deviceStatusText
) {

    if (!deviceStatus) {
        return;
    }


    // FIRE

    if (status === "FIRE") {

        deviceStatus.textContent =
            "FIRE";

        deviceStatus.className =
            "status fire";


        if (deviceStatusText) {

            deviceStatusText.textContent =
                "Fire emergency detected.";

        }

        return;
    }


    // HEAT

    if (status === "HEAT DETECTED") {

        deviceStatus.textContent =
            "HEAT DETECTED";

        deviceStatus.className =
            "status warning";


        if (deviceStatusText) {

            deviceStatusText.textContent =
                "Heat detected. Smoke confirmation is being checked.";

        }

        return;
    }


    // SAFE

    deviceStatus.textContent =
        "SAFE";

    deviceStatus.className =
        "status safe";


    if (deviceStatusText) {

        deviceStatusText.textContent =
            "No fire emergency detected.";

    }

}


// ==========================================
// SHOW EMERGENCY
// ==========================================

function showEmergency(
    homeScreen,
    emergencyScreen,
    countdownElement
) {

    // Don't restart countdown

    if (emergencyActive) {
        return;
    }


    emergencyActive =
        true;


    // Hide home

    if (homeScreen) {

        homeScreen.classList.add(
            "hidden"
        );

    }


    // Show emergency

    if (emergencyScreen) {

        emergencyScreen.classList.remove(
            "hidden"
        );

    }


    // Start countdown

    startCountdown(
        countdownElement
    );

}


// ==========================================
// HIDE EMERGENCY
// ==========================================

function hideEmergency(
    homeScreen,
    emergencyScreen
) {

    if (!emergencyActive) {
        return;
    }


    emergencyActive =
        false;


    // Stop countdown

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

        countdownTimer = null;

    }


    // Hide emergency

    if (emergencyScreen) {

        emergencyScreen.classList.add(
            "hidden"
        );

    }


    // Show home

    if (homeScreen) {

        homeScreen.classList.remove(
            "hidden"
        );

    }

}


// ==========================================
// COUNTDOWN
// ==========================================

function startCountdown(
    countdownElement
) {

    let seconds = 12;


    if (countdownElement) {

        countdownElement.textContent =
            seconds;

    }


    countdownTimer =
        setInterval(
            () => {

                seconds--;


                if (countdownElement) {

                    countdownElement.textContent =
                        seconds;

                }


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
// EMERGENCY CALL
// ==========================================

function startEmergencyCall() {

    console.log(
        "Emergency countdown finished."
    );

    console.log(
        "Primary family contact call will be added next."
    );

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
