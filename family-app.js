import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* ==========================================
   FIREBASE CONFIG
   ========================================== */

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "smartfire-guardian.firebaseapp.com",
    databaseURL: "https://smartfire-guardian-default-rtdb.firebaseio.com",
    projectId: "smartfire-guardian",
    storageBucket: "smartfire-guardian.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};


const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


/* ==========================================
   DEVICE
   ========================================== */

const DEVICE_ID = "SF-003";


const deviceRef = ref(
    db,
    `devices/${DEVICE_ID}`
);


const familyRef = ref(
    db,
    `familyMembers/${DEVICE_ID}`
);


/* ==========================================
   EMERGENCY LOCATIONS
   ========================================== */

const LOCATIONS = {

    device: {
        lat: 15.855881303189477,
        lng: 74.57802140000477,
        name: "YOUR LOCATION",
        icon: "📍"
    },

    police: {
        lat: 15.881842260513212,
        lng: 74.52917008030238,
        name: "NEAREST POLICE STATION",
        icon: "🚓"
    },

    fire: {
        lat: 15.845029016505203,
        lng: 74.50745329043593,
        name: "NEAREST FIRE STATION",
        icon: "🚒"
    }

};


/* ==========================================
   APP STATE
   ========================================== */

let emergencyActive = false;

let countdownTimer = null;

let primaryContact = null;

let emergencyMap = null;


/* ==========================================
   DOM READY
   ========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeFamilyApp();

    }
);


/* ==========================================
   INITIALIZE APP
   ========================================== */

