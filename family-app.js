/* =========================================================
   SMARTFIRE GUARDIAN
   FAMILY COMPANION
   ========================================================= */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  remove,
  update
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

  /*
   * IMPORTANT:
   * Put your Firebase Web App API key here.
   *
   * Do NOT put your Firebase database secret here.
   */

  apiKey: "YOUR_FIREBASE_WEB_API_KEY",

  authDomain:
    "smartfire-guardian.firebaseapp.com",

  databaseURL:
    "https://smartfire-guardian-default-rtdb.firebaseio.com",

  projectId:
    "smartfire-guardian",

  storageBucket:
    "smartfire-guardian.firebasestorage.app",

  messagingSenderId:
    "911423950287",

  appId:
    "1:911423950287:web:5416e1f0ce6ef2150216ba",

  measurementId:
    "G-KTGH9K5HCJ"
};


/* =========================================================
   FIREBASE
   ========================================================= */

const app =
  initializeApp(firebaseConfig);

const db =
  getDatabase(app);


/* =========================================================
   CONFIGURATION
   ========================================================= */

const DEVICE_ID = "SF-003";

const DEVICE_PATH =
  `devices/${DEVICE_ID}`;

const FAMILY_PATH =
  `familyMembers/${DEVICE_ID}`;


/*
 * Device location
 */

const DEVICE_LAT =
  15.855881303189477;

const DEVICE_LNG =
  74.57802140000477;


/*
 * Emergency service locations
 */

const POLICE_LAT =
  15.881842260513212;

const POLICE_LNG =
  74.52917008030238;

const FIRE_STATION_LAT =
  15.845029016505203;

const FIRE_STATION_LNG =
  74.50745329043593;


/*
 * Fallback thresholds.
 *
 * The application will use the threshold
 * received from Firebase when available.
 */

const DEFAULT_GAS_THRESHOLD = 1600;

const DEFAULT_FIRE_THRESHOLD = 5000;


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let deviceData = {};

let familyMembers = {};

let primaryContact = null;

let currentScreen = "home";

let emergencyActive = false;

let emergencyMap = null;

let emergencyMarkers = [];

let emergencyLines = [];

let pickerMap = null;

let pickerMarker = null;

let selectedLatitude = null;

let selectedLongitude = null;

let countdownTimer = null;

let countdownStarted = false;


/* =========================================================
   DOM HELPER
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   SAFE TEXT
   ========================================================= */

