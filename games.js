function setupScenarioQuiz() {
  const rounds = [
    {
      question: "Mika has a quiz on Friday and wants to review the entire book tonight. What should she do first?",
      options: ["Copy every chapter heading into a new planner", "Review five questions from the last lesson", "Set aside the whole evening for review"],
      answer: 1,
      explanation: "Five questions give Mika a clear first step she can finish today."
    },
    {
      question: "Luis studied on Monday and Tuesday, but a group project took up his Wednesday. He starts putting off his usual review. Which stage is this?",
      options: ["The Fade", "The Spark", "The Restart"],
      answer: 0,
      explanation: "During the Fade, the initial excitement wears off and other responsibilities start crowding out the plan."
    },
    {
      question: "Aya misses a study session. She only has ten minutes free the next day. What's her best move?",
      options: ["Wait until next week to start again", "Double tomorrow’s review time", "Use the ten minutes to review one topic"],
      answer: 2,
      explanation: "A short review fits the time Aya has and helps her get back into the routine."
    },
    {
      question: "Jiro keeps forgetting to review at home. Which plan gives him a clear cue to start?",
      options: ["After dinner on Monday and Wednesday, answer three practice questions", "Study whenever there’s enough time", "Promise to finish every pending task this week"],
      answer: 0,
      explanation: "Linking a small task to dinner gives Jiro a specific cue and a clear stopping point."
    }
  ];
  const start = document.querySelector("#quiz-start");
  const play = document.querySelector("#quiz-play");
  const progress = document.querySelector("#quiz-round");
  const question = document.querySelector("#quiz-question");
  const options = document.querySelector("#quiz-options");
  const result = document.querySelector("#quiz-result");
  const next = document.querySelector("#quiz-next");
  let roundIndex = 0;
  let score = 0;

  function showRound() {
    const round = rounds[roundIndex];
    progress.textContent = `Round ${roundIndex + 1} of ${rounds.length} · Score ${score}`;
    question.textContent = round.question;
    result.textContent = "";
    next.hidden = true;
    options.replaceChildren(...round.options.map((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        const correct = index === round.answer;
        if (correct) score += 1;
        progress.textContent = `Round ${roundIndex + 1} of ${rounds.length} · Score ${score}`;
        button.setAttribute("aria-pressed", "true");
        for (const choice of options.children) choice.disabled = true;
        result.textContent = correct
          ? `Correct! ${round.explanation}`
          : `Best answer: ${round.options[round.answer]}. ${round.explanation}`;
        const last = roundIndex === rounds.length - 1;
        next.textContent = last ? "See score" : "Next round";
        next.hidden = false;
        next.focus({ preventScroll: true });
      });
      return button;
    }));
    question.focus();
  }

  start.addEventListener("click", () => {
    roundIndex = 0;
    score = 0;
    start.hidden = true;
    play.hidden = false;
    showRound();
  });
  next.addEventListener("click", () => {
    roundIndex += 1;
    if (roundIndex < rounds.length) {
      showRound();
      return;
    }
    progress.textContent = "Quiz complete";
    question.textContent = `You got ${score} out of ${rounds.length}.`;
    options.replaceChildren();
    result.textContent = "";
    next.hidden = true;
    start.textContent = "Play quiz again";
    start.hidden = false;
    question.focus();
  });
  start.hidden = false;
}

function setupStageOrderGame() {
  const start = document.querySelector("#order-start");
  const play = document.querySelector("#order-play");
  const picks = document.querySelector("#order-picks");
  const options = document.querySelector("#order-options");
  const result = document.querySelector("#order-result");

  start.addEventListener("click", () => {
    picks.replaceChildren();
    result.textContent = "Choose the first stage.";
    const shuffledStages = [2, 4, 1, 0, 3];
    options.replaceChildren(...shuffledStages.map((index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = stages[index].title;
      button.addEventListener("click", () => {
        const nextIndex = picks.children.length;
        if (index !== nextIndex) {
          result.textContent = `Try again. Hint: ${stages[nextIndex].summary}`;
          return;
        }
        const pick = document.createElement("li");
        pick.textContent = stages[index].title;
        picks.append(pick);
        button.disabled = true;
        const nextButton = options.querySelector("button:enabled");
        if (nextButton) {
          result.textContent = `${stages[index].title} is correct. Choose the next stage.`;
          nextButton.focus({ preventScroll: true });
          return;
        }
        result.textContent = "All five stages are in order! What small step could help you keep going during the Fade?";
        start.textContent = "Play challenge again";
        start.hidden = false;
        start.focus({ preventScroll: true });
      });
      return button;
    }));
    start.hidden = true;
    play.hidden = false;
    options.firstElementChild.focus();
  });
  start.hidden = false;
}

function setupPlanGame() {
  const form = document.querySelector("#plan-game");
  const result = document.querySelector("#plan-game-result");
  form.addEventListener("change", () => { result.textContent = ""; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const cue = data.get("cue");
    const activity = data.get("activity");
    const duration = data.get("duration");
    const tips = [];
    if (cue === "vague") tips.push("Pick a cue you can notice, like finishing dinner.");
    if (activity === "vague") tips.push("Pick one task you can clearly tell you’ve finished.");
    if (duration === "long") tips.push("Try 10 or 15 minutes so the plan fits a busy night.");
    result.textContent = tips.length
      ? tips.join(" ")
      : `Ready to try: ${cue}, I’ll ${activity} for ${duration}.`;
  });
  form.hidden = false;
}

function setupMatchingGame() {
  const form = document.querySelector("#match-game");
  const result = document.querySelector("#match-game-result");
  const strategies = {
    distraction: "Silence notifications before opening your notes",
    alone: "Ask a study buddy to check in on Friday",
    busy: "Review one topic for ten minutes"
  };
  const fields = Array.from(form.querySelectorAll("select"));
  for (const field of fields) {
    for (const [obstacle, strategy] of Object.entries(strategies)) {
      field.add(new Option(strategy, obstacle));
    }
  }
  form.addEventListener("change", () => { result.textContent = ""; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const missed = fields.map((field, index) => field.value === field.name ? null : index + 1).filter(Boolean);
    result.textContent = missed.length
      ? `${fields.length - missed.length} of ${fields.length} correct. Try a different strategy for ${missed.length === 1 ? "row" : "rows"} ${missed.join(", ")}.`
      : "All three match! A short review fits a busy day, fewer notifications protect your focus, and a study buddy helps you check in.";
  });
  form.hidden = false;
}

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

  if (canSend) {
    note.textContent = "Your message goes privately to the study guide team.";
    submit.textContent = "Send feedback";
  } else {
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey));
      if (draft && typeof draft.message === "string") {
        message.value = draft.message;
        if (draft.type === "Suggestion") type.value = draft.type;
      }
    } catch {
      status.textContent = "A saved draft could not be loaded.";
    }
  }

  message.addEventListener("input", () => message.setCustomValidity(""));
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

setupScenarioQuiz();
setupStageOrderGame();
setupPlanGame();
setupMatchingGame();
setupFeedbackForm();