function initializeFamilyApp() {

    console.log(
        "SmartFire Family Companion loaded."
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


    /* ======================================
       MANAGE FAMILY BUTTON
       ====================================== */

    if (manageFamilyBtn) {

        manageFamilyBtn.type =
            "button";


        manageFamilyBtn.addEventListener(
            "click",
            () => {

                console.log(
                    "Manage Family clicked."
                );


                if (familyManagement) {

                    familyManagement.classList.remove(
                        "hidden"
                    );

                }

            }
        );

    }


    /* ======================================
       FAMILY MEMBERS
       ====================================== */

    if (familyList) {

        onValue(

            familyRef,

            (snapshot) => {

                const members =
                    snapshot.val();


                primaryContact = null;


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


                familyList.innerHTML = "";


                Object.entries(
                    members
                ).forEach(
                    ([memberId, member]) => {


                        /* ==========================
                           PRIMARY CONTACT
                           ========================== */

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

                        }


                        /* ==========================
                           MEMBER CARD
                           ========================== */

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

            },

            (error) => {

                console.error(
                    "Family Firebase error:",
                    error
                );

            }

        );

    }


    /* ======================================
       FIREBASE DEVICE LISTENER
       ====================================== */

    onValue(

        deviceRef,

        (snapshot) => {

            const data =
                snapshot.val();


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


            /* ==============================
               CONNECTION
               ============================== */

            if (connectionStatus) {

                connectionStatus.textContent =
                    "● Connected";

                connectionStatus.classList.add(
                    "connected"
                );

            }


            /* ==============================
               FIRE CHECK
               ============================== */

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


            /* ==============================
               NORMAL STATUS
               ============================== */

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


    /* ======================================
       CANCEL EMERGENCY
       ====================================== */

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


/* ==========================================
   NORMAL STATUS
   ========================================== */

function updateNormalStatus(

    status,

    deviceStatus,

    deviceStatusText

) {

    if (!deviceStatus) {
        return;
    }


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


    deviceStatus.textContent =
        "SAFE";

    deviceStatus.className =
        "status safe";


    if (deviceStatusText) {

        deviceStatusText.textContent =
            "No fire emergency detected.";

    }

}


/* ==========================================
   SHOW EMERGENCY
   ========================================== */

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


    if (homeScreen) {

        homeScreen.classList.add(
            "hidden"
        );

    }


    if (emergencyScreen) {

        emergencyScreen.classList.remove(
            "hidden"
        );

    }


    /* ======================================
       CREATE MAP
       ====================================== */

    setTimeout(
        () => {

            initializeEmergencyMap();

        },
        100
    );


    /* ======================================
       START COUNTDOWN
       ====================================== */

    startCountdown(
        countdownElement
    );

}


/* ==========================================
   HIDE EMERGENCY
   ========================================== */

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

        countdownTimer = null;

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


/* ==========================================
   INITIALIZE EMERGENCY MAP
   ========================================== */

function initializeEmergencyMap() {

    const mapElement =
        document.getElementById(
            "emergencyMap"
        );


    if (!mapElement) {

        console.error(
            "Emergency map element not found."
        );

        return;

    }


    /* ======================================
       IF MAP ALREADY EXISTS
       ====================================== */

    if (emergencyMap) {

        emergencyMap.invalidateSize();

        emergencyMap.fitBounds(

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

            ],

            {
                padding: [30, 30]
            }

        );

        return;

    }


    /* ======================================
       CREATE MAP
       ====================================== */

    emergencyMap =
        L.map(
            "emergencyMap",
            {
                zoomControl: true
            }
        );


    /* ======================================
       OPEN STREET MAP
       ====================================== */

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(
        emergencyMap
    );


    /* ======================================
       MARKERS
       ====================================== */

    const deviceMarker =
        createEmergencyMarker(

            LOCATIONS.device,

            "device"

        );


    const policeMarker =
        createEmergencyMarker(

            LOCATIONS.police,

            "police"

        );


    const fireMarker =
        createEmergencyMarker(

            LOCATIONS.fire,

            "fire"

        );


    deviceMarker
        .addTo(emergencyMap)
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


    policeMarker
        .addTo(emergencyMap)
        .bindPopup(`

            <div class="map-popup-title">
                🚓 NEAREST POLICE STATION
            </div>

            <div class="map-popup-info">
                Emergency response location
            </div>

        `);


    fireMarker
        .addTo(emergencyMap)
        .bindPopup(`

            <div class="map-popup-title">
                🚒 NEAREST FIRE STATION
            </div>

            <div class="map-popup-info">
                Emergency response location
            </div>

        `);


    /* ======================================
       RESPONSE LINES
       ====================================== */

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
            weight: 3,
            dashArray: "8, 8"
        }

    ).addTo(
        emergencyMap
    );


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
            weight: 3,
            dashArray: "8, 8"
        }

    ).addTo(
        emergencyMap
    );


    /* ======================================
       SHOW ALL LOCATIONS
       ====================================== */

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
            padding: [35, 35],

            maxZoom: 14
        }

    );


    console.log(
        "Emergency map initialized."
    );

}


/* ==========================================
   CREATE MAP MARKER
   ========================================== */

function createEmergencyMarker(

    location,

    type

) {

    let markerClass =
        "emergency-map-marker";


    if (type === "device") {

        markerClass +=
            " emergency-device-marker";

    }


    if (type === "police") {

        markerClass +=
            " emergency-police-marker";

    }


    if (type === "fire") {

        markerClass +=
            " emergency-fire-marker";

    }


    const icon =
        L.divIcon({

            className: "",

            html: `

                <div class="${markerClass}">
                    ${location.icon}
                </div>

            `,

            iconSize: [
                38,
                38
            ],

            iconAnchor: [
                19,
                19
            ],

            popupAnchor: [
                0,
                -20
            ]

        });


    return L.marker(

        [
            location.lat,
            location.lng
        ],

        {
            icon: icon
        }

    );

}


/* ==========================================
   COUNTDOWN
   ========================================== */

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


/* ==========================================
   EMERGENCY CALL
   ========================================== */

function startEmergencyCall() {

    console.log(
        "Emergency countdown finished."
    );


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
       Actual automatic calling will be handled
       after the website is converted to Android.
    */

}


/* ==========================================
   HTML ESCAPE
   ========================================== */

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