function escapeHtml(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   NUMBER HELPER
   ========================================================= */

function numberValue(value, fallback = 0) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

  const toast = $("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 2500);
}


/* =========================================================
   CONNECTION UI
   ========================================================= */

function setConnection(online) {

  const dot =
    $("connectionDot");

  const text =
    $("connectionText");

  const deviceDot =
    $("deviceStatusDot");

  const deviceText =
    $("deviceStatusText");


  if (online) {

    dot?.classList.remove("offline");
    dot?.classList.add("online");

    text.textContent =
      "Connected";

    deviceDot?.classList.remove("offline");
    deviceDot?.classList.add("online");

    deviceText.textContent =
      "Connected";

  } else {

    dot?.classList.remove("online");
    dot?.classList.add("offline");

    text.textContent =
      "Offline";

    deviceDot?.classList.remove("online");
    deviceDot?.classList.add("offline");

    deviceText.textContent =
      "Offline";
  }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showScreen(screen) {

  const screens = {

    home:
      $("homeScreen"),

    family:
      $("familyScreen"),

    emergency:
      $("emergencyScreen")

  };


  Object.values(screens)
    .forEach(element => {

      element?.classList.remove("active");

    });


  screens[screen]?.classList.add("active");


  currentScreen =
    screen;


  $("homeNavBtn")
    ?.classList.toggle(
      "active",
      screen === "home"
    );

  $("familyNavBtn")
    ?.classList.toggle(
      "active",
      screen === "family"
    );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (screen === "emergency") {

    setTimeout(() => {

      if (emergencyMap) {
        emergencyMap.invalidateSize();
      }

    }, 300);
  }
}


/* =========================================================
   NAV EVENTS
   ========================================================= */

$("homeNavBtn")
  ?.addEventListener("click", () => {

    showScreen("home");

  });


$("familyNavBtn")
  ?.addEventListener("click", () => {

    showScreen("family");

  });


$("manageFamilyBtn")
  ?.addEventListener("click", () => {

    showScreen("family");

  });


$("backHomeBtn")
  ?.addEventListener("click", () => {

    showScreen("home");

  });


/* =========================================================
   DEVICE DATA EXTRACTION
   ========================================================= */

function getGasData(data) {

  const sensors =
    data?.sensors || {};

  const gas =
    sensors.gas || {};

  return {

    raw:
      numberValue(
        gas.raw ??
        gas.value ??
        data.gas ??
        data.gasRaw,
        0
      ),

    threshold:
      numberValue(
        gas.threshold ??
        data.gasThreshold,
        DEFAULT_GAS_THRESHOLD
      ),

    alert:
      gas.alert === true ||
      data.gasAlert === true

  };
}


function getHeatData(data) {

  const sensors =
    data?.sensors || {};

  const heat =
    sensors.heat || {};

  return {

    rawADC:
      numberValue(
        heat.rawADC ??
        heat.raw ??
        data.thermistorADC ??
        data.heatRawADC,
        0
      ),

    voltage:
      numberValue(
        heat.voltage ??
        data.thermistorVoltage,
        0
      ),

    resistance:
      numberValue(
        heat.resistance ??
        data.thermistorResistance ??
        data.heatResistance,
        0
      ),

    threshold:
      numberValue(
        heat.fireThreshold ??
        data.fireThreshold,
        DEFAULT_FIRE_THRESHOLD
      ),

    alert:
      heat.alert === true ||
      data.heatAlert === true

  };
}


/* =========================================================
   DEVICE STATUS
   ========================================================= */

function isFire(data) {

  return (
    data?.fireAlert === true ||
    data?.status === "FIRE"
  );
}


function isHeatDetected(data) {

  const heat =
    getHeatData(data);

  return (
    heat.alert === true ||
    (
      heat.resistance > 0 &&
      heat.resistance <= heat.threshold
    )
  );
}


function isSmokeDetected(data) {

  const gas =
    getGasData(data);

  return (
    gas.alert === true ||
    gas.raw >= gas.threshold
  );
}


/* =========================================================
   UPDATE LOCATION
   ========================================================= */

function updateLocation(data) {

  const building =
    data?.building ||
    "ABC Apartments";

  const floor =
    data?.floor ??
    "3";

  const zone =
    data?.zone ||
    "Room 302";


  $("locationText").textContent =
    building;

  $("locationSubtext").textContent =
    `Floor ${floor} • ${zone}`;


  $("emergencyBuilding").textContent =
    building;

  $("emergencyFloor").textContent =
    floor;

  $("emergencyZone").textContent =
    zone;
}


/* =========================================================
   UPDATE SENSOR UI
   ========================================================= */

function updateHeat(data) {

  const heat =
    getHeatData(data);

  const detected =
    isHeatDetected(data);

  const card =
    $("heatCard");

  const state =
    $("heatState");

  const value =
    $("heatValue");


  card.classList.toggle(
    "alert",
    detected
  );


  if (heat.resistance > 0) {

    value.textContent =
      `${heat.resistance.toFixed(2)} kΩ`;

  } else if (heat.rawADC > 0) {

    value.textContent =
      `ADC ${heat.rawADC}`;

  } else {

    value.textContent =
      "—";
  }


  if (detected) {

    state.textContent =
      "HEAT DETECTED";

    state.className =
      "sensor-state warning-text";

  } else {

    state.textContent =
      "SAFE";

    state.className =
      "sensor-state safe-text";
  }
}


/* =========================================================
   UPDATE GAS UI
   ========================================================= */

function updateGas(data) {

  const gas =
    getGasData(data);

  const detected =
    isSmokeDetected(data);

  const card =
    $("gasCard");

  const state =
    $("gasState");

  const value =
    $("gasValue");


  card.classList.toggle(
    "alert",
    detected
  );


  value.textContent =
    `Raw ${gas.raw}`;


  if (detected) {

    state.textContent =
      "SMOKE / GAS";

    state.className =
      "sensor-state warning-text";

  } else {

    state.textContent =
      "SAFE";

    state.className =
      "sensor-state safe-text";
  }
}


/* =========================================================
   DETECTION SEQUENCE
   ========================================================= */

function updateSequence(data) {

  const heat =
    isHeatDetected(data);

  const smoke =
    isSmokeDetected(data);

  const fire =
    isFire(data);


  const heatStep =
    $("stepHeat");

  const smokeStep =
    $("stepSmoke");

  const fireStep =
    $("stepFire");


  heatStep.className =
    "sequence-step";

  smokeStep.className =
    "sequence-step";

  fireStep.className =
    "sequence-step";


  if (heat) {

    heatStep.classList.add("complete");

    $("stepHeatStatus").textContent =
      "Detected";

  } else {

    $("stepHeatStatus").textContent =
      "Waiting";
  }


  /*
   * Smoke is checked only after heat.
   */

  if (heat && smoke) {

    smokeStep.classList.add("complete");

    $("stepSmokeStatus").textContent =
      "Detected";

  } else if (heat) {

    smokeStep.classList.add("active");

    $("stepSmokeStatus").textContent =
      "Checking";

  } else {

    $("stepSmokeStatus").textContent =
      "Waiting";
  }


  /*
   * Fire confirmation.
   */

  if (fire) {

    fireStep.classList.add("fire");

    $("stepFireStatus").textContent =
      "CONFIRMED";

  } else if (heat && smoke) {

    fireStep.classList.add("active");

    const confirmation =
      data?.fireConfirmation || {};

    const count =
      numberValue(
        confirmation.count,
        0
      );

    const required =
      numberValue(
        confirmation.required,
        3
      );

    $("stepFireStatus").textContent =
      `Confirming ${count}/${required}`;

  } else {

    $("stepFireStatus").textContent =
      "Waiting";
  }
}


/* =========================================================
   MAIN STATUS
   ========================================================= */

function updateMainStatus(data) {

  const card =
    $("statusCard");

  const status =
    $("mainStatus");

  const description =
    $("statusDescription");

  const symbol =
    $("statusSymbol");


  card.className =
    "status-card";


  if (isFire(data)) {

    card.classList.add("fire");

    symbol.textContent =
      "🔥";

    status.textContent =
      "FIRE";

    description.textContent =
      "Fire has been confirmed. Emergency response information is active.";

    return;
  }


  if (isHeatDetected(data)) {

    if (isSmokeDetected(data)) {

      card.classList.add("checking");

      symbol.textContent =
        "⚠";

      status.textContent =
        "CHECKING";

      description.textContent =
        "Heat and smoke are present. Confirming fire condition.";

    } else {

      card.classList.add("heat");

      symbol.textContent =
        "🌡";

      status.textContent =
        "HEAT DETECTED";

      description.textContent =
        "Heat is detected. Smoke confirmation is being monitored.";

    }

    return;
  }


  card.classList.add("safe");

  symbol.textContent =
    "✓";

  status.textContent =
    "SAFE";

  description.textContent =
    "No confirmed fire condition detected.";
}


/* =========================================================
   FAMILY DATA
   ========================================================= */

function normalizeFamilyMembers(data) {

  if (!data || typeof data !== "object") {

    return {};
  }


  /*
   * If an accidental string such as "test"
   * exists, ignore it.
   */

  if (typeof data !== "object") {

    return {};
  }


  return data;
}


/* =========================================================
   PRIMARY CONTACT
   ========================================================= */

function findPrimaryContact() {

  primaryContact = null;


  const entries =
    Object.entries(familyMembers);


  for (const [id, member] of entries) {

    if (
      member &&
      typeof member === "object" &&
      member.isPrimary === true
    ) {

      primaryContact = {
        id,
        ...member
      };

      break;
    }
  }


  /*
   * Fallback:
   * if there is only one member and none is
   * explicitly primary, use the first member.
   */

  if (
    !primaryContact &&
    entries.length === 1
  ) {

    const [id, member] =
      entries[0];

    if (
      member &&
      typeof member === "object"
    ) {

      primaryContact = {
        id,
        ...member
      };
    }
  }


  updatePrimaryContactUI();
}


/* =========================================================
   PRIMARY CONTACT UI
   ========================================================= */

function updatePrimaryContactUI() {

  if (!primaryContact) {

    $("primaryName").textContent =
      "No primary contact";

    $("primaryPhone").textContent =
      "Add a family member";

    $("emergencyContactName").textContent =
      "No primary contact";

    $("emergencyContactPhone").textContent =
      "—";

    $("callPrimaryBtn").classList.add("hidden");

    return;
  }


  const name =
    primaryContact.name ||
    "Family Member";

  const phone =
    primaryContact.phone ||
    "No phone number";


  $("primaryName").textContent =
    name;

  $("primaryPhone").textContent =
    phone;


  $("emergencyContactName").textContent =
    name;

  $("emergencyContactPhone").textContent =
    phone;


  /*
   * Only prepare the call link.
   * Browser/mobile OS still requires the user
   * to tap the call button.
   */

  const callButton =
    $("callPrimaryBtn");

  callButton.href =
    `tel:${String(phone).replace(/[^\d+]/g, "")}`;
}


/* =========================================================
   FAMILY LIST
   ========================================================= */

function renderFamilyMembers() {

  const list =
    $("membersList");

  const entries =
    Object.entries(familyMembers)
      .filter(([, member]) =>
        member &&
        typeof member === "object"
      );


  $("memberCount").textContent =
    entries.length;


  if (entries.length === 0) {

    list.innerHTML = `
      <div class="empty-members">
        No family members registered yet.
      </div>
    `;

    return;
  }


  list.innerHTML =
    entries.map(([id, member]) => {

      const name =
        escapeHtml(
          member.name ||
          "Unnamed"
        );

      const relation =
        escapeHtml(
          member.relation ||
          "Family"
        );

      const phone =
        escapeHtml(
          member.phone ||
          "No phone"
        );

      const primary =
        member.isPrimary === true;


      return `
        <div class="member-card">

          <div class="member-avatar">
            👤
          </div>

          <div class="member-info">

            <div class="member-name">
              ${name}
            </div>

            <div class="member-relation">
              ${relation}
            </div>

            <div class="member-phone">
              ${phone}
            </div>

          </div>

          <div class="member-actions">

            ${
              primary
                ? `<div class="member-primary">PRIMARY</div>`
                : `
                  <button
                    class="primary-member-button"
                    data-primary="${escapeHtml(id)}"
                    type="button"
                  >
                    Make Primary
                  </button>
                `
            }

            <button
              class="delete-member-button"
              data-delete="${escapeHtml(id)}"
              type="button"
            >
              Delete
            </button>

          </div>

        </div>
      `;

    }).join("");


  /*
   * Make primary
   */

  list
    .querySelectorAll("[data-primary]")
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          await makePrimary(
            button.dataset.primary
          );

        }
      );

    });


  /*
   * Delete
   */

  list
    .querySelectorAll("[data-delete]")
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          await deleteMember(
            button.dataset.delete
          );

        }
      );

    });
}


