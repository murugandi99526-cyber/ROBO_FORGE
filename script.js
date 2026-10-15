
"use strict";

/* ==========================================
   ROBO FORGE — DAY 1
   Invention planner and project dashboard
   ========================================== */

const $ = (selector) => document.querySelector(selector);

const ideaInput = $("#ideaInput");
const categorySelect = $("#categorySelect");
const generateBtn = $("#generateBtn");
const resultEmpty = $("#resultEmpty");
const resultContent = $("#resultContent");
const projectsGrid = $("#projectsGrid");
const toast = $("#toast");

const STORAGE_KEY = "roboForgeDay1Projects";

let currentPlan = null;
let toastTimer = null;

/* ==========================================
   BASIC UTILITIES
   ========================================== */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function getSavedProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function storeProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    showToast("Could not save. Device storage may be unavailable.");
    return false;
  }
}

/* ==========================================
   INVENTION KNOWLEDGE
   Starter templates, not an AI model
   ========================================== */

const knowledge = {
  obstacle: {
    title: "Obstacle Detection Robot",
    icon: "🤖",
    description:
      "A beginner robotics concept that measures the distance to nearby objects and can command a motor controller to stop or turn.",
    parts: [
      ["🧠", "Microcontroller", "Processes sensor readings and control rules."],
      ["📡", "Distance sensor", "Measures distance to an obstacle."],
      ["⚙️", "Motor driver", "Controls suitable DC motors."],
      ["🛞", "Motors and wheels", "Move the robot."],
      ["🔋", "Suitable power source", "Supplies the required voltage and current."]
    ],
    steps: [
      "Choose a controller and check its voltage requirements.",
      "Plan the distance sensor connections using its pin documentation.",
      "Select a compatible motor driver and motors.",
      "Define a rule: if the measured distance is below your chosen threshold, stop or turn.",
      "Test the control logic with simulated readings before building."
    ],
    tests: [
      "No obstacle detected: the robot may continue moving.",
      "Obstacle detected: the stop rule should activate.",
      "Invalid sensor reading: the robot should enter a safe state."
    ],
    warning:
      "This is a concept plan. Check the exact pinout, voltage, current and driver requirements before connecting real components."
  },

  plant: {
    title: "Smart Plant Care System",
    icon: "🌱",
    description:
      "A monitoring system that reads soil moisture and can control a small watering pump when the soil is too dry.",
    parts: [
      ["🧠", "Microcontroller", "Reads sensors and controls the system."],
      ["🌿", "Soil moisture sensor", "Estimates moisture in the soil."],
      ["🚿", "Pump and suitable driver", "Moves water when activated."],
      ["🔋", "Suitable power source", "Powers components within their ratings."],
      ["💧", "Water container", "Stores the water supply."]
    ],
    steps: [
      "Choose a suitable soil moisture sensor and controller.",
      "Read and calibrate sensor values for the chosen soil.",
      "Set a moisture threshold and add a suitable delay or hysteresis.",
      "Control the pump through a properly rated driver.",
      "Test with simulated readings and include a maximum watering time."
    ],
    tests: [
      "Moist soil: watering should remain off.",
      "Dry soil: the watering rule may activate the pump.",
      "Sensor failure: watering should default to off."
    ],
    warning:
      "Never power a pump directly from a microcontroller pin. Use an appropriately rated driver, power supply and water-safe setup."
  },

  water: {
    title: "Water Leak Alert",
    icon: "💧",
    description:
      "A sensor-based concept that detects water in a monitored area and triggers a local alert.",
    parts: [
      ["🧠", "Microcontroller", "Processes the leak sensor signal."],
      ["💧", "Water detection sensor", "Detects water at the monitored location."],
      ["🔔", "Buzzer or indicator", "Signals a possible leak."],
      ["🔌", "Suitable power source", "Powers the circuit within its ratings."]
    ],
    steps: [
      "Choose a compatible water detection sensor.",
      "Read its signal and establish a baseline.",
      "Set a detection rule and filter noisy readings.",
      "Trigger a buzzer or indicator when water is detected.",
      "Test dry, wet and disconnected-sensor scenarios."
    ],
    tests: [
      "Dry sensor: no leak alert.",
      "Water detected: alert activates.",
      "Disconnected sensor: report a sensor fault where possible."
    ],
    warning:
      "Use low-voltage electronics and keep exposed electronics away from water."
  },

  environment: {
    title: "Environment Monitoring Station",
    icon: "🌍",
    description:
      "A small station that measures selected environmental conditions and displays the readings.",
    parts: [
      ["🧠", "Microcontroller", "Collects sensor data."],
      ["🌡️", "Temperature sensor", "Measures ambient temperature."],
      ["💧", "Humidity sensor", "Measures relative humidity."],
      ["📟", "Display or dashboard", "Shows collected readings."],
      ["🔋", "Suitable power source", "Provides stable power."]
    ],
    steps: [
      "Choose the environmental readings you want to measure.",
      "Select sensors compatible with your controller.",
      "Read and validate sensor data.",
      "Display readings with units and timestamps.",
      "Compare readings against a trusted reference when possible."
    ],
    tests: [
      "Valid reading: display the value and units.",
      "Missing reading: display a clear error.",
      "Repeated readings: verify that updates occur as expected."
    ],
    warning:
      "Sensor readings are estimates and may need calibration before they are used for scientific conclusions."
  },

  smartHome: {
    title: "Smart Room Controller",
    icon: "🏠",
    description:
      "A simple controller concept that reacts to a sensor or button and manages a low-voltage indicator or suitable output.",
    parts: [
      ["🧠", "Microcontroller", "Runs the control rules."],
      ["👁️", "Motion or light sensor", "Detects activity or ambient brightness."],
      ["💡", "Low-voltage indicator", "Shows the output state."],
      ["🔋", "Suitable power source", "Powers the system safely."]
    ],
    steps: [
      "Choose the sensor and define the desired behaviour.",
      "Read the sensor and check for valid values.",
      "Create a rule that switches the indicator on or off.",
      "Add a timeout or manual override.",
      "Test different sensor values in the virtual planner."
    ],
    tests: [
      "Sensor inactive: output follows the off rule.",
      "Trigger condition met: output switches on.",
      "Repeated triggers: check that the behaviour remains stable."
    ],
    warning:
      "Start with low-voltage outputs. Do not experiment with mains electricity."
  },

  generic: {
    title: "Custom Invention Concept",
    icon: "💡",
    description:
      "A starter blueprint for turning your idea into a system with inputs, processing, outputs and a test plan.",
    parts: [
      ["🧠", "Microcontroller", "Processes input signals and control logic."],
      ["📡", "Suitable sensor", "Measures the condition your invention needs."],
      ["⚙️", "Output or actuator", "Performs the desired action."],
      ["🔋", "Power system", "Supplies the required voltage and current."],
      ["🔌", "Wiring and prototyping parts", "Connects the selected components."]
    ],
    steps: [
      "Define the problem and what success looks like.",
      "Identify the inputs your invention needs to measure.",
      "Choose a controller compatible with those inputs.",
      "Select an output that can safely perform the intended action.",
      "Draw the connection plan and test the logic with sample data."
    ],
    tests: [
      "Normal input: the invention produces the expected response.",
      "Boundary input: verify behaviour near the chosen threshold.",
      "Invalid input: the system should handle the error safely."
    ],
    warning:
      "This is a generic suggestion. Exact components and connections depend on your invention and must be verified."
  }
};

