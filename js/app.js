const currentPage = window.location.pathname.split("/").pop() || "index.html";

function formatTaskName(task) {
  if (task === "short-response") return "Short Response";
  if (task === "multiple-choice") return "Multiple Choice";
  return "Not selected";
}

function createErrorMarkup(message) {
  return `<p class="form-error" role="alert">${message}</p>`;
}

/* -------------------- INDEX PAGE -------------------- */
if (currentPage === "index.html") {
  const startButtons = document.querySelectorAll(".js-start-task");
  const planningModal = document.getElementById("planning-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalChoiceText = document.getElementById("modal-choice-text");
  const planningResponse = document.getElementById("planning-response");
  const goBackButton = document.getElementById("go-back-button");
  const continueWithoutSavingButton = document.getElementById("continue-without-saving");
  const saveAndContinueButton = document.getElementById("save-and-continue");

  const notesStartingTask = document.getElementById("notes-starting-task");
  const notesPlan = document.getElementById("notes-plan");

  let selectedTask = null;
  let planningError = null;

  function ensurePlanningError() {
    if (!planningError) {
      planningError = document.createElement("p");
      planningError.className = "form-error";
      planningError.setAttribute("role", "alert");
      planningResponse.insertAdjacentElement("afterend", planningError);
    }
  }

  function clearPlanningError() {
    if (planningError) {
      planningError.textContent = "";
    }
  }

  function showPlanningError(message) {
    ensurePlanningError();
    planningError.textContent = message;
  }

  function openPlanningModal(task) {
    selectedTask = task;
    modalTitle.textContent = `Start with ${formatTaskName(task)}`;
    modalChoiceText.textContent = `You chose to start with: ${formatTaskName(task)}. Before you begin, take a moment to think about your approach.`;
    clearPlanningError();
    planningModal.classList.remove("hidden");
  }

  function closePlanningModal() {
    planningModal.classList.add("hidden");
    planningResponse.value = "";
    clearPlanningError();
    selectedTask = null;
  }

  function updateNotesPreview() {
    const storedTask = sessionStorage.getItem("startingTask");
    const storedPlan = sessionStorage.getItem("planResponse");

    notesStartingTask.textContent = storedTask ? formatTaskName(storedTask) : "Not selected yet";
    notesPlan.textContent = storedPlan ? storedPlan : "No plan saved yet";
  }

  function continueToTaskPage() {
    if (!selectedTask) return;
    sessionStorage.setItem("startingTask", selectedTask);
    window.location.href = "task.html";
  }

  startButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openPlanningModal(button.dataset.task);
    });
  });

  planningResponse.addEventListener("input", clearPlanningError);

  goBackButton.addEventListener("click", () => {
    closePlanningModal();
  });

  continueWithoutSavingButton.addEventListener("click", () => {
    continueToTaskPage();
  });

  saveAndContinueButton.addEventListener("click", () => {
    const planText = planningResponse.value.trim();

    if (!planText) {
      showPlanningError("Enter a planning note before saving, or choose Continue Without Saving.");
      return;
    }

    sessionStorage.setItem("planResponse", planText);
    continueToTaskPage();
  });

  updateNotesPreview();
}