/* =========================================================
   ADD FAMILY MEMBER
   ========================================================= */

$("familyForm")
  ?.addEventListener("submit", async event => {

    event.preventDefault();


    const name =
      $("name").value.trim();

    const relation =
      $("relation").value.trim();

    const phone =
      $("phone").value.trim();


    if (!name || !relation || !phone) {

      $("message").textContent =
        "Please fill all required fields.";

      $("message").style.color =
        "#dc2626";

      return;
    }


    const newMemberRef =
      push(
        ref(db, FAMILY_PATH)
      );


    const memberCount =
      Object.keys(familyMembers).length;


    const memberData = {

      name,

      relation,

      phone,

      latitude:
        selectedLatitude ?? null,

      longitude:
        selectedLongitude ?? null,

      isPrimary:
        memberCount === 0,

      createdAt:
        Date.now(),

      updatedAt:
        Date.now()

    };


    try {

      $("saveBtn").disabled =
        true;

      $("saveBtn").textContent =
        "Saving...";


      await set(
        newMemberRef,
        memberData
      );


      $("familyForm").reset();


      selectedLatitude =
        null;

      selectedLongitude =
        null;


      $("locationInfo").textContent =
        "Location not selected";


      $("message").textContent =
        "Family member saved successfully.";

      $("message").style.color =
        "#15803d";


      showToast(
        "Family member added"
      );


      stopLocationPicker();


    } catch (error) {

      console.error(
        "Family member save error:",
        error
      );


      $("message").textContent =
        "Could not save family member.";

      $("message").style.color =
        "#dc2626";

    } finally {

      $("saveBtn").disabled =
        false;

      $("saveBtn").textContent =
        "Save Family Member";
    }

  });


