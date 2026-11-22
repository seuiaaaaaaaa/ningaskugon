function setupFeedbackForm() {
  const form = document.querySelector("#feedback-form");
  const type = document.querySelector("#feedback-type");
  const message = document.querySelector("#feedback-message");
  const note = document.querySelector("#feedback-note");
  const status = document.querySelector("#feedback-status");
  const submit = document.querySelector("#feedback-submit");
  const draftKey = "ningas-kugon-feedback-draft-v1";
  // Netlify injects form-name at deploy time when it registers the form.
  const canSend = Boolean(form.elements.namedItem("form-name"));
  let dirty = false;

  function loadDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey));
      message.value = typeof draft?.message === "string" ? draft.message : "";
      type.value = draft?.type === "Suggestion" ? "Suggestion" : "Comment";
    } catch {
      status.textContent = "A saved draft could not be loaded.";
    }
  }

  if (canSend) {
    note.textContent = "Your message goes privately to the study guide team.";
    submit.textContent = "Send feedback";
  } else {
    loadDraft();
    window.addEventListener("pageshow", (event) => {
      if (event.persisted && !dirty) {
        status.textContent = "";
        loadDraft();
      }
    });
  }

  type.addEventListener("change", () => { dirty = true; });
  message.addEventListener("input", () => {
    dirty = true;
    message.setCustomValidity("");
    status.textContent = "";
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = message.value.trim();
    if (!text) {
      message.setCustomValidity("Please enter a message.");
      message.reportValidity();
      return;
    }
    if (!canSend) {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ type: type.value, message: text }));
        dirty = false;
        status.textContent = "Draft saved in this browser.";
      } catch {
        status.textContent = "Browser storage is unavailable. Your message is still in the form.";
      }
      return;
    }

    const data = new FormData(form);
    data.set("message", text);
    submit.disabled = true;
    message.readOnly = true;
    type.disabled = true;
    status.textContent = "Sending feedback…";
    try {
      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: new URLSearchParams(data)
      });
      if (!response.ok) throw new Error("Feedback submission failed");
      form.reset();
      status.textContent = "Thanks for sharing your feedback!";
    } catch {
      status.textContent = "Feedback could not be sent. Your message is still in the form.";
    } finally {
      submit.disabled = false;
      message.readOnly = false;
      type.disabled = false;
    }
  });
  form.hidden = false;
}

setupFeedbackForm();
