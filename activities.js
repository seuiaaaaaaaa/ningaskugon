function setupMemoryGame() {
  const items = [
    { name: "Book", symbol: "▤" },
    { name: "Pencil", symbol: "✎" },
    { name: "Clock", symbol: "◷" },
    { name: "Star", symbol: "★" }
  ];
  const start = document.querySelector("#memory-start");
  const play = document.querySelector("#memory-play");
  const board = document.querySelector("#memory-board");
  const score = document.querySelector("#memory-score");
  const result = document.querySelector("#memory-result");
  let firstCard;
  let mismatchTimer;
  let pairs;
  let turns;

  function updateScore() {
    score.textContent = `${pairs} of ${items.length} pairs · ${turns} ${turns === 1 ? "turn" : "turns"}`;
  }

  function showCard(card) {
    card.button.textContent = card.item.symbol;
    card.button.setAttribute("aria-label", `Card ${card.number}, ${card.item.name}`);
    card.button.dataset.face = "up";
  }

  function coverCard(card) {
    card.button.textContent = "?";
    card.button.setAttribute("aria-label", `Card ${card.number}, face down`);
    card.button.dataset.face = "down";
  }

  function flip(card) {
    if (mismatchTimer || card === firstCard || card.button.disabled) return;
    showCard(card);
    if (!firstCard) {
      firstCard = card;
      result.textContent = `${card.item.name}. Choose a second card.`;
      return;
    }

    const previous = firstCard;
    firstCard = null;
    turns += 1;
    if (previous.item !== card.item) {
      updateScore();
      result.textContent = `${previous.item.name} and ${card.item.name} don't match. Try another pair.`;
      mismatchTimer = window.setTimeout(() => {
        coverCard(previous);
        coverCard(card);
        mismatchTimer = null;
      }, 850);
      return;
    }

    for (const matched of [previous, card]) {
      matched.button.dataset.face = "matched";
      matched.button.disabled = true;
      matched.button.setAttribute("aria-label", `Card ${matched.number}, ${matched.item.name}, matched`);
    }
    pairs += 1;
    updateScore();
    if (pairs === items.length) {
      result.textContent = `You found all four pairs in ${turns} turns!`;
      start.focus({ preventScroll: true });
      return;
    }
    result.textContent = `${card.item.name} pair found. Keep going!`;
    board.querySelector("button:enabled").focus({ preventScroll: true });
  }

  start.addEventListener("click", () => {
    window.clearTimeout(mismatchTimer);
    mismatchTimer = null;
    firstCard = null;
    pairs = 0;
    turns = 0;
    const deck = [...items, ...items];
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[swap]] = [deck[swap], deck[index]];
    }
    board.replaceChildren(...deck.map((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const card = { item, button, number: index + 1 };
      coverCard(card);
      button.addEventListener("click", () => flip(card));
      return button;
    }));
    updateScore();
    result.textContent = "Choose a card to flip.";
    play.hidden = false;
    start.textContent = "Shuffle and play again";
    board.firstElementChild.focus();
  });
  start.hidden = false;
}