/* =========================================================
   MAKE PRIMARY
   ========================================================= */

async function makePrimary(memberId) {

  try {

    const updates = {};


    for (
      const id of Object.keys(familyMembers)
    ) {

      updates[
        `${FAMILY_PATH}/${id}/isPrimary`
      ] =
        id === memberId;

      updates[
        `${FAMILY_PATH}/${id}/updatedAt`
      ] =
        Date.now();
    }


    await update(
      ref(db),
      updates
    );


    showToast(
      "Primary contact updated"
    );

  } catch (error) {

    console.error(
      "Primary update error:",
      error
    );

    showToast(
      "Could not update primary contact"
    );
  }
}


/* =========================================================
   DELETE MEMBER
   ========================================================= */

async function deleteMember(memberId) {

  const member =
    familyMembers[memberId];


  if (!member) {
    return;
  }


  const confirmed =
    window.confirm(
      `Delete ${member.name || "this family member"}?`
    );


  if (!confirmed) {
    return;
  }


  try {

    await remove(
      ref(
        db,
        `${FAMILY_PATH}/${memberId}`
      )
    );


    showToast(
      "Family member deleted"
    );

  } catch (error) {

    console.error(
      "Delete error:",
      error
    );

    showToast(
      "Could not delete member"
    );
  }
}


