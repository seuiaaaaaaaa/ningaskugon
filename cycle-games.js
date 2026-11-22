function setupClueGame() {
  const entries = [
    {
      question: "Which two lines show the Spark getting ahead of the work?",
      lines: [
        "I went to the library after class.",
        "I spent the whole evening designing a tracker and never opened my notes.",
        "I promised myself I’d cover every chapter by Friday.",
        "I submitted my lab worksheet."
      ],
      clues: [1, 2],
      explanation: "An elaborate setup and a huge promise can feel like progress during the Spark. A small review task gets the actual work started."
    },
    {
      question: "Which two lines show the Fade?",
      lines: [
        "Studying felt exciting on Monday, but I put off yesterday’s review.",
        "My group moved our meeting to Wednesday.",
        "I borrowed a pencil from my seatmate.",
        "I decided to wait for a day when I felt motivated again."
      ],
      clues: [0, 3],
      explanation: "Putting off review and waiting to feel motivated show the Fade. Try a minimum session you can do on a busy day."
    },
    {
      question: "Which two lines show Burnout pulling the student away from the goal?",
      lines: [
        "I was so worn out that I stopped opening my study tracker.",
        "Our teacher handed back our worksheets.",
        "After missing a session, I figured the whole plan was ruined and dropped it.",
        "My classmate sent me the class notes."
      ],
      clues: [0, 2],
      explanation: "Exhaustion and abandoning the plan after one missed session point to Burnout. A smaller restart can help you return to the goal."
    }
  ];
  const start = document.querySelector("#clues-start");
  const play = document.querySelector("#clues-play");
  const round = document.querySelector("#clues-round");
  const question = document.querySelector("#clues-question");
  const lines = document.querySelector("#clues-lines");
  const result = document.querySelector("#clues-result");
  const check = document.querySelector("#clues-check");
  const next = document.querySelector("#clues-next");
  const selected = new Set();
  let index;

  function showEntry() {
    const entry = entries[index];
    selected.clear();
    round.textContent = `Journal entry ${index + 1} of ${entries.length}`;
    question.textContent = entry.question;
    result.textContent = "";
    lines.hidden = false;
    lines.replaceChildren(...entry.lines.map((line, lineIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = line;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        if (selected.delete(lineIndex)) {
          button.setAttribute("aria-pressed", "false");
        } else if (selected.size < entry.clues.length) {
          selected.add(lineIndex);
          button.setAttribute("aria-pressed", "true");
        } else {
          result.textContent = "You already picked two lines. Tap a selected line to swap it out.";
          return;
        }
        result.textContent = "";
      });
      return button;
    }));
    check.hidden = false;
    next.hidden = true;
    question.focus();
  }

  check.addEventListener("click", () => {
    const entry = entries[index];
    if (selected.size < entry.clues.length) {
      result.textContent = "Pick two lines before checking.";
      return;
    }
    const found = entry.clues.filter(clue => selected.has(clue)).length;
    if (found < entry.clues.length) {
      result.textContent = `${found} of ${entry.clues.length} clues found. Swap a line and try again.`;
      return;
    }
    for (const button of lines.children) button.disabled = true;
    result.textContent = entry.explanation;
    next.textContent = index === entries.length - 1 ? "Finish the journal" : "Next journal entry";
    next.hidden = false;
    check.hidden = true;
    next.focus({ preventScroll: true });
  });

  next.addEventListener("click", () => {
    index += 1;
    if (index < entries.length) {
      showEntry();
      return;
    }
    round.textContent = "Journal complete";
    question.textContent = "You spotted all three stages.";
    lines.hidden = true;
    result.textContent = "Notice these clues in your own week and pick a small action before the cycle repeats.";
    next.hidden = true;
    start.textContent = "Replay the journal";
    start.hidden = false;
    question.focus();
  });

  start.addEventListener("click", () => {
    index = 0;
    start.hidden = true;
    play.hidden = false;
    showEntry();
  });
  start.hidden = false;
}

function setupFlameGame() {
  const sessions = [
    "The Spark · Your new goal feels exciting",
    "The Blaze · You want to do more",
    "The Fade · A group project takes extra effort",
    "Your plan feels harder to keep up",
    "Your last chance to practice this week"
  ];
  const actions = [
    { name: "Light review", practice: 1, energy: 1 },
    { name: "Steady practice", practice: 2, energy: -1 },
    { name: "Push hard", practice: 3, energy: -3 },
    { name: "Take a break", practice: 0, energy: 2 }
  ];
  const target = 8;
  const energyGoal = 2;
  const energyLimit = 6;
  const start = document.querySelector("#flame-start");
  const play = document.querySelector("#flame-play");
  const round = document.querySelector("#flame-round");
  const question = document.querySelector("#flame-question");
  const change = document.querySelector("#flame-change");
  const options = document.querySelector("#flame-options");
  const practiceMeter = document.querySelector("#flame-practice");
  const practiceLabel = document.querySelector("#flame-practice-label");
  const energyMeter = document.querySelector("#flame-energy");
  const energyLabel = document.querySelector("#flame-energy-label");
  let session;
  let practice;
  let energy;

  function updateMeters() {
    practiceMeter.value = practice;
    practiceLabel.textContent = `${practice} / ${target}`;
    energyMeter.value = energy;
    energyLabel.textContent = `${energy} / ${energyLimit}`;
  }

  function playSession(previousChoice = "") {
    updateMeters();
    change.textContent = previousChoice;
    if (session === sessions.length) {
      const metGoal = practice >= target && energy >= energyGoal;
      round.textContent = "Week complete";
      question.textContent = metGoal ? "You kept the flame going" : "See what your week added up to";
      const score = `You finished with ${practice} practice points and ${energy} energy.`;
      change.textContent = metGoal
        ? `${score} Adjusting your effort helped you keep practicing through the Fade.`
        : `${score} Aim for ${target} practice and ${energyGoal} energy. Light review can keep the habit going when energy runs low.`;
      options.replaceChildren();
      start.textContent = "Replay the five sessions";
      start.hidden = false;
      question.focus();
      return;
    }

    round.textContent = `Session ${session + 1} of ${sessions.length}`;
    question.textContent = sessions[session];
    options.replaceChildren(...actions.map((action) => {
      const button = document.createElement("button");
      button.type = "button";
      const energyChange = `${action.energy > 0 ? "+" : ""}${action.energy} energy`;
      button.textContent = `${action.name} · +${action.practice} practice · ${energyChange}`;
      button.disabled = energy + action.energy < 0;
      button.addEventListener("click", () => {
        practice += action.practice;
        energy = Math.min(energyLimit, energy + action.energy);
        session += 1;
        let consequence = `${action.name} left you with ${practice} practice and ${energy} energy.`;
        if (session === 2) {
          const lost = Math.min(2, energy);
          energy -= lost;
          consequence += ` Then your group project cost ${lost} energy.`;
        }
        playSession(consequence);
      });
      return button;
    }));
    question.focus();
  }

  start.addEventListener("click", () => {
    session = 0;
    practice = 0;
    energy = 5;
    start.hidden = true;
    play.hidden = false;
    playSession();
  });
  start.hidden = false;
}

setupClueGame();
setupFlameGame();