/* -------------------- TASK PAGE -------------------- */
if (currentPage === "task.html") {
  const startingTask = sessionStorage.getItem("startingTask");
  const planResponse = sessionStorage.getItem("planResponse");

  if (!startingTask) {
    window.location.href = "index.html";
  }

  const notesStartingTask = document.getElementById("notes-starting-task");
  const notesPlan = document.getElementById("notes-plan");
  const notesCheckin = document.getElementById("notes-checkin");
  const taskContent = document.getElementById("task-content");

  const checkinModal = document.getElementById("checkin-modal");
  const confidenceSelect = document.getElementById("confidence-select");
  const checkinResponse = document.getElementById("checkin-response");
  const checkinSkipButton = document.getElementById("checkin-skip-button");
  const checkinSaveButton = document.getElementById("checkin-save-button");

  const finalModal = document.getElementById("final-modal");
  const finalResponse = document.getElementById("final-response");
  const finalSkipButton = document.getElementById("final-skip-button");
  const finalSaveButton = document.getElementById("final-save-button");

  const firstTask = startingTask;
  const secondTask = startingTask === "short-response" ? "multiple-choice" : "short-response";

  let currentTask = firstTask;
  let completedFirstTask = false;

  let taskError = null;
  let checkinError = null;
  let finalError = null;

  function getSubtaskLabel() {
    return completedFirstTask ? "Subtask 2 of 2" : "Subtask 1 of 2";
  }

  function updateNotes() {
    notesStartingTask.textContent = formatTaskName(startingTask);
    notesPlan.textContent = planResponse && planResponse.trim() ? planResponse : "No plan saved yet";

    const savedConfidence = sessionStorage.getItem("checkinConfidence");
    const savedCheckin = sessionStorage.getItem("checkinResponse");

    if (savedConfidence || savedCheckin) {
      notesCheckin.textContent = [savedConfidence, savedCheckin].filter(Boolean).join(" — ");
    } else {
      notesCheckin.textContent = "No check-in saved yet";
    }
  }

  function ensureTaskError() {
    taskError = document.getElementById("task-error");
  }

  function showTaskError(message) {
    ensureTaskError();
    if (taskError) {
      taskError.textContent = message;
    }
  }

  function clearTaskError() {
    ensureTaskError();
    if (taskError) {
      taskError.textContent = "";
    }
  }

  function ensureCheckinError() {
    if (!checkinError) {
      checkinError = document.createElement("p");
      checkinError.className = "form-error";
      checkinError.setAttribute("role", "alert");
      checkinResponse.insertAdjacentElement("afterend", checkinError);
    }
  }

  function showCheckinError(message) {
    ensureCheckinError();
    checkinError.textContent = message;
  }

  function clearCheckinError() {
    if (checkinError) {
      checkinError.textContent = "";
    }
  }

  function ensureFinalError() {
    if (!finalError) {
      finalError = document.createElement("p");
      finalError.className = "form-error";
      finalError.setAttribute("role", "alert");
      finalResponse.insertAdjacentElement("afterend", finalError);
    }
  }

  function showFinalError(message) {
    ensureFinalError();
    finalError.textContent = message;
  }

  function clearFinalError() {
    if (finalError) {
      finalError.textContent = "";
    }
  }

  function renderShortResponseTask() {
    taskContent.innerHTML = `
      <div class="subtask-header">
        <span class="eyebrow">Current Subtask</span>
        <span class="subtask-pill">${getSubtaskLabel()}</span>
      </div>

      <h2>Short Response</h2>
      <p>Write a brief summary of the main idea of the passage.</p>

      <label for="short-response-answer"><strong>Your response</strong></label>
      <textarea id="short-response-answer" rows="8" placeholder="Write your summary here..."></textarea>
      <p id="task-error" class="form-error" role="alert"></p>

      <div class="button-row">
        <button class="button button--primary" id="submit-task-button">Submit Response</button>
      </div>
    `;
  }

  function renderMultipleChoiceTask() {
    taskContent.innerHTML = `
      <div class="subtask-header">
        <span class="eyebrow">Current Subtask</span>
        <span class="subtask-pill">${getSubtaskLabel()}</span>
      </div>

      <h2>Multiple Choice</h2>
      <p>Answer both questions using information from the passage.</p>

      <div class="question-block">
        <p><strong>1. What is an algorithm?</strong></p>
        <label><input type="radio" name="q1" value="A"> A. A type of computer hardware</label>
        <label><input type="radio" name="q1" value="B"> B. A step-by-step procedure for solving a problem</label>
        <label><input type="radio" name="q1" value="C"> C. A programming language</label>
        <label><input type="radio" name="q1" value="D"> D. A storage device</label>
      </div>

      <div class="question-block">
        <p><strong>2. Why might one algorithm be preferred over another?</strong></p>
        <label><input type="radio" name="q2" value="A"> A. It uses more electricity</label>
        <label><input type="radio" name="q2" value="B"> B. It requires less computing time or resources</label>
        <label><input type="radio" name="q2" value="C"> C. It uses more programming languages</label>
        <label><input type="radio" name="q2" value="D"> D. It always produces a different result</label>
      </div>

      <p id="task-error" class="form-error" role="alert"></p>

      <div class="button-row">
        <button class="button button--primary" id="submit-task-button">Submit Answers</button>
      </div>
    `;
  }

  function renderCurrentTask() {
    if (currentTask === "short-response") {
      renderShortResponseTask();
    } else {
      renderMultipleChoiceTask();
    }

    ensureTaskError();

    const submitButton = document.getElementById("submit-task-button");
    submitButton.addEventListener("click", handleTaskSubmit);

    if (currentTask === "short-response") {
      const shortResponseAnswer = document.getElementById("short-response-answer");
      shortResponseAnswer.addEventListener("input", clearTaskError);
    } else {
      document.querySelectorAll('input[name="q1"], input[name="q2"]').forEach((input) => {
        input.addEventListener("change", clearTaskError);
      });
    }
  }

  function validateCurrentTask() {
    if (currentTask === "short-response") {
      const answer = document.getElementById("short-response-answer").value.trim();
      if (!answer) {
        showTaskError("Please enter a response before submitting.");
        return false;
      }
      return true;
    }

    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');

    if (!q1 || !q2) {
      showTaskError("Please answer both questions before submitting.");
      return false;
    }

    return true;
  }

  function handleTaskSubmit() {
    clearTaskError();

    if (!validateCurrentTask()) {
      return;
    }

    if (!completedFirstTask) {
      clearCheckinError();
      checkinModal.classList.remove("hidden");
    } else {
      clearFinalError();
      finalModal.classList.remove("hidden");
    }
  }

  function continueToSecondTask() {
    completedFirstTask = true;
    currentTask = secondTask;

    confidenceSelect.value = "";
    checkinResponse.value = "";
    clearCheckinError();
    checkinModal.classList.add("hidden");

    renderCurrentTask();
    updateNotes();
  }

  confidenceSelect.addEventListener("change", clearCheckinError);
  checkinResponse.addEventListener("input", clearCheckinError);
  finalResponse.addEventListener("input", clearFinalError);

  checkinSkipButton.addEventListener("click", () => {
    continueToSecondTask();
  });

  checkinSaveButton.addEventListener("click", () => {
    const confidenceValue = confidenceSelect.value;
    const checkinText = checkinResponse.value.trim();

    if (!confidenceValue && !checkinText) {
      showCheckinError("Select a confidence level or enter a note before saving, or choose Continue Without Saving.");
      return;
    }

    if (confidenceValue) {
      sessionStorage.setItem("checkinConfidence", confidenceValue);
    }

    if (checkinText) {
      sessionStorage.setItem("checkinResponse", checkinText);
    }

    continueToSecondTask();
  });

  finalSkipButton.addEventListener("click", () => {
    window.location.href = "complete.html";
  });

  finalSaveButton.addEventListener("click", () => {
    const finalText = finalResponse.value.trim();

    if (!finalText) {
      showFinalError("Enter a final reflection before saving, or choose Finish Without Saving.");
      return;
    }

    sessionStorage.setItem("finalReflection", finalText);
    window.location.href = "complete.html";
  });

  updateNotes();
  renderCurrentTask();
}