/* =========================================================
   LOCATION PICKER
   ========================================================= */

$("selectLocationBtn")
  ?.addEventListener(
    "click",
    startLocationPicker
  );


$("cancelLocationBtn")
  ?.addEventListener(
    "click",
    stopLocationPicker
  );


function startLocationPicker() {

  $("mapPicker")
    .classList.remove("hidden");

  $("pickerInstruction")
    .classList.remove("hidden");

  $("cancelLocationBtn")
    .classList.remove("hidden");

  $("selectLocationBtn")
    .classList.add("hidden");


  setTimeout(() => {

    if (!window.L) {

      $("locationInfo").textContent =
        "Map library could not load.";

      return;
    }


    if (!pickerMap) {

      pickerMap =
        L.map("mapPicker")
          .setView(
            [
              DEVICE_LAT,
              DEVICE_LNG
            ],
            14
          );


      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            "&copy; OpenStreetMap contributors"
        }
      ).addTo(pickerMap);


      pickerMap.on(
        "click",
        event => {

          setPickerLocation(
            event.latlng.lat,
            event.latlng.lng
          );

        }
      );

    }


    pickerMap.invalidateSize();

  }, 150);
}


function setPickerLocation(
  lat,
  lng
) {

  selectedLatitude =
    Number(lat);

  selectedLongitude =
    Number(lng);


  if (pickerMarker) {

    pickerMarker.setLatLng([
      selectedLatitude,
      selectedLongitude
    ]);

  } else {

    pickerMarker =
      L.marker([
        selectedLatitude,
        selectedLongitude
      ])
      .addTo(pickerMap);

  }


  $("locationInfo").textContent =
    `Selected: ${selectedLatitude.toFixed(6)}, ${selectedLongitude.toFixed(6)}`;
}


function stopLocationPicker() {

  $("mapPicker")
    .classList.add("hidden");

  $("pickerInstruction")
    .classList.add("hidden");

  $("cancelLocationBtn")
    .classList.add("hidden");

  $("selectLocationBtn")
    .classList.remove("hidden");
}


/* =========================================================
   EMERGENCY MAP
   ========================================================= */

function createEmergencyMap() {

  if (!window.L) {

    console.error(
      "Leaflet is not available."
    );

    return;
  }


  if (emergencyMap) {

    emergencyMap.invalidateSize();

    return;
  }


  emergencyMap =
    L.map("emergencyMap")
      .setView(
        [
          DEVICE_LAT,
          DEVICE_LNG
        ],
        13
      );


  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,

      attribution:
        "&copy; OpenStreetMap contributors"
    }
  ).addTo(emergencyMap);
}


/* =========================================================
   EMERGENCY MARKER
   ========================================================= */

function addEmergencyMarker(
  lat,
  lng,
  title,
  emoji
) {

  const marker =
    L.marker([
      lat,
      lng
    ])
    .addTo(emergencyMap)
    .bindPopup(
      `<strong>${escapeHtml(title)}</strong><br>${emoji}`
    );


  emergencyMarkers.push(marker);

  return marker;
}