/* ==========================================
   SELECT A STARTER PLAN
   ========================================== */

function chooseTemplate(idea, category) {
  const text = idea.toLowerCase();

  if (/plant|soil|garden|watering|irrigat/.test(text)) {
    return knowledge.plant;
  }

  if (/leak|water detect|flood|spill/.test(text)) {
    return knowledge.water;
  }

  if (/temperature|humidity|weather|environment|air quality/.test(text)) {
    return knowledge.environment;
  }

  if (/obstacle|avoid|distance|self.driv|robot car/.test(text)) {
    return knowledge.obstacle;
  }

  if (/home|room|light|motion|automatic lamp/.test(text)) {
    return knowledge.smartHome;
  }

  const categoryDefaults = {
    robot: knowledge.obstacle,
    environment: knowledge.environment,
    home: knowledge.smartHome,
    rescue: knowledge.generic,
    smart: knowledge.generic
  };

  return categoryDefaults[category] || knowledge.generic;
}

function makePlan(idea, category) {
  const template = chooseTemplate(idea, category);

  return {
    id: createId(),
    idea: idea.trim(),
    category,
    title: template.title,
    icon: template.icon,
    description: template.description,
    parts: template.parts.map((part) => [...part]),
    steps: [...template.steps],
    tests: [...template.tests],
    warning: template.warning,
    createdAt: new Date().toISOString()
  };
}

function createId() {
  return Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8);
}

