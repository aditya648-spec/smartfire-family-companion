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
   FIREBASE CONFIGURATION
   =========================================================
   KEEP YOUR EXISTING FIREBASE WEB APP VALUES HERE.
   DO NOT PUT A FIREBASE DATABASE SECRET HERE.
   ========================================================= */

const firebaseConfig = {

  apiKey: "YOUR_EXISTING_FIREBASE_WEB_API_KEY",

  authDomain:
    "smartfire-guardian.firebaseapp.com",

  databaseURL:
    "https://smartfire-guardian-default-rtdb.firebaseio.com",

  projectId:
    "smartfire-guardian",

  storageBucket:
    "smartfire-guardian.firebasestorage.app",

  messagingSenderId:
    "YOUR_EXISTING_MESSAGING_SENDER_ID",

  appId:
    "YOUR_EXISTING_FIREBASE_APP_ID",

  measurementId:
    "YOUR_EXISTING_MEASUREMENT_ID"
};


/* =========================================================
   FIREBASE INITIALIZATION
   ========================================================= */

let firebaseApp;
let db;

try {

  firebaseApp =
    initializeApp(firebaseConfig);

  db =
    getDatabase(firebaseApp);

  console.log(
    "SmartFire Firebase initialized."
  );

}
catch (error) {

  console.error(
    "Firebase initialization failed:",
    error
  );

  alert(
    "SmartFire could not connect to Firebase. Check the Firebase Web App configuration."
  );
}


/* =========================================================
   DEVICE
   ========================================================= */

const DEVICE_ID = "SF-003";

const DEVICE_PATH =
  `devices/${DEVICE_ID}`;

const FAMILY_PATH =
  `familyMembers/${DEVICE_ID}`;


/* =========================================================
   DEFAULT LOCATIONS
   ========================================================= */

const DEFAULT_LAT =
  15.855881303189477;

const DEFAULT_LNG =
  74.57802140000477;

const POLICE_LAT =
  15.881842260513212;

const POLICE_LNG =
  74.52917008030238;

const FIRE_STATION_LAT =
  15.845029016505203;

const FIRE_STATION_LNG =
  74.50745329043593;


/* =========================================================
   DEFAULT THRESHOLDS
   ========================================================= */

const DEFAULT_GAS_THRESHOLD =
  1600;

const DEFAULT_FIRE_THRESHOLD =
  5000;

const DEFAULT_CONFIRMATION_REQUIRED =
  3;


/* =========================================================
   STATE
   ========================================================= */

let currentDeviceData = null;

let familyData = {};

let primaryContact = null;

let currentDeviceLat =
  DEFAULT_LAT;

let currentDeviceLng =
  DEFAULT_LNG;


/* =========================================================
   EMERGENCY STATE
   ========================================================= */

let emergencyActive =
  false;

let emergencyDismissed =
  false;

let countdownTimer =
  null;

let countdownValue =
  12;


/* =========================================================
   MAP STATE
   ========================================================= */

let pickerMap =
  null;

let pickerMarker =
  null;

let emergencyMap =
  null;

let emergencyDeviceMarker =
  null;

let emergencyPoliceMarker =
  null;

let emergencyFireStationMarker =
  null;

let emergencyPoliceLine =
  null;

let emergencyFireLine =
  null;


/* =========================================================
   LOCATION PICKER
   ========================================================= */

let selectedLatitude =
  null;

let selectedLongitude =
  null;

let selectingLocation =
  false;


/* =========================================================
   DOM HELPER
   ========================================================= */

const $ = id =>
  document.getElementById(id);


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const homeScreen =
  $("homeScreen");

const familyScreen =
  $("familyScreen");

const emergencyScreen =
  $("emergencyScreen");

const homeNavBtn =
  $("homeNavBtn");

const familyNavBtn =
  $("familyNavBtn");

const manageFamilyBtn =
  $("manageFamilyBtn");

const backHomeBtn =
  $("backHomeBtn");

const connectionDot =
  $("connectionDot");

const connectionText =
  $("connectionText");

const deviceStatusDot =
  $("deviceStatusDot");

const deviceStatusText =
  $("deviceStatusText");

const statusCard =
  $("statusCard");

const mainStatus =
  $("mainStatus");

const statusDescription =
  $("statusDescription");

const locationText =
  $("locationText");

const locationSubtext =
  $("locationSubtext");

const heatState =
  $("heatState");

const heatValue =
  $("heatValue");

const gasState =
  $("gasState");

const gasValue =
  $("gasValue");

const heatCard =
  $("heatCard");

const gasCard =
  $("gasCard");

const stepHeat =
  $("stepHeat");

const stepHeatStatus =
  $("stepHeatStatus");

const stepSmoke =
  $("stepSmoke");

const stepSmokeStatus =
  $("stepSmokeStatus");

const stepFire =
  $("stepFire");

const stepFireStatus =
  $("stepFireStatus");

const primaryName =
  $("primaryName");

const primaryPhone =
  $("primaryPhone");

