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
  const roundLabel = document.querySelector("#quiz-round");
  const progress = document.querySelector("#quiz-progress");
  const question = document.querySelector("#quiz-question");
  const options = document.querySelector("#quiz-options");
  const result = document.querySelector("#quiz-result");
  const next = document.querySelector("#quiz-next");
  let roundIndex = 0;
  let score = 0;
  let attempt = 0;
  progress.max = rounds.length;

  function showRound() {
    const round = rounds[roundIndex];
    roundLabel.textContent = `Round ${roundIndex + 1} of ${rounds.length} · Score ${score}`;
    question.textContent = round.question;
    result.textContent = "";
    next.hidden = true;
    let answerButton;
    options.replaceChildren(...round.options.map((_, position) => {
      const index = (position + attempt - 1) % round.options.length;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = round.options[index];
      if (index === round.answer) answerButton = button;
      button.addEventListener("click", () => {
        const correct = button === answerButton;
        if (correct) score += 1;
        progress.value = roundIndex + 1;
        roundLabel.textContent = `Round ${roundIndex + 1} of ${rounds.length} · Score ${score}`;
        for (const choice of options.children) choice.disabled = true;
        answerButton.classList.add("quiz-answer-correct");
        answerButton.append(" ✓ Correct answer");
        if (!correct) {
          button.classList.add("quiz-answer-missed");
          button.append(" — Your choice");
        }
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
    attempt += 1;
    roundIndex = 0;
    score = 0;
    progress.value = 0;
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
    roundLabel.textContent = "Quiz complete";
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

setupScenarioQuiz();