/* ==========================================
   DISPLAY A BLUEPRINT
   ========================================== */

function renderPlan(plan) {
  currentPlan = plan;
  resultEmpty.hidden = true;
  resultContent.hidden = false;

  const partsHTML = plan.parts.map((part) => `
    <li>
      <span class="part-symbol">${escapeHTML(part[0])}</span>
      <span>
        <strong>${escapeHTML(part[1])}</strong>
        <span class="part-detail">${escapeHTML(part[2])}</span>
      </span>
    </li>
  `).join("");

  const stepsHTML = plan.steps.map((step) => `
    <li>${escapeHTML(step)}</li>
  `).join("");

  const testsHTML = plan.tests.map((test) => `
    <li>${escapeHTML(test)}</li>
  `).join("");

  resultContent.innerHTML = `
    <div class="result-header">
      <div>
        <div class="result-kicker">✦ YOUR STARTER BLUEPRINT</div>
        <h3>${escapeHTML(plan.title)}</h3>
      </div>
      <span class="result-badge">CONCEPT</span>
    </div>

    <p class="result-description">
      <strong>Your idea:</strong> ${escapeHTML(plan.idea)}
      <br><br>${escapeHTML(plan.description)}
    </p>

    <h4 class="result-subtitle">SUGGESTED COMPONENTS</h4>
    <ul class="parts-list">${partsHTML}</ul>

    <h4 class="result-subtitle">FIRST BUILDING STEPS</h4>
    <ol class="steps-list">${stepsHTML}</ol>

    <h4 class="result-subtitle">VIRTUAL TEST SCENARIOS</h4>
    <ul class="steps-list">${testsHTML}</ul>

    <div class="result-note">
      <strong>Safety and accuracy:</strong>
      ${escapeHTML(plan.warning)}
      This plan has not been electrically or physically validated.
    </div>

    <div class="result-actions">
      <button class="button button-primary small-button" id="savePlanBtn">
        ♡ Save blueprint
      </button>
      <button class="button button-secondary small-button" id="copyPlanBtn">
        Copy plan
      </button>
    </div>
  `;

  $("#savePlanBtn").addEventListener("click", saveCurrentPlan);
  $("#copyPlanBtn").addEventListener("click", copyCurrentPlan);
}

/* ==========================================
   GENERATE
   ========================================== */

function generatePlan() {
  const idea = ideaInput.value.trim();
  const category = categorySelect.value;

  if (idea.length < 5) {
    showToast("Describe your invention in at least 5 characters.");
    ideaInput.focus();
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Creating your blueprint...";

  try {
    const plan = makePlan(idea, category);
    renderPlan(plan);
    showToast("Your starter blueprint is ready!");
  } catch (error) {
    console.error("Blueprint generation failed:", error);
    showToast("Something went wrong. Please try again.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML =
      "<span>✦</span> Generate invention plan <span>→</span>";
  }
}

generateBtn.addEventListener("click", generatePlan);

ideaInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    generatePlan();
  }
});

/* ==========================================
   EXAMPLE IDEAS
   ========================================== */

document.querySelectorAll(".example-chip").forEach((button) => {
  button.addEventListener("click", () => {
    ideaInput.value = button.dataset.idea || "";
    ideaInput.focus();
  });
});

/* ==========================================
   SAVE AND COPY BLUEPRINTS
   ========================================== */

function saveCurrentPlan() {
  if (!currentPlan) return;

  const projects = getSavedProjects();
  const alreadySaved = projects.some(
    (project) => project.id === currentPlan.id
  );

  if (alreadySaved) {
    showToast("This blueprint is already saved.");
    return;
  }

  projects.unshift(currentPlan);

  if (storeProjects(projects)) {
    renderProjects();
    showToast("Blueprint saved on this device.");
  }
}

async function copyCurrentPlan() {
  if (!currentPlan) return;

  const plan = currentPlan;
  const text = [
    `ROBO FORGE — ${plan.title}`,
    `Idea: ${plan.idea}`,
    "",
    plan.description,
    "",
    "SUGGESTED COMPONENTS",
    ...plan.parts.map((part) => `- ${part[1]}: ${part[2]}`),
    "",
    "FIRST BUILDING STEPS",
    ...plan.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "VIRTUAL TEST SCENARIOS",
    ...plan.tests.map((test) => `- ${test}`),
    "",
    `SAFETY NOTE: ${plan.warning}`,
    "This is a starter concept, not a validated engineering design."
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    showToast("Blueprint copied!");
  } catch {
    showToast("Copy is unavailable here. You can select the plan text manually.");
  }
}