function setupSparkGame() {
  const play = document.querySelector("#spark-play");
  const actions = document.querySelector("#spark-actions");
  const start = document.querySelector("#spark-start");
  const practice = document.querySelector("#spark-practice");
  const board = document.querySelector("#spark-board");
  const score = document.querySelector("#spark-score");
  const result = document.querySelector("#spark-result");
  const practiceGoal = 10;
  let target = -1;
  let hits;
  let misses;
  let deadline;
  let timer;
  let active = false;

  const tiles = Array.from({ length: 9 }, (_, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.addEventListener("click", () => chooseTile(index));
    return tile;
  });
  board.replaceChildren(...tiles);

  function paintBoard() {
    tiles.forEach((tile, index) => {
      const isSpark = active && index === target;
      tile.textContent = isSpark ? "★" : String(index + 1);
      tile.setAttribute("aria-label", `Tile ${index + 1}${isSpark ? ", spark" : ""}`);
      tile.dataset.spark = String(isSpark);
      tile.disabled = !active;
    });
  }

  function updateScore() {
    const lead = deadline ? `${Math.max(0, Math.ceil((deadline - Date.now()) / 1000))}s left` : `Practice goal ${practiceGoal}`;
    score.textContent = `${lead} · Hits ${hits} · Misses ${misses}`;
  }

  function finishRound() {
    const focusWasOnBoard = board.contains(document.activeElement);
    active = false;
    window.clearInterval(timer);
    paintBoard();
    updateScore();
    const accuracy = hits + misses ? Math.round(hits * 100 / (hits + misses)) : 0;
    result.textContent = `${deadline ? "Time's up!" : "Practice complete!"} ${hits} caught · ${accuracy}% accuracy.`;
    if (focusWasOnBoard) (deadline ? start : practice).focus({ preventScroll: true });
  }

  function moveSpark() {
    const next = Math.floor(Math.random() * (tiles.length - 1));
    target = next >= target ? next + 1 : next;
    paintBoard();
  }

  function chooseTile(index) {
    if (!active) return;
    if (deadline && Date.now() >= deadline) {
      finishRound();
      return;
    }
    if (index === target) {
      hits += 1;
      if (!deadline && hits === practiceGoal) {
        finishRound();
        return;
      }
      moveSpark();
    } else {
      misses += 1;
    }
    updateScore();
    if (!deadline) result.textContent = `Hits ${hits}. The spark is on tile ${target + 1}.`;
  }

  function startRound(timed) {
    window.clearInterval(timer);
    hits = 0;
    misses = 0;
    deadline = timed ? Date.now() + 20000 : 0;
    active = true;
    play.hidden = false;
    target = Math.floor(Math.random() * tiles.length);
    paintBoard();
    updateScore();
    result.textContent = timed ? "" : `The spark is on tile ${target + 1}.`;
    tiles[0].focus();
    if (timed) {
      timer = window.setInterval(() => {
        if (Date.now() >= deadline) finishRound();
        else updateScore();
      }, 250);
    }
  }

  board.addEventListener("keydown", (event) => {
    if (active && /^[1-9]$/.test(event.key)) {
      event.preventDefault();
      chooseTile(Number(event.key) - 1);
    }
  });
  start.addEventListener("click", () => startRound(true));
  practice.addEventListener("click", () => startRound(false));
  actions.hidden = false;
}

function setupBudgetGame() {
  const activities = [
    { name: "Review missed questions", group: "Review", minutes: 10 },
    { name: "Read a full chapter", group: "Review", minutes: 15 },
    { name: "Try three practice problems", group: "Practice", minutes: 10 },
    { name: "Take a practice quiz", group: "Practice", minutes: 15 },
    { name: "Stretch and get water", group: "Break", minutes: 5 },
    { name: "Go for a short walk", group: "Break", minutes: 10 }
  ];
  const times = [25, 30, 35];
  const start = document.querySelector("#budget-start");
  const play = document.querySelector("#budget-play");
  const board = document.querySelector("#budget-options");
  const score = document.querySelector("#budget-score");
  const result = document.querySelector("#budget-result");
  const check = document.querySelector("#budget-check");
  const picks = new Map();
  let timeIndex = -1;

  function minutesLeft() {
    return times[timeIndex] - [...picks.values()].reduce((total, item) => total + item.minutes, 0);
  }

  function updateBudget() {
    const left = minutesLeft();
    const remaining = left < 0 ? `${-left} min over` : `${left} min left`;
    score.textContent = `${times[timeIndex]} min available · ${remaining} · ${picks.size} of 3 activity types`;
    for (const [index, button] of Array.from(board.children).entries()) {
      const item = activities[index];
      button.setAttribute("aria-pressed", String(picks.get(item.group) === item));
    }
  }

  start.addEventListener("click", () => {
    timeIndex = (timeIndex + 1) % times.length;
    picks.clear();
    result.textContent = "";
    check.disabled = false;
    board.replaceChildren(...activities.map((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${item.group} · ${item.name} · ${item.minutes} min`;
      button.addEventListener("click", () => {
        if (picks.get(item.group) === item) picks.delete(item.group);
        else picks.set(item.group, item);
        result.textContent = "";
        updateBudget();
      });
      return button;
    }));
    updateBudget();
    play.hidden = false;
    start.hidden = true;
    board.firstElementChild.focus();
  });

  check.addEventListener("click", () => {
    if (picks.size < 3) {
      result.textContent = "Choose one review, one practice task, and one break.";
      return;
    }
    const left = minutesLeft();
    if (left < 0) {
      result.textContent = `You're ${-left} minutes over. Swap in a shorter activity and check again.`;
      return;
    }
    if (left > 0) {
      result.textContent = `You have ${left} minutes left. Try to use all the available time.`;
      return;
    }
    result.textContent = `Solved! All three activities fit exactly in ${times[timeIndex]} minutes.`;
    check.disabled = true;
    for (const button of board.children) button.disabled = true;
    start.textContent = "Try the next time budget";
    start.hidden = false;
    start.focus({ preventScroll: true });
  });
  start.hidden = false;
}

setupMemoryGame();
setupSparkGame();
setupBudgetGame();
