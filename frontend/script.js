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
const deleteByIdForm = document.getElementById("deleteByIdForm");
const docIdInput = document.getElementById("docIdInput");
const deleteByIdBtn = document.getElementById("deleteByIdBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");
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
  const baseClass = element.dataset.baseClass ? ` ${element.dataset.baseClass}` : "";
  element.textContent = message;
  element.className = `status ${type}${baseClass}`;
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
    await response.json();
    setStatus(healthStatus, "Online", "ok");
  } catch (error) {
    setStatus(healthStatus, `Offline: ${error.message}`, "error");
  } finally {
    healthBtn.disabled = false;
  }
}

function getAdminKey() {
  return adminKeyInput.value.trim();
}

function requireAdminKey() {
  const key = getAdminKey();
  if (!key) {
    setStatus(adminStatus, "Admin key is required.", "error");
    return null;
  }
  return key;
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
  const adminKey = requireAdminKey();
  const text = knowledgeInput.value.trim();

  if (!adminKey) return;
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

deleteByIdForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const adminKey = requireAdminKey();
  const docId = docIdInput.value.trim();

  if (!adminKey) return;
  if (!docId) {
    setStatus(adminStatus, "Document ID is required.", "error");
    return;
  }

  deleteByIdBtn.disabled = true;
  setStatus(adminStatus, "Deleting by ID...", "neutral");

  try {
    const response = await fetch(`${getApiBase()}/admin/delete/${encodeURIComponent(docId)}`, {
      method: "DELETE",
      headers: { "X-ADMIN-KEY": adminKey },
    });

    if (!response.ok) {
      const detail = await readErrorMessage(response);
      throw new Error(detail);
    }

    const data = await response.json();
    if (data.deleted) {
      setStatus(adminStatus, `Deleted document: ${data.id}`, "ok");
      docIdInput.value = "";
    } else {
      setStatus(adminStatus, `No document found for ID: ${data.id}`, "neutral");
    }
  } catch (error) {
    setStatus(adminStatus, `Failed: ${error.message}`, "error");
  } finally {
    deleteByIdBtn.disabled = false;
  }
});

deleteAllBtn.addEventListener("click", async () => {
  const adminKey = requireAdminKey();
  if (!adminKey) return;
  if (!window.confirm("Delete ALL knowledge from storage? This cannot be undone.")) return;

  deleteAllBtn.disabled = true;
  setStatus(adminStatus, "Deleting all knowledge...", "neutral");

  try {
    const response = await fetch(`${getApiBase()}/admin/delete-all`, {
      method: "DELETE",
      headers: { "X-ADMIN-KEY": adminKey },
    });

    if (!response.ok) {
      const detail = await readErrorMessage(response);
      throw new Error(detail);
    }

    const data = await response.json();
    setStatus(adminStatus, `Deleted ${data.deleted_count} document(s).`, "ok");
    docIdInput.value = "";
  } catch (error) {
    setStatus(adminStatus, `Failed: ${error.message}`, "error");
  } finally {
    deleteAllBtn.disabled = false;
  }
});

checkHealth();
setMode("user");
