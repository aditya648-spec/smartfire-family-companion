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

// Stores the primary family contact
let primaryContact = null;


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


    // ======================================
    // HTML ELEMENTS
    // ======================================

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
    // DEBUG
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

        manageFamilyBtn.type =
            "button";


        manageFamilyBtn.addEventListener(
            "click",
            function () {

                console.log(
                    "Manage Family clicked."
                );


                if (familyManagement) {

                    familyManagement.classList.remove(
                        "hidden"
                    );

                    familyManagement.style.display =
                        "block";

                }


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


                // Reset primary contact
                // every time Firebase updates

                primaryContact = null;


                // ==================================
                // NO FAMILY MEMBERS
                // ==================================

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


                // ==================================
                // CLEAR OLD LIST
                // ==================================

                familyList.innerHTML = "";


                // ==================================
                // LOOP THROUGH FAMILY MEMBERS
                // ==================================

                Object.entries(
                    members
                ).forEach(
                    ([memberId, member]) => {


                        // ==================================
                        // CHECK PRIMARY CONTACT
                        // ==================================

                        if (
                            member.isPrimary === true
                        ) {

                            primaryContact = {

                                id: memberId,

                                name:
                                    member.name ||
                                    "Family Member",

                                phone:
                                    member.phone ||
                                    "",

                                relation:
                                    member.relation ||
                                    ""

                            };


                            console.log(
                                "Primary contact found:",
                                primaryContact
                            );

                        }


                        // ==================================
                        // CREATE MEMBER CARD
                        // ==================================

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


                        const isPrimary =
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
                                    isPrimary
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


                // ==================================
                // PRIMARY CONTACT RESULT
                // ==================================

                if (primaryContact) {

                    console.log(
                        "================================"
                    );

                    console.log(
                        "PRIMARY FAMILY CONTACT"
                    );

                    console.log(
                        "Name:",
                        primaryContact.name
                    );

                    console.log(
                        "Phone:",
                        primaryContact.phone
                    );

                    console.log(
                        "Relation:",
                        primaryContact.relation
                    );

                    console.log(
                        "================================"
                    );

                } else {

                    console.warn(
                        "No primary family contact found."
                    );

                }

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


            // ==================================
            // DEVICE NOT FOUND
            // ==================================

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


            // ==================================
            // CONNECTED
            // ==================================

            if (connectionStatus) {

                connectionStatus.textContent =
                    "● Connected";

                connectionStatus.classList.add(
                    "connected"
                );

            }


            // ==================================
            // FIRE STATUS
            // ==================================

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


            // ==================================
            // NORMAL STATUS
            // ==================================

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


    // ======================================
    // FIRE
    // ======================================

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


    // ======================================
    // HEAT DETECTED
    // ======================================

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


    // ======================================
    // SAFE
    // ======================================

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
// 12 SECOND COUNTDOWN
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


    // ======================================
    // CHECK PRIMARY CONTACT
    // ======================================

    if (!primaryContact) {

        console.error(
            "Cannot start call: no primary family contact."
        );

        return;
    }


    if (!primaryContact.phone) {

        console.error(
            "Cannot start call: primary contact has no phone number."
        );

        return;
    }


    console.log(
        "Primary contact:",
        primaryContact.name
    );


    console.log(
        "Primary contact phone:",
        primaryContact.phone
    );


    /*
    ==========================================
    CALLING WILL BE ADDED NEXT
    ==========================================

    We will later use the primary contact's
    phone number here.

    The browser version cannot reliably make
    an unattended phone call by itself.

    When we convert this website into an
    Android app, we'll implement the proper
    Android-compatible calling behavior.
    ==========================================
    */

}


// ==========================================
// HTML SECURITY HELPER
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