const primaryContactCard =
  $("primaryContactCard");

const nameInput =
  $("name");

const relationInput =
  $("relation");

const phoneInput =
  $("phone");

const selectLocationBtn =
  $("selectLocationBtn");

const cancelLocationBtn =
  $("cancelLocationBtn");

const pickerInstruction =
  $("pickerInstruction");

const mapPicker =
  $("mapPicker");

const locationInfo =
  $("locationInfo");

const saveBtn =
  $("saveBtn");

const message =
  $("message");

const membersList =
  $("membersList");

const memberCount =
  $("memberCount");

const emergencyBuilding =
  $("emergencyBuilding");

const emergencyFloor =
  $("emergencyFloor");

const emergencyZone =
  $("emergencyZone");

const emergencyContactName =
  $("emergencyContactName");

const emergencyContactPhone =
  $("emergencyContactPhone");

const countdown =
  $("countdown");

const countdownCard =
  $("countdownCard");

const callPrimaryBtn =
  $("callPrimaryBtn");

const cancelEmergencyBtn =
  $("cancelEmergencyBtn");

const toast =
  $("toast");


/* =========================================================
   BASIC VALIDATION
   ========================================================= */

const requiredElements = [

  homeScreen,
  familyScreen,
  emergencyScreen,

  statusCard,
  mainStatus,
  statusDescription,

  locationText,
  locationSubtext,

  heatState,
  heatValue,
  gasState,
  gasValue,

  membersList,
  memberCount,

  emergencyBuilding,
  emergencyFloor,
  emergencyZone,

  emergencyContactName,
  emergencyContactPhone,

  countdown,
  countdownCard,
  callPrimaryBtn,
  cancelEmergencyBtn

];

const missingElements =
  requiredElements.filter(
    element => !element
  );

if (missingElements.length) {

  console.error(
    "SmartFire missing HTML elements:",
    missingElements
  );

}


/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function numberValue(
  value,
  fallback = 0
) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


function textValue(
  value,
  fallback = "—"
) {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {

    return fallback;
  }

  return String(value);
}


function cleanPhone(
  phone
) {

  return String(phone || "")
    .replace(
      /[^0-9+]/g,
      ""
    );
}


