/* =========================================================
   SMART FIRE GUARDIAN
   FAMILY COMPANION
   ========================================================= */


/* =========================================================
   FIREBASE
   ========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/*
   IMPORTANT:

   Keep the Firebase Web App configuration that is
   already working in your current family-app.js.

   Do NOT use your ESP32 Firebase database secret here.
*/

const firebaseConfig = {

    apiKey: "PASTE_YOUR_EXISTING_WEB_APP_API_KEY",

    authDomain:
        "smartfire-guardian.firebaseapp.com",

    databaseURL:
        "https://smartfire-guardian-default-rtdb.firebaseio.com",

    projectId:
        "smartfire-guardian",

    storageBucket:
        "smartfire-guardian.firebasestorage.app",

    messagingSenderId:
        "PASTE_YOUR_EXISTING_MESSAGING_SENDER_ID",

    appId:
        "PASTE_YOUR_EXISTING_APP_ID",

    measurementId:
        "PASTE_YOUR_EXISTING_MEASUREMENT_ID"

};


const app =
    initializeApp(
        firebaseConfig
    );


const db =
    getDatabase(
        app
    );


/* =========================================================
   DEVICE
   ========================================================= */

const DEVICE_ID =
    "SF-003";


const deviceRef =
    ref(
        db,
        `devices/${DEVICE_ID}`
    );


const familyRef =
    ref(
        db,
        `familyMembers/${DEVICE_ID}`
    );


/* =========================================================
   EMERGENCY LOCATIONS
   ========================================================= */

const LOCATIONS = {

    device: {

        lat:
            15.855881303189477,

        lng:
            74.57802140000477,

        name:
            "YOUR LOCATION",

        icon:
            "📍"

    },


    police: {

        lat:
            15.881842260513212,

        lng:
            74.52917008030238,

        name:
            "NEAREST POLICE STATION",

        icon:
            "🚓"

    },


    fire: {

        lat:
            15.845029016505203,

        lng:
            74.50745329043593,

        name:
            "NEAREST FIRE STATION",

        icon:
            "🚒"

    }

};


/* =========================================================
   STATE
   ========================================================= */

let emergencyActive =
    false;


let countdownTimer =
    null;


let primaryContact =
    null;