/* =========================================================
   EMERGENCY MAP UPDATE
   ========================================================= */

function updateEmergencyMap(data) {

  if (!window.L) {
    return;
  }


  createEmergencyMap();


  /*
   * Remove old markers
   */

  emergencyMarkers.forEach(
    marker => {

      emergencyMap.removeLayer(
        marker
      );

    }
  );


  emergencyMarkers = [];


  /*
   * Remove old lines
   */

  emergencyLines.forEach(
    line => {

      emergencyMap.removeLayer(
        line
      );

    }
  );


  emergencyLines = [];


  /*
   * Device coordinates.
   *
   * If Firebase has lat/lng, use those.
   * Otherwise use configured device location.
   */

  const deviceLat =
    numberValue(
      data?.lat ??
      data?.latitude,
      DEVICE_LAT
    );

  const deviceLng =
    numberValue(
      data?.lng ??
      data?.longitude,
      DEVICE_LNG
    );


  /*
   * Device
   */

  addEmergencyMarker(
    deviceLat,
    deviceLng,
    "Fire Location",
    "🔥"
  );


  /*
   * Police
   */

  addEmergencyMarker(
    POLICE_LAT,
    POLICE_LNG,
    "Police Station",
    "👮"
  );


  /*
   * Fire station
   */

  addEmergencyMarker(
    FIRE_STATION_LAT,
    FIRE_STATION_LNG,
    "Fire Station",
    "🚒"
  );


  /*
   * Lines
   */

  const policeLine =
    L.polyline(
      [
        [
          deviceLat,
          deviceLng
        ],
        [
          POLICE_LAT,
          POLICE_LNG
        ]
      ],
      {
        weight: 3,
        dashArray: "8 8"
      }
    )
    .addTo(emergencyMap);


  const fireLine =
    L.polyline(
      [
        [
          deviceLat,
          deviceLng
        ],
        [
          FIRE_STATION_LAT,
          FIRE_STATION_LNG
        ]
      ],
      {
        weight: 3,
        dashArray: "8 8"
      }
    )
    .addTo(emergencyMap);


  emergencyLines.push(
    policeLine,
    fireLine
  );


  /*
   * Include family member home locations.
   */

  for (
    const member of Object.values(familyMembers)
  ) {

    if (
      !member ||
      typeof member !== "object"
    ) {
      continue;
    }


    const lat =
      numberValue(
        member.latitude,
        NaN
      );

    const lng =
      numberValue(
        member.longitude,
        NaN
      );


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      continue;
    }


    addEmergencyMarker(
      lat,
      lng,
      member.name ||
        "Family Member",
      "🏠"
    );
  }


  /*
   * Fit map to emergency locations.
   */

  const bounds =
    L.latLngBounds(
      [
        deviceLat,
        deviceLng
      ],
      [
        POLICE_LAT,
        POLICE_LNG
      ]
    );


  bounds.extend([
    FIRE_STATION_LAT,
    FIRE_STATION_LNG
  ]);


  emergencyMap.fitBounds(
    bounds,
    {
      padding: [
        30,
        30
      ]
    }
  );
}


/* =========================================================
   EMERGENCY MODE
   ========================================================= */

function showEmergency(data) {

  /*
   * Prevent restarting the countdown
   * every time Firebase sends an update.
   */

  if (emergencyActive) {

    updateEmergencyMap(data);

    return;
  }


  emergencyActive =
    true;

  countdownStarted =
    false;


  updateLocation(data);

  updateEmergencyMap(data);


  showScreen("emergency");


  startCountdown();
}


/* =========================================================
   COUNTDOWN
   ========================================================= */

function startCountdown() {

  if (countdownStarted) {
    return;
  }


  countdownStarted =
    true;


  clearInterval(
    countdownTimer
  );


  let seconds =
    12;


  $("countdown").textContent =
    seconds;


  $("countdownCard")
    .classList.remove("hidden");


  $("callPrimaryBtn")
    .classList.add("hidden");


  /*
   * If there is no primary contact,
   * still run the countdown but show
   * the correct message afterward.
   */

  countdownTimer =
    setInterval(() => {

      seconds--;


      $("countdown").textContent =
        seconds;


      if (seconds <= 0) {

        clearInterval(
          countdownTimer
        );


        countdownTimer =
          null;


        finishCountdown();

      }

    }, 1000);
}