function escapeHtml(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function showScreen(
  screenName
) {

  homeScreen.classList.remove(
    "active"
  );

  familyScreen.classList.remove(
    "active"
  );

  emergencyScreen.classList.remove(
    "active"
  );

  if (
    homeNavBtn
  ) {

    homeNavBtn.classList.remove(
      "active"
    );
  }

  if (
    familyNavBtn
  ) {

    familyNavBtn.classList.remove(
      "active"
    );
  }


  if (
    screenName === "home"
  ) {

    homeScreen.classList.add(
      "active"
    );

    if (
      homeNavBtn
    ) {

      homeNavBtn.classList.add(
        "active"
      );
    }

  }


  if (
    screenName === "family"
  ) {

    familyScreen.classList.add(
      "active"
    );

    if (
      familyNavBtn
    ) {

      familyNavBtn.classList.add(
        "active"
      );
    }

  }


  if (
    screenName === "emergency"
  ) {

    emergencyScreen.classList.add(
      "active"
    );

  }

}


/* =========================================================
   NAVIGATION EVENTS
   ========================================================= */

if (homeNavBtn) {

  homeNavBtn.addEventListener(
    "click",
    () => {

      if (
        !emergencyActive
      ) {

        showScreen(
          "home"
        );

      }

    }
  );

}


if (familyNavBtn) {

  familyNavBtn.addEventListener(
    "click",
    () => {

      if (
        !emergencyActive
      ) {

        showScreen(
          "family"
        );

      }

    }
  );

}


if (manageFamilyBtn) {

  manageFamilyBtn.addEventListener(
    "click",
    () => {

      showScreen(
        "family"
      );

    }
  );

}


if (backHomeBtn) {

  backHomeBtn.addEventListener(
    "click",
    () => {

      if (
        !emergencyActive
      ) {

        showScreen(
          "home"
        );

      }

    }
  );

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function setConnectionStatus(
  online
) {

  if (
    online
  ) {

    if (
      connectionDot
    ) {

      connectionDot.className =
        "connection-dot online";

    }

    if (
      connectionText
    ) {

      connectionText.textContent =
        "Connected";

    }

    if (
      deviceStatusDot
    ) {

      deviceStatusDot.className =
        "status-dot online";

    }

    if (
      deviceStatusText
    ) {

      deviceStatusText.textContent =
        "Connected";

    }

  }

  else {

    if (
      connectionDot
    ) {

      connectionDot.className =
        "connection-dot offline";

    }

    if (
      connectionText
    ) {

      connectionText.textContent =
        "Offline";

    }

    if (
      deviceStatusDot
    ) {

      deviceStatusDot.className =
        "status-dot offline";

    }

    if (
      deviceStatusText
    ) {

      deviceStatusText.textContent =
        "Offline";

    }

  }

}


/* =========================================================
   LOCATION
   ========================================================= */

function updateLocation(
  data
) {

  const building =
    textValue(
      data?.building,
      "ABC Apartments"
    );

  const floor =
    textValue(
      data?.floor,
      "3"
    );

  const zone =
    textValue(
      data?.zone,
      "Room 302"
    );


  locationText.textContent =
    building;

  locationSubtext.textContent =
    `Floor ${floor} • ${zone}`;


  emergencyBuilding.textContent =
    building;

  emergencyFloor.textContent =
    floor;

  emergencyZone.textContent =
    zone;


  currentDeviceLat =
    numberValue(
      data?.lat,
      DEFAULT_LAT
    );

  currentDeviceLng =
    numberValue(
      data?.lng,
      DEFAULT_LNG
    );

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
  type,
  title,
  description
) {

  statusCard.classList.remove(
    "safe",
    "heat",
    "checking",
    "fire"
  );

  statusCard.classList.add(
    type
  );

  mainStatus.textContent =
    title;

  statusDescription.textContent =
    description;


  const symbol =
    statusCard.querySelector(
      ".status-symbol"
    );

  if (
    !symbol
  ) {

    return;

  }


  if (
    type === "safe"
  ) {

    symbol.textContent =
      "✓";

  }

  else if (
    type === "heat" ||
    type === "checking"
  ) {

    symbol.textContent =
      "!";

  }

  else {

    symbol.textContent =
      "🔥";

  }

}


/* =========================================================
   SENSOR DISPLAY
   ========================================================= */

function updateSensors(
  data
) {

  const gas =
    data?.sensors?.gas || {};

  const heat =
    data?.sensors?.heat || {};


  const gasRaw =
    numberValue(
      gas.raw,
      0
    );

  const gasThreshold =
    numberValue(
      gas.threshold,
      DEFAULT_GAS_THRESHOLD
    );


  const heatResistance =
    numberValue(
      heat.resistance,
      0
    );

  const heatThreshold =
    numberValue(
      heat.fireThreshold,
      DEFAULT_FIRE_THRESHOLD
    );


  /* GAS */

  gasValue.textContent =
    gasRaw > 0
      ? `Raw ${gasRaw}`
      : "—";


  if (
    gasRaw >= gasThreshold
  ) {

    gasState.textContent =
      "DETECTED";

    gasState.className =
      "sensor-state warning-text";

    gasCard.classList.add(
      "alert"
    );

  }

  else {

    gasState.textContent =
      "SAFE";

    gasState.className =
      "sensor-state safe-text";

    gasCard.classList.remove(
      "alert"
    );

  }


  /* HEAT */

  if (
    heatResistance > 0
  ) {

    heatValue.textContent =
      `${heatResistance.toFixed(2)} kΩ`;

  }

  else {

    heatValue.textContent =
      "—";

  }


  const heatDetected =
    heatResistance > 0 &&
    heatResistance <= heatThreshold;


  if (
    heatDetected
  ) {

    heatState.textContent =
      "HEAT DETECTED";

    heatState.className =
      "sensor-state warning-text";

    heatCard.classList.add(
      "alert"
    );

  }

  else {

    heatState.textContent =
      "SAFE";

    heatState.className =
      "sensor-state safe-text";

    heatCard.classList.remove(
      "alert"
    );

  }

}


/* =========================================================
   DETECTION SEQUENCE
   ========================================================= */

function updateSequence(
  data
) {

  const gas =
    data?.sensors?.gas || {};

  const heat =
    data?.sensors?.heat || {};

  const confirmation =
    data?.fireConfirmation || {};


  const gasRaw =
    numberValue(
      gas.raw,
      0
    );

  const gasThreshold =
    numberValue(
      gas.threshold,
      DEFAULT_GAS_THRESHOLD
    );

  const heatResistance =
    numberValue(
      heat.resistance,
      0
    );

  const heatThreshold =
    numberValue(
      heat.fireThreshold,
      DEFAULT_FIRE_THRESHOLD
    );

  const count =
    numberValue(
      confirmation.count,
      0
    );

  const required =
    numberValue(
      confirmation.required,
      DEFAULT_CONFIRMATION_REQUIRED
    );


  const heatDetected =
    heatResistance > 0 &&
    heatResistance <= heatThreshold;

  const smokeDetected =
    gasRaw >= gasThreshold;

  const fire =
    data?.fireAlert === true;


  /* RESET */

  stepHeat.className =
    "sequence-step";

  stepSmoke.className =
    "sequence-step";

  stepFire.className =
    "sequence-step";


  /* STEP 1 — HEAT */

  if (
    heatDetected
  ) {

    stepHeat.classList.add(
      "complete"
    );

    stepHeatStatus.textContent =
      "Detected";

  }

  else {

    stepHeatStatus.textContent =
      "Waiting";

  }


  /* STEP 2 — SMOKE */

  if (
    heatDetected &&
    smokeDetected
  ) {

    stepSmoke.classList.add(
      "active"
    );

    stepSmokeStatus.textContent =
      `${Math.min(count, required)}/${required}`;

  }

  else if (
    heatDetected
  ) {

    stepSmokeStatus.textContent =
      "No smoke";

  }

  else {

    stepSmokeStatus.textContent =
      "Waiting";

  }


  /* STEP 3 — FIRE */

  if (
    fire
  ) {

    stepFire.classList.add(
      "fire"
    );

    stepFireStatus.textContent =
      "CONFIRMED";

  }

  else if (
    heatDetected &&
    smokeDetected
  ) {

    stepFire.classList.add(
      "active"
    );

    stepFireStatus.textContent =
      "Checking";

  }

  else {

    stepFireStatus.textContent =
      "Waiting";

  }

}


/* =========================================================
   DEVICE UPDATE
   ========================================================= */

function updateDevice(
  data
) {

  if (
    !data ||
    typeof data !== "object"
  ) {

    console.warn(
      "SmartFire: devices/SF-003 returned no usable data.",
      data
    );

    return;

  }


  currentDeviceData =
    data;


  const deviceId =
    textValue(
      data.deviceId,
      DEVICE_ID
    );


  const fire =
    data.fireAlert === true;


  const heat =
    numberValue(
      data?.sensors?.heat?.resistance,
      0
    );

  const heatThreshold =
    numberValue(
      data?.sensors?.heat?.fireThreshold,
      DEFAULT_FIRE_THRESHOLD
    );


  const gas =
    numberValue(
      data?.sensors?.gas?.raw,
      0
    );

  const gasThreshold =
    numberValue(
      data?.sensors?.gas?.threshold,
      DEFAULT_GAS_THRESHOLD
    );


  const heatDetected =
    heat > 0 &&
    heat <= heatThreshold;

  const smokeDetected =
    gas >= gasThreshold;


  const deviceIdElement =
    $("deviceId");

  if (
    deviceIdElement
  ) {

    deviceIdElement.textContent =
      deviceId;

  }


  updateLocation(
    data
  );

  updateSensors(
    data
  );

  updateSequence(
    data
  );


  /* MAIN STATUS */

  if (
    fire
  ) {

    setStatus(
      "fire",
      "FIRE",
      "Fire conditions have been confirmed."
    );

  }

  else if (
    heatDetected &&
    smokeDetected
  ) {

    setStatus(
      "checking",
      "CHECKING",
      "Heat and smoke detected. Confirming fire..."
    );

  }

  else if (
    heatDetected
  ) {

    setStatus(
      "heat",
      "HEAT DETECTED",
      "High heat detected. Smoke confirmation is required."
    );

  }

  else {

    setStatus(
      "safe",
      "SAFE",
      "No fire conditions detected."
    );

  }


  /* EMERGENCY */

  if (
    fire
  ) {

    startEmergency(
      data
    );

  }

  else if (
    emergencyActive &&
    !emergencyDismissed
  ) {

    stopEmergency();

  }

}


/* =========================================================
   FIREBASE DEVICE LISTENER
   ========================================================= */

if (
  db
) {

  onValue(

    ref(
      db,
      DEVICE_PATH
    ),

    snapshot => {

      setConnectionStatus(
        true
      );


      const data =
        snapshot.val();


      console.log(
        "SmartFire Device data:",
        data
      );


      if (
        data
      ) {

        updateDevice(
          data
        );

      }

      else {

        console.warn(
          `No data found at ${DEVICE_PATH}`
        );

      }

    },

    error => {

      console.error(
        "Firebase device read error:",
        error
      );

      setConnectionStatus(
        false
      );

    }

  );

}


/* =========================================================
   FAMILY LISTENER
   ========================================================= */

if (
  db
) {

  onValue(

    ref(
      db,
      FAMILY_PATH
    ),

    snapshot => {

      const data =
        snapshot.val();


      familyData =
        data &&
        typeof data === "object"
          ? data
          : {};


      console.log(
        "SmartFire Family data:",
        familyData
      );


      renderFamilyMembers();

      findPrimaryContact();

    },

    error => {

      console.error(
        "Firebase family read error:",
        error
      );


      if (
        membersList
      ) {

        membersList.innerHTML = `
          <div class="empty-card">
            Could not load family members.
          </div>
        `;

      }

    }

  );

}


/* =========================================================
   PRIMARY CONTACT
   ========================================================= */

function findPrimaryContact() {

  primaryContact =
    null;


  const entries =
    Object.entries(
      familyData
    );


  for (
    const [id, member]
    of entries
  ) {

    if (
      member &&
      member.isPrimary === true
    ) {

      primaryContact = {

        id,

        ...member

      };

      break;

    }

  }


  console.log(
    "Primary contact:",
    primaryContact
  );


  updatePrimaryContactUI();

}


/* =========================================================
   PRIMARY CONTACT UI
   ========================================================= */

function updatePrimaryContactUI() {

  if (
    primaryContact
  ) {

    const name =
      textValue(
        primaryContact.name,
        "Unknown"
      );

    const phone =
      cleanPhone(
        primaryContact.phone
      );


    primaryName.textContent =
      name;

    primaryPhone.textContent =
      phone || "No phone";


    emergencyContactName.textContent =
      name;

    emergencyContactPhone.textContent =
      phone || "No phone";


    if (
      phone
    ) {

      callPrimaryBtn.href =
        `tel:${phone}`;

      callPrimaryBtn.classList.remove(
        "disabled"
      );

    }

    else {

      callPrimaryBtn.href =
        "#";

      callPrimaryBtn.classList.add(
        "disabled"
      );

    }

  }

  else {

    primaryName.textContent =
      "No primary contact";

    primaryPhone.textContent =
      "Add a family member";


    emergencyContactName.textContent =
      "No primary contact";

    emergencyContactPhone.textContent =
      "Add a family member";


    callPrimaryBtn.href =
      "#";

    callPrimaryBtn.classList.add(
      "disabled"
    );

  }

}


/* =========================================================
   FAMILY MEMBER LIST
   ========================================================= */

function renderFamilyMembers() {

  const entries =
    Object.entries(
      familyData
    );


  memberCount.textContent =
    entries.length;


  membersList.innerHTML =
    "";


  if (
    entries.length === 0
  ) {

    membersList.innerHTML = `
      <div class="empty-card">
        No family members registered yet.
      </div>
    `;

    return;

  }


  entries.forEach(
    ([id, member]) => {

      if (
        !member
      ) {

        return;

      }


      const name =
        textValue(
          member.name,
          "Unknown"
        );

      const relation =
        textValue(
          member.relation,
          "Family"
        );

      const phone =
        textValue(
          member.phone,
          "No phone"
        );


      const lat =
        member.latitude !== undefined
          ? Number(
              member.latitude
            ).toFixed(6)
          : "—";

      const lng =
        member.longitude !== undefined
          ? Number(
              member.longitude
            ).toFixed(6)
          : "—";


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "member-card";


      card.innerHTML = `

        <div class="member-top">

          <div class="member-avatar">
            👤
          </div>

          <div class="member-main">

            <div class="member-name">
              ${escapeHtml(name)}
            </div>

            <div class="member-relation">
              ${escapeHtml(relation)}
            </div>

          </div>

          ${
            member.isPrimary
              ? `
                <span class="member-primary">
                  PRIMARY
                </span>
              `
              : ""
          }

        </div>


        <div class="member-phone">
          📞 ${escapeHtml(phone)}
        </div>


        <div class="member-home">
          📍 Home: ${lat}, ${lng}
        </div>


        <div class="member-actions">

          <button
            class="member-action make-primary"
            data-primary="${escapeHtml(id)}"
          >
            ★ Make Primary
          </button>

          <button
            class="member-action delete-member"
            data-delete="${escapeHtml(id)}"
          >
            Delete
          </button>

        </div>

      `;


      membersList.appendChild(
        card
      );

    }
  );


  membersList
    .querySelectorAll(
      "[data-primary]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            makePrimary(
              button.dataset.primary
            );

          }
        );

      }
    );


  membersList
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            deleteMember(
              button.dataset.delete
            );

          }
        );

      }
    );

}


