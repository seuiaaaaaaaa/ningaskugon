function setupStudyWeek() {
  const busyDayChoices = [
    { label: "Use ten minutes to answer two questions.", next: "keptGoing" },
    { label: "Skip tonight and move the whole session to Thursday.", next: "putItOff" }
  ];
  const scenes = {
    monday: {
      stage: "Monday · The Spark",
      heading: "The quiz is on Friday",
      text: "You’re motivated after getting a low score on your last quiz. What study plan will you start with?",
      choices: [
        { label: "Review five questions after dinner each school night.", next: "smallStart" },
        { label: "Review two chapters every night until the quiz.", next: "bigStart" }
      ]
    },
    smallStart: {
      stage: "Wednesday · The Fade",
      heading: "Your group project runs late",
      consequence: "You finished five questions on Monday and Tuesday. The short reviews fit those evenings.",
      text: "Tonight you only have ten minutes before bed. You’re tired and tempted to skip the session. What do you do next?",
      choices: busyDayChoices
    },
    bigStart: {
      stage: "Wednesday · The Fade",
      heading: "Your group project runs late",
      consequence: "You got through two chapters on Monday, then stayed up late trying to do it again on Tuesday. The plan is getting harder to repeat.",
      text: "Tonight you only have ten minutes before bed. There’s no time for two chapters. What do you do next?",
      choices: busyDayChoices
    },
    keptGoing: {
      stage: "Thursday · Keep the habit going",
      heading: "You found two topics to review",
      consequence: "The ten-minute session kept you going and showed you what you still needed to practice.",
      text: "A classmate is also reviewing tonight. How will you spend your last study session?",
      choices: [
        { label: "Ask my classmate to quiz me on those two topics.", next: "steadyFinish" },
        { label: "Try to cover every topic again before bed.", next: "cramFinish" }
      ]
    },
    putItOff: {
      stage: "Thursday · A chance to restart",
      heading: "Yesterday’s work is still waiting",
      consequence: "Moving the whole session made Thursday feel heavier. It’s tempting to give up on the plan entirely.",
      text: "You have another ten minutes after dinner. What will you do with them?",
      choices: [
        { label: "Start again with the three questions I find hardest.", next: "smallRestart" },
        { label: "Wait until after the quiz and start a stricter plan next week.", next: "repeatCycle" }
      ]
    },
    steadyFinish: {
      stage: "Friday · Your outcome",
      heading: "You built on Wednesday’s progress",
      consequence: "Your classmate helped you practice the topics you struggled with. You went into Friday knowing what you had reviewed.",
      text: "You interrupted the cycle by shrinking the task on a busy day, then using what you learned to guide the next session."
    },
    cramFinish: {
      stage: "Friday · Your outcome",
      heading: "A useful review turned into a late night",
      consequence: "You started with topics you already knew and ran out of time for the two that needed practice.",
      text: "A small session helped during the Fade. You can use the same idea before a deadline by choosing what needs your attention first."
    },
    smallRestart: {
      stage: "Friday · Your outcome",
      heading: "You got back on track after missing a day",
      consequence: "You practiced three difficult questions on Thursday. That gave you something concrete to build on for the quiz.",
      text: "The Restart can work when you change the plan to fit the time you actually have."
    },
    repeatCycle: {
      stage: "Friday · Your outcome",
      heading: "The cycle is ready to repeat",
      consequence: "You reached quiz day without reopening your notes. The idea of a stricter plan next week feels exciting again.",
      text: "That fresh burst is the Spark. A smaller first step could help you keep going when the excitement fades."
    }
  };

  const start = document.querySelector("#story-start");
  const play = document.querySelector("#story-play");
  const stage = document.querySelector("#story-stage");
  const heading = document.querySelector("#story-heading");
  const consequence = document.querySelector("#story-consequence");
  const text = document.querySelector("#story-text");
  const choices = document.querySelector("#story-choices");

  function showScene(id) {
    const scene = scenes[id];
    stage.textContent = scene.stage;
    heading.textContent = scene.heading;
    consequence.textContent = scene.consequence || "";
    text.textContent = scene.text;
    choices.replaceChildren(...(scene.choices || []).map(({ label, next }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => showScene(next));
      return button;
    }));
    choices.hidden = !scene.choices;
    start.hidden = Boolean(scene.choices);
    start.textContent = "Replay the story";
    heading.focus();
  }

  start.addEventListener("click", () => {
    play.hidden = false;
    showScene("monday");
  });
  start.hidden = false;
}

setupStudyWeek();