/* ==========================================
   PROJECT COLLECTION
   ========================================== */

function renderProjects() {
  if (!projectsGrid) return;

  const projects = getSavedProjects();

  if (projects.length === 0) {
    projectsGrid.innerHTML = `
      <div class="project-placeholder">
        <span>＋</span>
        <p>Your first invention is waiting.</p>
        <a href="#invent">Create a blueprint ↗</a>
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = projects.map((project) => `
    <article class="project-card">
      <span class="project-icon">${escapeHTML(project.icon || "💡")}</span>
      <h3>${escapeHTML(project.title || "Untitled invention")}</h3>
      <p>${escapeHTML(project.idea || "")}</p>
      <span class="project-meta">SAVED BLUEPRINT · CONCEPT</span>
      <button class="button button-secondary project-open"
        data-open-project="${escapeHTML(project.id)}">
        Open blueprint ↗
      </button>
      <button class="delete-project"
        data-delete-project="${escapeHTML(project.id)}">
        Delete
      </button>
    </article>
  `).join("");
}

projectsGrid.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-project]");
  const deleteButton = event.target.closest("[data-delete-project]");

  if (openButton) {
    const project = getSavedProjects().find(
      (item) => item.id === openButton.dataset.openProject
    );

    if (project) {
      renderPlan(project);
      document.querySelector("#invent").scrollIntoView({
        behavior: "smooth"
      });
      showToast("Blueprint opened.");
    }
  }

  if (deleteButton) {
    const id = deleteButton.dataset.deleteProject;
    const projects = getSavedProjects().filter(
      (item) => item.id !== id
    );

    if (storeProjects(projects)) {
      renderProjects();
      showToast("Blueprint deleted.");
    }
  }
});

$("#clearProjects").addEventListener("click", () => {
  const projects = getSavedProjects();

  if (projects.length === 0) {
    showToast("There are no saved plans to clear.");
    return;
  }

  if (!confirm("Delete all saved blueprints on this device?")) {
    return;
  }

  if (storeProjects([])) {
    renderProjects();
    showToast("Saved blueprints cleared.");
  }
});

/* ==========================================
   MOBILE NAVIGATION
   ========================================== */

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";

    navLinks.querySelectorAll("a").forEach((item) => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});


/* ==========================================
   STARTUP
   ========================================== */

const currentYearElement = document.querySelector("#currentYear");

if (currentYearElement) {
  currentYearElement.textContent = new Date().getFullYear();
}

renderProjects();

console.log("ROBO FORGE DAY 1 READY");

/* ==========================================
   ROBO FORGE — COMPONENT WORKSPACE
   ========================================== */

const forgeParts = [
  { id: "arduino", name: "Arduino Uno", type: "Controller", icon: "🟦", color: "#1689ff" },
  { id: "esp32", name: "ESP32 Board", type: "Controller", icon: "🔷", color: "#8b5cf6" },
  { id: "ultrasonic", name: "Ultrasonic Sensor", type: "Sensor", icon: "📡", color: "#06b6d4" },
  { id: "ir", name: "IR Sensor", type: "Sensor", icon: "🔴", color: "#ef4444" },
  { id: "temperature", name: "Temperature Sensor", type: "Sensor", icon: "🌡️", color: "#f97316" },
  { id: "servo", name: "Servo Motor", type: "Motor", icon: "⚙️", color: "#eab308" },
  { id: "motor", name: "DC Motor", type: "Motor", icon: "🔩", color: "#22c55e" },
  { id: "battery", name: "Battery Pack", type: "Power", icon: "🔋", color: "#84cc16" },
  { id: "led", name: "LED", type: "Output", icon: "💡", color: "#facc15" },
  { id: "buzzer", name: "Buzzer", type: "Output", icon: "🔊", color: "#ec4899" },
  { id: "wires", name: "Jumper Wires", type: "Connection", icon: "〰️", color: "#fb7185" }
];

const forgeLibrary = document.querySelector("#componentLibrary");
const forgeSearch = document.querySelector("#componentSearch");
const forgeGrid = document.querySelector("#workspaceGrid");
const forgeStatus = document.querySelector("#workspaceStatus");
const forgeReset = document.querySelector("#resetWorkspace");
const forgeSave = document.querySelector("#saveWorkspace");

let forgeWorkspace = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("roboForgeWorkspaceV1") || "[]"
  );

  if (Array.isArray(saved)) {
    forgeWorkspace = saved.filter(id =>
      forgeParts.some(part => part.id === id)
    );
  }
} catch (error) {
  forgeWorkspace = [];
}

function renderForgeLibrary(searchText = "") {
  if (!forgeLibrary) return;

  const query = searchText.trim().toLowerCase();

  const filtered = forgeParts.filter(part =>
    `${part.name} ${part.type}`.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    forgeLibrary.innerHTML = "<p>No matching components found.</p>";
    return;
  }

  forgeLibrary.innerHTML = filtered.map(part => `
    <div style="
      display:flex;align-items:center;gap:12px;
      padding:12px;margin-bottom:10px;
      background:#101d30;border:1px solid #263b55;
      border-radius:12px;">
      <div style="
        width:46px;height:46px;display:grid;
        place-items:center;border-radius:10px;
        background:${part.color}25;
        border:1px solid ${part.color};
        font-size:24px;">${part.icon}</div>
      <div style="flex:1;min-width:0">
        <strong>${part.name}</strong>
        <div style="font-size:12px;color:#9aabc2">
          ${part.type}
        </div>
      </div>
      <button type="button"
        class="button button-primary"
        data-add-component="${part.id}"
        style="padding:9px 12px">+ Add</button>
    </div>
  `).join("");
}

function renderForgeWorkspace() {
  if (!forgeGrid || !forgeStatus) return;

  if (forgeWorkspace.length === 0) {
    forgeGrid.innerHTML = `
      <div style="width:100%;text-align:center;padding:50px 12px;color:#9aabc2">
        <div style="font-size:42px">🛠️</div>
        <strong>Your workspace is ready</strong>
        <p>Add components from the library to begin!</p>
      </div>
    `;

    forgeStatus.textContent = "No components added yet.";
    return;
  }

  forgeGrid.innerHTML = forgeWorkspace.map((id, index) => {
    const part = forgeParts.find(item => item.id === id);
    if (!part) return "";

    return `
      <div style="
        width:125px;min-height:130px;padding:14px 8px;
        text-align:center;background:#101d30;
        border:1px solid ${part.color};border-radius:14px;
        box-sizing:border-box;">
        <div style="
          width:64px;height:64px;margin:0 auto 10px;
          display:grid;place-items:center;
          border-radius:12px;background:${part.color}25;
          font-size:34px;">${part.icon}</div>
        <strong style="font-size:12px;display:block">
          ${part.name}
        </strong>
        <button type="button"
          data-remove-component="${index}"
          style="margin-top:9px;background:transparent;
          border:1px solid #53657c;color:#fff;
          border-radius:7px;padding:4px 9px;cursor:pointer">
          Remove
        </button>
      </div>
    `;
  }).join("");

  forgeStatus.textContent =
    `${forgeWorkspace.length} component(s) in your workspace.`;
}

function saveForgeWorkspace() {
  try {
    localStorage.setItem(
      "roboForgeWorkspaceV1",
      JSON.stringify(forgeWorkspace)
    );
    return true;
  } catch (error) {
    console.error("Could not save workspace:", error);
    return false;
  }
}

if (forgeLibrary) {
  forgeLibrary.addEventListener("click", event => {
    const button = event.target.closest("[data-add-component]");
    if (!button) return;

    const id = button.dataset.addComponent;
    if (!forgeParts.some(part => part.id === id)) return;

    forgeWorkspace.push(id);
    renderForgeWorkspace();
    saveForgeWorkspace();
  });
}

if (forgeGrid) {
  forgeGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-component]");
    if (!button) return;

    const index = Number(button.dataset.removeComponent);
    if (!Number.isInteger(index)) return;

    forgeWorkspace.splice(index, 1);
    renderForgeWorkspace();
    saveForgeWorkspace();
  });
}

if (forgeSearch) {
  forgeSearch.addEventListener("input", () => {
    renderForgeLibrary(forgeSearch.value);
  });
}

if (forgeReset) {
  forgeReset.addEventListener("click", () => {
    forgeWorkspace = [];
    renderForgeWorkspace();
    saveForgeWorkspace();
  });
}

if (forgeSave) {
  forgeSave.addEventListener("click", () => {
    const saved = saveForgeWorkspace();
    forgeStatus.textContent = saved
      ? `Saved! ${forgeWorkspace.length} component(s) in your workspace.`
      : "Unable to save. Please check your browser storage.";
  });
}

renderForgeLibrary();
renderForgeWorkspace();

console.log("ROBO FORGE WORKSPACE READY");