let emergencyMap =
    null;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeFamilyApp
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeFamilyApp() {

    console.log(
        "SMART FIRE FAMILY COMPANION STARTED"
    );


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


    const cancelButton =
        document.getElementById(
            "cancelEmergencyBtn"
        );


    const manageFamilyButton =
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


    /* =====================================================
       MANAGE FAMILY
       ===================================================== */

    if (
        manageFamilyButton &&
        familyManagement
    ) {

        manageFamilyButton.addEventListener(
            "click",
            () => {

                familyManagement.classList.remove(
                    "hidden"
                );


                familyManagement.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });

            }
        );

    }


    /* =====================================================
       LOAD FAMILY MEMBERS
       ===================================================== */

    if (familyList) {

        onValue(

            familyRef,

            (snapshot) => {

                const members =
                    snapshot.val();


                primaryContact =
                    null;


                if (!members) {

                    familyList.innerHTML = `

                        <div class="family-empty">

                            <strong>
                                No family members registered.
                            </strong>

                            <div>
                                Add family members from
                                the Family Members page.
                            </div>

                        </div>

                    `;

                    return;

                }


                familyList.innerHTML =
                    "";


                Object.entries(
                    members
                ).forEach(
                    ([memberId, member]) => {


                        /* =================================
                           PRIMARY CONTACT
                           ================================= */

                        if (
                            member &&
                            member.isPrimary === true
                        ) {

                            primaryContact = {

                                id:
                                    memberId,

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

                        }


                        /* =================================
                           MEMBER CARD
                           ================================= */

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


                console.log(
                    "Primary contact:",
                    primaryContact
                );

            },

            (error) => {

                console.error(
                    "Family Firebase error:",
                    error
                );


                familyList.innerHTML = `

                    <div class="family-empty">

                        Unable to load family members.

                    </div>

                `;

            }

        );

    }


    /* =====================================================
       DEVICE FIREBASE LISTENER
       ===================================================== */

    onValue(

        deviceRef,

        (snapshot) => {

            const data =
                snapshot.val();


            console.log(
                "DEVICE DATA:",
                data
            );


            if (!data) {

                setConnection(
                    connectionStatus,
                    false,
                    "Device not found"
                );

                return;

            }


            /* =============================================
               CONNECTED
               ============================================= */

            setConnection(
                connectionStatus,
                true,
                "Connected"
            );


            /* =============================================
               FIRE STATUS
               ============================================= */

            const isFire =
                data.fireAlert === true ||
                data.status === "FIRE";


            if (isFire) {

                showEmergency(

                    homeScreen,

                    emergencyScreen,

                    countdownElement

                );

            }

            else {

                hideEmergency(

                    homeScreen,

                    emergencyScreen

                );

            }


            /* =============================================
               NORMAL STATUS
               ============================================= */

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


            setConnection(

                connectionStatus,

                false,

                "Connection error"

            );

        }

    );


    /* =====================================================
       CANCEL BUTTON
       ===================================================== */

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelEmergency
        );

    }

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function setConnection(
    element,
    connected,
    text
) {

    if (!element) {
        return;
    }


    element.classList.toggle(
        "connected",
        connected
    );


    element.innerHTML = `

        <span class="connection-dot"></span>

        ${text}

    `;

}


/* =========================================================
   NORMAL STATUS
   ========================================================= */

function updateNormalStatus(

    status,

    deviceStatus,

    deviceStatusText

) {

    if (!deviceStatus) {
        return;
    }


    if (
        status === "FIRE"
    ) {

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


    if (
        status === "HEAT DETECTED"
    ) {

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


    deviceStatus.textContent =
        "SAFE";

    deviceStatus.className =
        "status safe";


    if (deviceStatusText) {

        deviceStatusText.textContent =
            "No fire emergency detected.";

    }

}


/* =========================================================
   SHOW EMERGENCY
   ========================================================= */

function showEmergency(

    homeScreen,

    emergencyScreen,

    countdownElement

) {

    if (emergencyActive) {

        if (emergencyMap) {

            setTimeout(
                () => {

                    emergencyMap.invalidateSize();

                },
                100
            );

        }

        return;

    }


    emergencyActive =
        true;


    /* ==============================================
       HIDE HOME
       ============================================== */

    if (homeScreen) {

        homeScreen.classList.add(
            "hidden"
        );

    }


    /* ==============================================
       SHOW EMERGENCY
       ============================================== */

    if (emergencyScreen) {

        emergencyScreen.classList.remove(
            "hidden"
        );

    }


    /* ==============================================
       CREATE MAP
       ============================================== */

    setTimeout(
        () => {

            initializeEmergencyMap();

        },
        150
    );


    /* ==============================================
       START COUNTDOWN
       ============================================== */

    startCountdown(
        countdownElement
    );

}


/* =========================================================
   HIDE EMERGENCY
   ========================================================= */

function hideEmergency(

    homeScreen,

    emergencyScreen

) {

    if (!emergencyActive) {
        return;
    }


    emergencyActive =
        false;


    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

        countdownTimer =
            null;

    }


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


/* =========================================================
   EMERGENCY MAP
   ========================================================= */

function initializeEmergencyMap() {

    const mapElement =
        document.getElementById(
            "emergencyMap"
        );


    if (!mapElement) {

        console.error(
            "Emergency map element missing."
        );

        return;

    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet did not load."
        );

        mapElement.innerHTML = `

            <div style="
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#6b7280;
                font-size:14px;
            ">

                Map could not be loaded.

            </div>

        `;

        return;

    }


    /* =====================================================
       MAP ALREADY CREATED
       ===================================================== */

    if (emergencyMap) {

        emergencyMap.invalidateSize();


        fitEmergencyMap();


        return;

    }


    /* =====================================================
       CREATE
       ===================================================== */

    emergencyMap =
        L.map(
            mapElement,
            {
                zoomControl:
                    true
            }
        );


    /* =====================================================
       OPENSTREETMAP
       ===================================================== */

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(
        emergencyMap
    );


    /* =====================================================
       YOUR LOCATION
       ===================================================== */

    const deviceMarker =
        createMarker(
            LOCATIONS.device
        );


    deviceMarker
        .addTo(
            emergencyMap
        )
        .bindPopup(`

            <div class="map-popup-title">
                📍 YOUR LOCATION
            </div>

            <div class="map-popup-info">

                ABC Apartments<br>

                Floor 3<br>

                Room 302

            </div>

        `);


    /* =====================================================
       POLICE
       ===================================================== */

    const policeMarker =
        createMarker(
            LOCATIONS.police
        );


    policeMarker
        .addTo(
            emergencyMap
        )
        .bindPopup(`

            <div class="map-popup-title">
                🚓 NEAREST POLICE STATION
            </div>

            <div class="map-popup-info">

                Emergency response point

            </div>

        `);


    /* =====================================================
       FIRE STATION
       ===================================================== */

    const fireMarker =
        createMarker(
            LOCATIONS.fire
        );


    fireMarker
        .addTo(
            emergencyMap
        )
        .bindPopup(`

            <div class="map-popup-title">
                🚒 NEAREST FIRE STATION
            </div>

            <div class="map-popup-info">

                Emergency response point

            </div>

        `);


    /* =====================================================
       DEVICE → POLICE
       ===================================================== */

    L.polyline(

        [

            [
                LOCATIONS.device.lat,
                LOCATIONS.device.lng
            ],

            [
                LOCATIONS.police.lat,
                LOCATIONS.police.lng
            ]

        ],

        {

            weight:
                3,

            opacity:
                0.75,

            dashArray:
                "8, 8"

        }

    ).addTo(
        emergencyMap
    );


    /* =====================================================
       DEVICE → FIRE STATION
       ===================================================== */

    L.polyline(

        [

            [
                LOCATIONS.device.lat,
                LOCATIONS.device.lng
            ],

            [
                LOCATIONS.fire.lat,
                LOCATIONS.fire.lng
            ]

        ],

        {

            weight:
                3,

            opacity:
                0.75,

            dashArray:
                "8, 8"

        }

    ).addTo(
        emergencyMap
    );


    /* =====================================================
       FIT MAP
       ===================================================== */

    fitEmergencyMap();


    /* =====================================================
       FIX LEAFLET SIZE
       ===================================================== */

    setTimeout(
        () => {

            if (emergencyMap) {

                emergencyMap.invalidateSize();

                fitEmergencyMap();

            }

        },
        400
    );


    console.log(
        "EMERGENCY MAP READY"
    );

}


/* =========================================================
   CREATE MAP MARKER
   ========================================================= */

function createMarker(
    location
) {

    const icon =
        L.divIcon({

            className:
                "",

            html: `

                <div class="emergency-map-marker">

                    ${location.icon}

                </div>

            `,

            iconSize:
                [
                    42,
                    42
                ],

            iconAnchor:
                [
                    21,
                    21
                ],

            popupAnchor:
                [
                    0,
                    -23
                ]

        });


    return L.marker(

        [
            location.lat,
            location.lng
        ],

        {
            icon:
                icon
        }

    );

}


/* =========================================================
   FIT MAP TO ALL THREE LOCATIONS
   ========================================================= */

function fitEmergencyMap() {

    if (!emergencyMap) {
        return;
    }


    const bounds =
        L.latLngBounds(

            [

                [
                    LOCATIONS.device.lat,
                    LOCATIONS.device.lng
                ],

                [
                    LOCATIONS.police.lat,
                    LOCATIONS.police.lng
                ],

                [
                    LOCATIONS.fire.lat,
                    LOCATIONS.fire.lng
                ]

            ]

        );


    emergencyMap.fitBounds(

        bounds,

        {

            padding:
                [
                    35,
                    35
                ],

            maxZoom:
                14

        }

    );

}


/* =========================================================
   COUNTDOWN
   ========================================================= */

function startCountdown(
    countdownElement
) {

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

    }


    let seconds =
        12;


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


                if (
                    seconds <= 0
                ) {

                    clearInterval(
                        countdownTimer
                    );

                    countdownTimer =
                        null;


                    startEmergencyCall();

                }

            },
            1000
        );

}


/* =========================================================
   CANCEL
   ========================================================= */

function cancelEmergency() {

    console.log(
        "Emergency cancelled by user."
    );


    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

        countdownTimer =
            null;

    }


    emergencyActive =
        false;


    const emergencyScreen =
        document.getElementById(
            "emergencyScreen"
        );


    const homeScreen =
        document.getElementById(
            "homeScreen"
        );


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


/* =========================================================
   EMERGENCY CALL
   ========================================================= */

function startEmergencyCall() {

    console.log(
        "12 second emergency countdown finished."
    );


    if (!primaryContact) {

        console.error(
            "No primary family contact found."
        );

        return;

    }


    if (!primaryContact.phone) {

        console.error(
            "Primary family contact has no phone number."
        );

        return;

    }


    console.log(
        "Primary contact:",
        primaryContact.name
    );


    console.log(
        "Phone:",
        primaryContact.phone
    );


    /*
       IMPORTANT:

       The website will NOT silently place a phone
       call in the background.

       When this becomes an Android application,
       we will add the Android-compatible calling
       behavior.
    */

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

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
