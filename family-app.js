/* =========================================================
   SMARTFIRE GUARDIAN
   FAMILY COMPANION
   ========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* =========================================================
   FIREBASE CONFIGURATION
   ========================================================= */

const firebaseConfig = {

  /*
    IMPORTANT:
    Paste your EXISTING Firebase Web App values here.

    Do NOT put the old Firebase legacy/database secret here.
  */

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
   FIREBASE
   ========================================================= */

const firebaseApp =
  initializeApp(firebaseConfig);

const db =
  getDatabase(firebaseApp);


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
   FIRE CONFIRMATION
   ========================================================= */

const DEFAULT_FIRE_THRESHOLD =
  5000;


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
   MAP STATE
   ========================================================= */

let pickerMap = null;

let pickerMarker = null;

let emergencyMap = null;

let emergencyDeviceMarker = null;

let emergencyPoliceMarker = null;

let emergencyFireStationMarker = null;

let emergencyPoliceLine = null;

let emergencyFireLine = null;


/* =========================================================
   LOCATION PICKER STATE
   ========================================================= */

let selectedLatitude = null;

let selectedLongitude = null;

let selectingLocation = false;


/* =========================================================
   EMERGENCY STATE
   ========================================================= */

let emergencyActive = false;

let emergencyDismissed =
  false;

let countdownTimer = null;

let countdownValue = 12;


/* =========================================================
   DOM HELPER
   ========================================================= */

const $ = (id) =>
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
   INITIALIZATION
   ========================================================= */

console.log(
  "SmartFire Family Companion loaded."
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


/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */

function showScreen(screenName) {

  homeScreen.classList.remove("active");

  familyScreen.classList.remove("active");

  emergencyScreen.classList.remove("active");


  homeNavBtn.classList.remove("active");

  familyNavBtn.classList.remove("active");


  if (screenName === "home") {

    homeScreen.classList.add("active");

    homeNavBtn.classList.add("active");

  }


  else if (screenName === "family") {

    familyScreen.classList.add("active");

    familyNavBtn.classList.add("active");

  }


  else if (screenName === "emergency") {

    emergencyScreen.classList.add("active");

  }

}


/* =========================================================
   NAVIGATION EVENTS
   ========================================================= */

homeNavBtn.addEventListener(
  "click",
  () => {

    if (!emergencyActive) {
      showScreen("home");
    }

  }
);


familyNavBtn.addEventListener(
  "click",
  () => {

    if (!emergencyActive) {
      showScreen("family");
    }

  }
);


manageFamilyBtn.addEventListener(
  "click",
  () => {

    showScreen("family");

  }
);


backHomeBtn.addEventListener(
  "click",
  () => {

    showScreen("home");

  }
);


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function setConnectionStatus(
  online
) {

  if (online) {

    connectionDot.className =
      "connection-dot online";

    connectionText.textContent =
      "Connected";

    deviceStatusDot.className =
      "status-dot online";

    deviceStatusText.textContent =
      "Connected";

  }

  else {

    connectionDot.className =
      "connection-dot offline";

    connectionText.textContent =
      "Offline";

    deviceStatusDot.className =
      "status-dot offline";

    deviceStatusText.textContent =
      "Offline";

  }

}


/* =========================================================
   VALUE HELPERS
   ========================================================= */

function numberValue(
  value,
  fallback = 0
) {

  const n =
    Number(value);

  return Number.isFinite(n)
    ? n
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

  statusCard.classList.add(type);

  mainStatus.textContent =
    title;

  statusDescription.textContent =
    description;


  const symbol =
    statusCard.querySelector(
      ".status-symbol"
    );


  if (type === "safe") {

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
      1600
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


  /* -------------------------
     GAS
     ------------------------- */

  gasValue.textContent =
    `Raw ${gasRaw}`;


  if (gasRaw >= gasThreshold) {

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


  /* -------------------------
     HEAT
     ------------------------- */

  if (heatResistance > 0) {

    heatValue.textContent =
      `${heatResistance.toFixed(2)} kΩ`;

  }

  else {

    heatValue.textContent =
      "—";

  }


  if (
    heatResistance > 0 &&
    heatResistance <= heatThreshold
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

  const fireConfirmation =
    data?.fireConfirmation || {};


  const gasRaw =
    numberValue(
      gas.raw,
      0
    );

  const gasThreshold =
    numberValue(
      gas.threshold,
      1600
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


  const heatDetected =
    heatResistance > 0 &&
    heatResistance <= heatThreshold;


  const smokeDetected =
    gasRaw >= gasThreshold;


  const confirmationCount =
    numberValue(
      fireConfirmation.count,
      0
    );


  const required =
    numberValue(
      fireConfirmation.required,
      3
    );


  /* Reset */
  stepHeat.className =
    "sequence-step";

  stepSmoke.className =
    "sequence-step";

  stepFire.className =
    "sequence-step";


  /* Heat */
  if (heatDetected) {

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


  /* Smoke */
  if (heatDetected && smokeDetected) {

    stepSmoke.classList.add(
      "active"
    );

    stepSmokeStatus.textContent =
      `${confirmationCount}/${required}`;

  }

  else if (heatDetected) {

    stepSmokeStatus.textContent =
      "No smoke";

  }

  else {

    stepSmokeStatus.textContent =
      "Waiting";

  }


  /* Fire */
  if (data?.fireAlert === true) {

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
   DEVICE DATA
   ========================================================= */

function updateDevice(
  data
) {

  currentDeviceData =
    data || {};


  $("deviceId").textContent =
    textValue(
      data?.deviceId,
      DEVICE_ID
    );


  updateLocation(
    data
  );


  updateSensors(
    data
  );


  updateSequence(
    data
  );


  const fire =
    data?.fireAlert === true;


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


  const heatDetected =
    heat > 0 &&
    heat <= heatThreshold;


  const smoke =
    numberValue(
      data?.sensors?.gas?.raw,
      0
    );


  const smokeThreshold =
    numberValue(
      data?.sensors?.gas?.threshold,
      1600
    );


  const smokeDetected =
    smoke >= smokeThreshold;


  if (fire) {

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

  else if (heatDetected) {

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


  if (fire) {

    startEmergency(
      data
    );

  }

  else {

    if (
      emergencyActive &&
      !emergencyDismissed
    ) {

      stopEmergency();

    }

  }

}


/* =========================================================
   DEVICE FIRE LISTENER
   ========================================================= */

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
      "Device data:",
      data
    );


    updateDevice(
      data
    );

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


/* =========================================================
   FAMILY LISTENER
   ========================================================= */

onValue(
  ref(
    db,
    FAMILY_PATH
  ),

  snapshot => {

    const data =
      snapshot.val();


    familyData =
      data || {};


    console.log(
      "Family data:",
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


    membersList.innerHTML =
      `
        <div class="empty-card">
          Could not load family members.
        </div>
      `;

  }
);


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
    "Primary contact found:",
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

    primaryName.textContent =
      textValue(
        primaryContact.name,
        "Unknown"
      );


    primaryPhone.textContent =
      textValue(
        primaryContact.phone,
        "No phone"
      );


    emergencyContactName.textContent =
      textValue(
        primaryContact.name,
        "Unknown"
      );


    emergencyContactPhone.textContent =
      textValue(
        primaryContact.phone,
        "No phone"
      );


    const phone =
      String(
        primaryContact.phone || ""
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
   RENDER FAMILY MEMBERS
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

    membersList.innerHTML =
      `
        <div class="empty-card">
          No family members registered yet.
        </div>
      `;

    return;

  }


  entries.forEach(
    ([id, member]) => {

      if (!member) {
        return;
      }


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "member-card";


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


      card.innerHTML =
        `
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
              data-primary="${id}"
            >
              ★ Make Primary
            </button>

            <button
              class="member-action delete-member"
              data-delete="${id}"
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


  /* Primary buttons */

  document
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


  /* Delete buttons */

  document
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

  catch (error) {

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


  const confirmed =
    confirm(
      `Delete ${memberName}?`
    );


  if (!confirmed) {
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

  catch (error) {

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


/* =========================================================
   INITIALIZE PICKER MAP
   ========================================================= */

function initializePickerMap() {

  if (
    typeof L ===
    "undefined"
  ) {

    showToast(
      "Map library could not be loaded."
    );

    return;

  }


  if (!pickerMap) {

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


        locationInfo.innerHTML =
          `
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
      pickerMarker
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


    locationInfo.innerHTML =
      `
        <span class="location-info-icon">
          📍
        </span>

        <span>
          No home location selected
        </span>
      `;

  }
);


/* =========================================================
   SAVE FAMILY MEMBER
   ========================================================= */

saveBtn.addEventListener(
  "click",
  async () => {

    const name =
      nameInput.value.trim();


    const relation =
      relationInput.value;


    const phone =
      phoneInput.value.trim();


    /* Validation */

    if (!name) {

      showMessage(
        "Please enter the family member's name.",
        "error"
      );

      return;

    }


    if (!relation) {

      showMessage(
        "Please select the relationship.",
        "error"
      );

      return;

    }


    if (!phone) {

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
            Object.keys(
              familyData
            ).length === 0,

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

    catch (error) {

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


/* =========================================================
   CLEAR FORM
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
    pickerMarker
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


  locationInfo.innerHTML =
    `
      <span class="location-info-icon">
        📍
      </span>

      <span>
        No home location selected
      </span>
    `;

}


/* =========================================================
   EMERGENCY
   ========================================================= */

function startEmergency(
  data
) {

  if (
    emergencyActive &&
    !emergencyDismissed
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


  updateEmergencyMap(
    data
  );


  updatePrimaryContactUI();


  showScreen(
    "emergency"
  );


  startCountdown();


  console.log(
    "PRIMARY FAMILY CONTACT"
  );


  if (
    primaryContact
  ) {

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

  }

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


  showScreen(
    "home"
  );

}


/* =========================================================
   COUNTDOWN
   ========================================================= */

function startCountdown() {

  stopCountdown();


  countdownValue =
    12;


  countdown.textContent =
    countdownValue;


  countdownCard.style.display =
    "block";


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

          countdown.textContent =
            "0";


          countdownCard.querySelector(
            ".countdown-text"
          ).textContent =
            "Emergency contact action ready.";

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
    countdownTimer
  ) {

    clearInterval(
      countdownTimer
    );

    countdownTimer =
      null;

  }

}


/* =========================================================
   DISMISS EMERGENCY LOCALLY
   ========================================================= */

cancelEmergencyBtn.addEventListener(
  "click",
  () => {

    emergencyDismissed =
      true;

    emergencyActive =
      false;


    stopCountdown();


    showScreen(
      "home"
    );


    showToast(
      "Emergency alert dismissed on this device."
    );

  }
);


/* =========================================================
   EMERGENCY MAP
   ========================================================= */

function initializeEmergencyMap() {

  if (
    typeof L ===
    "undefined"
  ) {

    console.error(
      "Leaflet is not loaded."
    );

    return;

  }


  if (
    emergencyMap
  ) {

    setTimeout(
      () => {

        emergencyMap.invalidateSize();

      },
      100
    );

    return;

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

      maxZoom: 19,

      attribution:
        "&copy; OpenStreetMap contributors"

    }
  ).addTo(
    emergencyMap
  );


  setTimeout(
    () => {

      emergencyMap.invalidateSize();

    },
    300
  );

}


/* =========================================================
   MAP ICON
   ========================================================= */

function emergencyMarkerIcon(
  type
) {

  let emoji =
    "📍";

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


  else if (
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
      [34, 34],

    iconAnchor:
      [17, 34],

    popupAnchor:
      [0, -34]

  });

}


/* =========================================================
   UPDATE EMERGENCY MAP
   ========================================================= */

function updateEmergencyMap(
  data
) {

  if (
    typeof L ===
    "undefined"
  ) {

    console.error(
      "Leaflet is not loaded."
    );

    return;

  }


  initializeEmergencyMap();


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


  /* -------------------------
     DEVICE
     ------------------------- */

  if (
    !emergencyDeviceMarker
  ) {

    emergencyDeviceMarker =
      L.marker(
        [
          lat,
          lng
        ],
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


    emergencyDeviceMarker.bindPopup(
      `
        <strong>🔥 FIRE LOCATION</strong>
        <br><br>
        Device: ${DEVICE_ID}
      `
    );

  }

  else {

    emergencyDeviceMarker.setLatLng(
      [
        lat,
        lng
      ]
    );

  }


  /* -------------------------
     POLICE
     ------------------------- */

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


    emergencyPoliceMarker.bindPopup(
      `
        <strong>🚓 POLICE</strong>
        <br><br>
        Emergency response point
      `
    );

  }


  /* -------------------------
     FIRE STATION
     ------------------------- */

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


    emergencyFireStationMarker.bindPopup(
      `
        <strong>🚒 FIRE STATION</strong>
        <br><br>
        Emergency response point
      `
    );

  }


  /* -------------------------
     RESPONSE LINES
     ------------------------- */

  const devicePoint =
    [
      lat,
      lng
    ];


  if (
    emergencyPoliceLine
  ) {

    emergencyMap.removeLayer(
      emergencyPoliceLine
    );

  }


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


  if (
    emergencyFireLine
  ) {

    emergencyMap.removeLayer(
      emergencyFireLine
    );

  }


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


  /* -------------------------
     FIT MAP
     ------------------------- */

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
        [35, 35]
    }
  );


  setTimeout(
    () => {

      emergencyMap.invalidateSize();

    },
    250
  );

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
  text,
  type
) {

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
   HTML ESCAPE
   ========================================================= */

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
   START
   ========================================================= */

setConnectionStatus(
  false
);


showScreen(
  "home"
);


console.log(
  "================================"
);

console.log(
  "SMARTFIRE FAMILY COMPANION"
);

console.log(
  "Device:",
  DEVICE_ID
);

console.log(
  "Firebase:",
  FAMILY_PATH
);

console.log(
  "================================"
);