/* =========================================================
   COUNTDOWN FINISHED
   ========================================================= */

function finishCountdown() {

  $("countdown").textContent =
    "0";


  $("countdownCard")
    .classList.add("hidden");


  if (primaryContact) {

    const phone =
      String(
        primaryContact.phone || ""
      )
      .replace(
        /[^\d+]/g,
        ""
      );


    const callButton =
      $("callPrimaryBtn");


    callButton.href =
      `tel:${phone}`;


    callButton.textContent =
      `📞 Call ${primaryContact.name || "Primary Contact"}`;


    callButton.classList.remove(
      "hidden"
    );

  } else {

    showToast(
      "No primary contact is registered."
    );
  }
}


/* =========================================================
   DISMISS EMERGENCY SCREEN
   ========================================================= */

$("cancelEmergencyBtn")
  ?.addEventListener(
    "click",
    () => {

      emergencyActive =
        false;

      countdownStarted =
        false;


      clearInterval(
        countdownTimer
      );


      countdownTimer =
        null;


      showScreen("home");

    }
  );


/* =========================================================
   DEVICE LISTENER
   ========================================================= */

function listenToDevice() {

  const deviceRef =
    ref(
      db,
      DEVICE_PATH
    );


  onValue(
    deviceRef,

    snapshot => {

      setConnection(true);


      const data =
        snapshot.val();


      if (!data) {

        console.warn(
          "No device data found at:",
          DEVICE_PATH
        );

        deviceData = {};

        return;
      }


      deviceData =
        data;


      console.log(
        "Device data:",
        data
      );


      updateLocation(data);

      updateHeat(data);

      updateGas(data);

      updateSequence(data);

      updateMainStatus(data);


      /*
       * Emergency listener.
       */

      if (isFire(data)) {

        showEmergency(data);

      } else if (
        emergencyActive &&
        !isFire(data)
      ) {

        /*
         * Firebase says the fire condition
         * is no longer active.
         *
         * We do not automatically call anyone.
         * Return to normal screen.
         */

        emergencyActive =
          false;

        countdownStarted =
          false;

        clearInterval(
          countdownTimer
        );

        countdownTimer =
          null;

        showScreen("home");
      }

    },

    error => {

      console.error(
        "Firebase device listener error:",
        error
      );


      setConnection(false);

      showToast(
        "Firebase connection error"
      );
    }
  );
}


/* =========================================================
   FAMILY LISTENER
   ========================================================= */

function listenToFamily() {

  const familyRef =
    ref(
      db,
      FAMILY_PATH
    );


  onValue(
    familyRef,

    snapshot => {

      const data =
        snapshot.val();


      familyMembers =
        normalizeFamilyMembers(
          data
        );


      console.log(
        "Family data:",
        familyMembers
      );


      findPrimaryContact();

      renderFamilyMembers();


      /*
       * If emergency mode is already active,
       * update family markers.
       */

      if (emergencyActive) {

        updateEmergencyMap(
          deviceData
        );
      }

    },

    error => {

      console.error(
        "Firebase family listener error:",
        error
      );

    }
  );
}


/* =========================================================
   FIREBASE STARTUP
   ========================================================= */

function startFirebaseListeners() {

  console.log(
    "Starting SmartFire Family Companion..."
  );

  console.log(
    "Device path:",
    DEVICE_PATH
  );

  console.log(
    "Family path:",
    FAMILY_PATH
  );


  listenToDevice();

  listenToFamily();
}


/* =========================================================
   INITIAL UI
   ========================================================= */

function initializeUI() {

  showScreen("home");

  setConnection(false);

  $("deviceStatusText").textContent =
    "Connecting";

  $("locationText").textContent =
    "Loading location...";

  $("locationSubtext").textContent =
    "Connecting to Firebase";

  $("heatState").textContent =
    "WAITING";

  $("gasState").textContent =
    "WAITING";

  $("stepHeatStatus").textContent =
    "Waiting";

  $("stepSmokeStatus").textContent =
    "Waiting";

  $("stepFireStatus").textContent =
    "Waiting";
}


/* =========================================================
   START
   ========================================================= */

initializeUI();

startFirebaseListeners();

console.log(
  "SmartFire Family Companion loaded."
);