/* =========================================================
   MAKE PRIMARY
   ========================================================= */

async function makePrimary(
  selectedId
) {

  if (
    !db
  ) {

    showToast(
      "Firebase is not connected."
    );

    return;

  }


  const updates = {};


  Object.keys(
    familyData
  ).forEach(
    id => {

      updates[
        `${FAMILY_PATH}/${id}/isPrimary`
      ] =
        id === selectedId;

    }
  );


  try {

    await update(
      ref(db),
      updates
    );


    showToast(
      "Primary contact updated."
    );

  }

  catch (
    error
  ) {

    console.error(
      "Primary update error:",
      error
    );

    showToast(
      "Could not update primary contact."
    );

  }

}


/* =========================================================
   DELETE MEMBER
   ========================================================= */

async function deleteMember(
  id
) {

  const member =
    familyData[id];

  const memberName =
    member?.name ||
    "this family member";


  if (
    !confirm(
      `Delete ${memberName}?`
    )
  ) {

    return;

  }


  try {

    await remove(
      ref(
        db,
        `${FAMILY_PATH}/${id}`
      )
    );


    showToast(
      "Family member deleted."
    );

  }

  catch (
    error
  ) {

    console.error(
      "Delete error:",
      error
    );

    showToast(
      "Could not delete family member."
    );

  }

}