/* -------------------- COMPLETE PAGE -------------------- */
if (currentPage === "complete.html") {
  const summaryStartingTask = document.getElementById("summary-starting-task");
  const summaryPlan = document.getElementById("summary-plan");
  const summaryCheckin = document.getElementById("summary-checkin");
  const summaryFinalReflection = document.getElementById("summary-final-reflection");
  const startOverButton = document.getElementById("start-over-button");

  const startingTask = sessionStorage.getItem("startingTask");
  const planResponse = sessionStorage.getItem("planResponse");
  const checkinConfidence = sessionStorage.getItem("checkinConfidence");
  const checkinResponse = sessionStorage.getItem("checkinResponse");
  const finalReflection = sessionStorage.getItem("finalReflection");

  summaryStartingTask.textContent = startingTask ? formatTaskName(startingTask) : "Not recorded";
  summaryPlan.textContent = planResponse && planResponse.trim() ? planResponse : "No plan saved";
  summaryCheckin.textContent =
    [checkinConfidence, checkinResponse].filter(Boolean).join(" — ") || "No check-in saved";
  summaryFinalReflection.textContent =
    finalReflection && finalReflection.trim() ? finalReflection : "No final reflection saved";

  startOverButton.addEventListener("click", () => {
    sessionStorage.removeItem("startingTask");
    sessionStorage.removeItem("planResponse");
    sessionStorage.removeItem("checkinConfidence");
    sessionStorage.removeItem("checkinResponse");
    sessionStorage.removeItem("finalReflection");
    window.location.href = "index.html";
  });
}