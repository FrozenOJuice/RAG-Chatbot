const apiBaseInput = document.getElementById("apiBase");
const healthBtn = document.getElementById("healthBtn");
const healthStatus = document.getElementById("healthStatus");
const userModeBtn = document.getElementById("userModeBtn");
const adminModeBtn = document.getElementById("adminModeBtn");
const userPanel = document.getElementById("userPanel");
const adminPanel = document.getElementById("adminPanel");

const chatForm = document.getElementById("chatForm");
const questionInput = document.getElementById("questionInput");
const askBtn = document.getElementById("askBtn");
const answerOutput = document.getElementById("answerOutput");

const adminForm = document.getElementById("adminForm");
const adminKeyInput = document.getElementById("adminKeyInput");
const knowledgeInput = document.getElementById("knowledgeInput");
const addBtn = document.getElementById("addBtn");
const adminStatus = document.getElementById("adminStatus");

function getApiBase() {
  return apiBaseInput.value.trim().replace(/\/+$/, "");
}

function setMode(mode) {
  const showUser = mode === "user";
  userPanel.classList.toggle("is-hidden", !showUser);
  adminPanel.classList.toggle("is-hidden", showUser);
  userModeBtn.classList.toggle("active", showUser);
  adminModeBtn.classList.toggle("active", !showUser);
  userModeBtn.setAttribute("aria-pressed", String(showUser));
  adminModeBtn.setAttribute("aria-pressed", String(!showUser));
}

function setStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type}`;
}

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
    return JSON.stringify(data);
  } catch (_) {
    return response.statusText || "Unknown error";
  }
}

async function checkHealth() {
  healthBtn.disabled = true;
  setStatus(healthStatus, "Checking...", "neutral");
  try {
    const response = await fetch(`${getApiBase()}/health`);
    if (!response.ok) {
      const detail = await readErrorMessage(response);
      throw new Error(detail);
    }
    setStatus(healthStatus, "Backend online", "ok");
  } catch (error) {
    setStatus(healthStatus, `Offline: ${error.message}`, "error");
  } finally {
    healthBtn.disabled = false;
  }
}

healthBtn.addEventListener("click", checkHealth);
userModeBtn.addEventListener("click", () => setMode("user"));
adminModeBtn.addEventListener("click", () => setMode("admin"));

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = questionInput.value.trim();
  if (!question) {
    answerOutput.textContent = "Please enter a question.";
    return;
  }

  askBtn.disabled = true;
  answerOutput.textContent = "Thinking...";

  try {
    const response = await fetch(`${getApiBase()}/chat/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const detail = await readErrorMessage(response);
      throw new Error(detail);
    }

    const data = await response.json();
    answerOutput.textContent = data.answer ?? "No answer returned.";
  } catch (error) {
    answerOutput.textContent = `Request failed: ${error.message}`;
  } finally {
    askBtn.disabled = false;
  }
});

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const adminKey = adminKeyInput.value.trim();
  const text = knowledgeInput.value.trim();

  if (!adminKey) {
    setStatus(adminStatus, "Admin key is required.", "error");
    return;
  }
  if (!text) {
    setStatus(adminStatus, "Knowledge text is required.", "error");
    return;
  }

  addBtn.disabled = true;
  setStatus(adminStatus, "Uploading knowledge...", "neutral");

  try {
    const response = await fetch(`${getApiBase()}/admin/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ADMIN-KEY": adminKey,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const detail = await readErrorMessage(response);
      throw new Error(detail);
    }

    const data = await response.json();
    setStatus(adminStatus, `Success: ${data.chunks_added} chunk(s) added.`, "ok");
    knowledgeInput.value = "";
  } catch (error) {
    setStatus(adminStatus, `Failed: ${error.message}`, "error");
  } finally {
    addBtn.disabled = false;
  }
});

checkHealth();
setMode("user");