/* =========================================================
   LOCATION PICKER
   ========================================================= */

if (
  selectLocationBtn
) {

  selectLocationBtn.addEventListener(
    "click",
    () => {

      selectingLocation =
        true;


      mapPicker.classList.add(
        "visible"
      );


      pickerInstruction.style.display =
        "block";


      cancelLocationBtn.classList.remove(
        "hidden"
      );


      selectLocationBtn.style.display =
        "none";


      initializePickerMap();

    }
  );

}


/* =========================================================
   PICKER MAP
   ========================================================= */

function initializePickerMap() {

  if (
    typeof L === "undefined"
  ) {

    showToast(
      "Map library could not be loaded."
    );

    return;

  }


  if (
    !pickerMap
  ) {

    pickerMap =
      L.map(
        "mapPicker"
      ).setView(
        [
          DEFAULT_LAT,
          DEFAULT_LNG
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
    ).addTo(
      pickerMap
    );


    pickerMap.on(
      "click",
      event => {

        if (
          !selectingLocation
        ) {

          return;

        }


        selectedLatitude =
          event.latlng.lat;

        selectedLongitude =
          event.latlng.lng;


        if (
          pickerMarker
        ) {

          pickerMap.removeLayer(
            pickerMarker
          );

        }


        pickerMarker =
          L.marker(
            [
              selectedLatitude,
              selectedLongitude
            ]
          )
          .addTo(
            pickerMap
          );


        pickerMarker
          .bindPopup(
            `
              <strong>🏠 Family Home</strong>
              <br>
              ${selectedLatitude.toFixed(6)},
              ${selectedLongitude.toFixed(6)}
            `
          )
          .openPopup();


        locationInfo.innerHTML = `
          <span class="location-info-icon">
            🏠
          </span>

          <span>
            Home selected:
            ${selectedLatitude.toFixed(6)},
            ${selectedLongitude.toFixed(6)}
          </span>
        `;


        showMessage(
          "Home location selected.",
          "success"
        );

      }
    );

  }


  setTimeout(
    () => {

      pickerMap.invalidateSize();

    },
    200
  );

}


/* =========================================================
   CANCEL LOCATION
   ========================================================= */

if (
  cancelLocationBtn
) {

  cancelLocationBtn.addEventListener(
    "click",
    () => {

      selectingLocation =
        false;

      selectedLatitude =
        null;

      selectedLongitude =
        null;


      if (
        pickerMarker &&
        pickerMap
      ) {

        pickerMap.removeLayer(
          pickerMarker
        );

        pickerMarker =
          null;

      }


      mapPicker.classList.remove(
        "visible"
      );


      pickerInstruction.style.display =
        "none";


      cancelLocationBtn.classList.add(
        "hidden"
      );


      selectLocationBtn.style.display =
        "block";


      locationInfo.innerHTML = `
        <span class="location-info-icon">
          📍
        </span>

        <span>
          No home location selected
        </span>
      `;

    }
  );

}


/* =========================================================
   SAVE FAMILY MEMBER
   ========================================================= */

if (
  saveBtn
) {

  saveBtn.addEventListener(
    "click",
    async () => {

      const name =
        nameInput.value.trim();

      const relation =
        relationInput.value;

      const phone =
        phoneInput.value.trim();


      if (
        !name
      ) {

        showMessage(
          "Please enter the family member's name.",
          "error"
        );

        return;

      }


      if (
        !relation
      ) {

        showMessage(
          "Please select the relationship.",
          "error"
        );

        return;

      }


      if (
        !phone
      ) {

        showMessage(
          "Please enter the phone number.",
          "error"
        );

        return;

      }


      if (
        selectedLatitude === null ||
        selectedLongitude === null
      ) {

        showMessage(
          "Please select the home location.",
          "error"
        );

        return;

      }


      try {

        saveBtn.disabled =
          true;

        saveBtn.textContent =
          "Saving...";


        const newMemberRef =
          push(
            ref(
              db,
              FAMILY_PATH
            )
          );


        const isFirstMember =
          Object.keys(
            familyData
          ).length === 0;


        await set(
          newMemberRef,
          {

            name,

            relation,

            phone,

            latitude:
              selectedLatitude,

            longitude:
              selectedLongitude,

            isPrimary:
              isFirstMember,

            createdAt:
              Date.now(),

            updatedAt:
              Date.now()

          }
        );


        showMessage(
          "Family member saved successfully.",
          "success"
        );


        clearFamilyForm();

      }

      catch (
        error
      ) {

        console.error(
          "Firebase save error:",
          error
        );


        showMessage(
          "Could not save family member: " +
          error.message,
          "error"
        );

      }

      finally {

        saveBtn.disabled =
          false;

        saveBtn.textContent =
          "Save Family Member";

      }

    }
  );

}


/* =========================================================
   CLEAR FAMILY FORM
   ========================================================= */

function clearFamilyForm() {

  nameInput.value =
    "";

  relationInput.value =
    "";

  phoneInput.value =
    "";


  selectedLatitude =
    null;

  selectedLongitude =
    null;

  selectingLocation =
    false;


  if (
    pickerMarker &&
    pickerMap
  ) {

    pickerMap.removeLayer(
      pickerMarker
    );

    pickerMarker =
      null;

  }


  mapPicker.classList.remove(
    "visible"
  );


  pickerInstruction.style.display =
    "none";


  cancelLocationBtn.classList.add(
    "hidden"
  );


  selectLocationBtn.style.display =
    "block";


  locationInfo.innerHTML = `
    <span class="location-info-icon">
      📍
    </span>

    <span>
      No home location selected
    </span>
  `;

}


/* =========================================================
   EMERGENCY START
   ========================================================= */

function startEmergency(
  data
) {

  /*
     If emergency is already active,
     don't restart the 12-second countdown
     every time Firebase updates.
  */

  if (
    emergencyActive
  ) {

    updateEmergencyMap(
      data
    );

    return;

  }


  emergencyActive =
    true;

  emergencyDismissed =
    false;


  updateLocation(
    data
  );


  updatePrimaryContactUI();


  updateEmergencyMap(
    data
  );


  showScreen(
    "emergency"
  );


  startCountdown();


  console.warn(
    "🔥 SMARTFIRE EMERGENCY ACTIVE"
  );

}


/* =========================================================
   STOP EMERGENCY
   ========================================================= */

function stopEmergency() {

  emergencyActive =
    false;

  emergencyDismissed =
    false;


  stopCountdown();


  countdownValue =
    12;

  countdown.textContent =
    "12";


  countdownCard.style.display =
    "none";


  showScreen(
    "home"
  );


  console.log(
    "SmartFire emergency cleared."
  );

}


/* =========================================================
   12 SECOND COUNTDOWN
   ========================================================= */

function startCountdown() {

  stopCountdown();


  countdownValue =
    12;


  countdown.textContent =
    countdownValue;


  countdownCard.style.display =
    "block";


  const countdownText =
    countdownCard.querySelector(
      ".countdown-text"
    );


  if (
    countdownText
  ) {

    countdownText.textContent =
      "Emergency contact action will be available when countdown ends.";

  }


  countdownTimer =
    setInterval(
      () => {

        countdownValue--;


        countdown.textContent =
          countdownValue;


        if (
          countdownValue <= 0
        ) {

          stopCountdown();


          countdownValue =
            0;

          countdown.textContent =
            "0";


          if (
            countdownText
          ) {

            countdownText.textContent =
              "Emergency contact is ready.";

          }


          /*
             Browser security prevents a website
             from silently placing a phone call.

             Instead, prepare the real phone link
             and display the call button.
          */

          if (
            primaryContact &&
            primaryContact.phone
          ) {

            const phone =
              cleanPhone(
                primaryContact.phone
              );


            if (
              phone
            ) {

              callPrimaryBtn.href =
                `tel:${phone}`;

              callPrimaryBtn.classList.remove(
                "disabled"
              );

              callPrimaryBtn.style.display =
                "flex";

              callPrimaryBtn.textContent =
                "📞 Call Primary Contact";


              console.log(
                "Emergency call ready:",
                phone
              );

            }

          }

          else {

            console.warn(
              "No primary family contact is available."
            );

          }

        }

      },
      1000
    );

}


/* =========================================================
   STOP COUNTDOWN
   ========================================================= */

function stopCountdown() {

  if (
    countdownTimer !== null
  ) {

    clearInterval(
      countdownTimer
    );

    countdownTimer =
      null;

  }

}


/* =========================================================
   CANCEL EMERGENCY LOCALLY
   ========================================================= */

if (
  cancelEmergencyBtn
) {

  cancelEmergencyBtn.addEventListener(
    "click",
    () => {

      emergencyDismissed =
        true;

      emergencyActive =
        false;


      stopCountdown();


      countdownCard.style.display =
        "none";


      showScreen(
        "home"
      );


      showToast(
        "Emergency alert dismissed on this device."
      );

    }
  );

}


/* =========================================================
   CALL BUTTON
   ========================================================= */

if (
  callPrimaryBtn
) {

  callPrimaryBtn.addEventListener(
    "click",
    event => {

      if (
        !primaryContact ||
        !primaryContact.phone
      ) {

        event.preventDefault();

        showToast(
          "No primary contact phone number available."
        );

        return;

      }


      const phone =
        cleanPhone(
          primaryContact.phone
        );


      if (
        !phone
      ) {

        event.preventDefault();

        showToast(
          "Primary contact phone number is invalid."
        );

        return;

      }


      console.log(
        "Calling primary contact:",
        phone
      );

    }
  );

}


/* =========================================================
   EMERGENCY MAP
   ========================================================= */

function initializeEmergencyMap() {

  if (
    typeof L === "undefined"
  ) {

    console.error(
      "Leaflet is not loaded."
    );

    return false;

  }


  if (
    emergencyMap
  ) {

    setTimeout(
      () => {

        emergencyMap.invalidateSize();

      },
      150
    );

    return true;

  }


  emergencyMap =
    L.map(
      "emergencyMap",
      {
        zoomControl:
          true
      }
    );


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


  return true;

}


/* =========================================================
   EMERGENCY MARKER ICON
   ========================================================= */

function emergencyMarkerIcon(
  type
) {

  let emoji =
    "🔥";

  let className =
    "fire";


  if (
    type === "police"
  ) {

    emoji =
      "🚓";

    className =
      "police";

  }


  if (
    type === "station"
  ) {

    emoji =
      "🚒";

    className =
      "station";

  }


  return L.divIcon({

    className:
      "sf-family-marker",

    html:
      `
        <div class="sf-family-pin ${className}">
          <span>${emoji}</span>
        </div>
      `,

    iconSize:
      [
        34,
        34
      ],

    iconAnchor:
      [
        17,
        34
      ],

    popupAnchor:
      [
        0,
        -34
      ]

  });

}


/* =========================================================
   UPDATE EMERGENCY MAP
   ========================================================= */

function updateEmergencyMap(
  data
) {

  if (
    !initializeEmergencyMap()
  ) {

    return;

  }


  const lat =
    numberValue(
      data?.lat,
      DEFAULT_LAT
    );

  const lng =
    numberValue(
      data?.lng,
      DEFAULT_LNG
    );


  currentDeviceLat =
    lat;

  currentDeviceLng =
    lng;


  const devicePoint =
    [
      lat,
      lng
    ];


  /* DEVICE */

  if (
    !emergencyDeviceMarker
  ) {

    emergencyDeviceMarker =
      L.marker(
        devicePoint,
        {
          icon:
            emergencyMarkerIcon(
              "fire"
            )
        }
      )
      .addTo(
        emergencyMap
      );


    emergencyDeviceMarker
      .bindPopup(
        `
          <strong>🔥 FIRE LOCATION</strong>
          <br><br>
          Device: ${escapeHtml(DEVICE_ID)}
        `
      );

  }

  else {

    emergencyDeviceMarker
      .setLatLng(
        devicePoint
      );

  }


  /* POLICE */

  if (
    !emergencyPoliceMarker
  ) {

    emergencyPoliceMarker =
      L.marker(
        [
          POLICE_LAT,
          POLICE_LNG
        ],
        {
          icon:
            emergencyMarkerIcon(
              "police"
            )
        }
      )
      .addTo(
        emergencyMap
      );


    emergencyPoliceMarker
      .bindPopup(
        `
          <strong>🚓 POLICE</strong>
          <br><br>
          Emergency response point
        `
      );

  }


  /* FIRE STATION */

  if (
    !emergencyFireStationMarker
  ) {

    emergencyFireStationMarker =
      L.marker(
        [
          FIRE_STATION_LAT,
          FIRE_STATION_LNG
        ],
        {
          icon:
            emergencyMarkerIcon(
              "station"
            )
        }
      )
      .addTo(
        emergencyMap
      );


    emergencyFireStationMarker
      .bindPopup(
        `
          <strong>🚒 FIRE STATION</strong>
          <br><br>
          Emergency response point
        `
      );

  }


  /* REMOVE OLD LINES */

  if (
    emergencyPoliceLine
  ) {

    emergencyMap.removeLayer(
      emergencyPoliceLine
    );

  }


  if (
    emergencyFireLine
  ) {

    emergencyMap.removeLayer(
      emergencyFireLine
    );

  }


  /* POLICE LINE */

  emergencyPoliceLine =
    L.polyline(
      [
        devicePoint,

        [
          POLICE_LAT,
          POLICE_LNG
        ]

      ],
      {

        weight:
          3,

        opacity:
          0.75,

        dashArray:
          "7,7"

      }
    )
    .addTo(
      emergencyMap
    );


  /* FIRE STATION LINE */

  emergencyFireLine =
    L.polyline(
      [
        devicePoint,

        [
          FIRE_STATION_LAT,
          FIRE_STATION_LNG
        ]

      ],
      {

        weight:
          3,

        opacity:
          0.75,

        dashArray:
          "7,7"

      }
    )
    .addTo(
      emergencyMap
    );


  /* FIT MAP */

  const bounds =
    L.latLngBounds(
      [

        devicePoint,

        [
          POLICE_LAT,
          POLICE_LNG
        ],

        [
          FIRE_STATION_LAT,
          FIRE_STATION_LNG
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
        ]
    }
  );


  setTimeout(
    () => {

      emergencyMap.invalidateSize();

    },
    300
  );

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
  text,
  type
) {

  if (
    !message
  ) {

    return;

  }


  message.textContent =
    text;

  message.className =
    `message ${type}`;


  setTimeout(
    () => {

      message.className =
        "message";

    },
    4000
  );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  text
) {

  if (
    !toast
  ) {

    return;

  }


  toast.textContent =
    text;


  toast.classList.add(
    "show"
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

    },
    2500
  );

}


/* =========================================================
   INITIAL STATE
   ========================================================= */

setConnectionStatus(
  false
);

showScreen(
  "home"
);


console.log(
  "======================================"
);

console.log(
  "SMARTFIRE FAMILY COMPANION"
);

console.log(
  "Device:",
  DEVICE_ID
);

console.log(
  "Device path:",
  DEVICE_PATH
);

console.log(
  "Family path:",
  FAMILY_PATH
);

console.log(
  "======================================"
);
