const stages = [
  {
    title: "The Spark",
    summary: "A new goal feels exciting, and it’s easy to imagine how much you’ll get done.",
    signs: "You make big promises or spend more time setting up than doing the first task.",
    example: "After getting a low quiz score, Vince buys a new planner and fills it with two-hour review blocks every night.",
    help: "Pick one action you can finish today, like reviewing five questions from the quiz."
  },
  {
    title: "The Blaze",
    summary: "You put a lot of energy into the goal while it still feels new.",
    signs: "You do several sessions in a row and use time you usually spend resting.",
    example: "Vince studies late on Monday and Tuesday, then has trouble staying awake in class.",
    help: "Choose a study session you can repeat during a regular week, and put it on the calendar."
  },
  {
    title: "The Fade",
    summary: "The excitement wears off as other deadlines and responsibilities compete for your time.",
    signs: "You skip a session, put off starting, or wait for a day with more time.",
    example: "A group project takes up most of Vince’s Wednesday, and the review session gets pushed to tomorrow.",
    help: "Try a minimum day. Answer one practice question or review your notes for ten minutes."
  },
  {
    title: "The Burnout",
    summary: "The plan starts to feel exhausting, and you stop working on the goal.",
    signs: "You avoid opening the planner or feel like one missed day ruined the whole week.",
    example: "By Friday, Vince has missed two review sessions and leaves the planner in their bag.",
    help: "Take a break and look at what made the plan hard to repeat. Choose one thing to change."
  },
  {
    title: "The Restart",
    summary: "A new week or deadline gives you another chance to pick up the goal.",
    signs: "You feel ready to try again and are tempted to make another packed schedule.",
    example: "On Sunday, Vince schedules three short review sessions and asks a classmate to check in on Friday.",
    help: "Build from what worked. Set a small next step and check how it went at the end of the week."
  }
];

const stageButtons = Array.from(document.querySelectorAll('[role="tab"]'));
const stagePanel = document.querySelector("#stage-detail");

function showStage(index) {
  stageButtons.forEach((button, buttonIndex) => {
    button.setAttribute("aria-selected", buttonIndex === index);
    button.tabIndex = buttonIndex === index ? 0 : -1;
  });
  const stage = stages[index];
  stagePanel.setAttribute("aria-labelledby", stageButtons[index].id);
  document.querySelector("#stage-number").textContent = "Stage " + String(index + 1).padStart(2, "0");
  for (const field of ["title", "summary", "signs", "example", "help"]) {
    document.querySelector("#stage-" + field).textContent = stage[field];
  }
}

stageButtons.forEach((button, index) => {
  button.addEventListener("click", () => showStage(index));
  button.addEventListener("keydown", (event) => {
    const last = stageButtons.length - 1;
    const destinations = {
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowRight: index === last ? 0 : index + 1,
      Home: 0,
      End: last
    };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    const next = destinations[event.key];
    showStage(next);
    stageButtons[next].focus();
  });
});

const storageKey = "ningas-kugon-planner-v1";
const days = document.querySelector("#calendar-days");
const monthLabel = document.querySelector("#calendar-month");
const selectedLabel = document.querySelector("#selected-date");
const taskList = document.querySelector("#tasks");
const taskProgress = document.querySelector("#task-progress");
const taskForm = document.querySelector("#task-form");
const taskName = document.querySelector("#task-name");
const taskType = document.querySelector("#task-type");
const taskReminder = document.querySelector("#task-reminder");
const storageNote = document.querySelector("#storage-note");
const dailyList = document.querySelector("#daily-list");
const reminderAlerts = document.querySelector("#reminder-alerts");
const monthFormat = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" });
const dayFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "full" });
const clockFormat = new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit" });
const narrowScreen = window.matchMedia("(max-width: 640px)");
let selectedDate = new Date();
let displayedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
let tasksByDate = loadTasks();

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (stored && typeof stored === "object" && !Array.isArray(stored)) return stored;
  } catch {
    storageNote.textContent = "Saved plans could not be loaded. New tasks will be shown here.";
  }
  return {};
}

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasksByDate));
    storageNote.textContent = "Plans are saved only in this browser.";
  } catch {
    storageNote.textContent = "Browser storage is unavailable. Tasks will last until you close or reload this page.";
  }
}

function dateKey(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((number) => String(number).padStart(2, "0"))
    .join("-");
}

function renderCalendar() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const selectedKey = dateKey(selectedDate);
  const todayKey = dateKey(new Date());
  const cells = document.createDocumentFragment();
  monthLabel.textContent = monthFormat.format(displayedMonth);

  for (let offset = 0; offset < displayedMonth.getDay(); offset += 1) {
    const blank = document.createElement("span");
    blank.setAttribute("aria-hidden", "true");
    cells.append(blank);
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const count = tasksByDate[key]?.length || 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day";
    button.classList.toggle("has-tasks", count > 0);
    button.dataset.date = key;
    button.textContent = day;
    const taskCount = count ? ", " + count + (count === 1 ? " task" : " tasks") : "";
    button.setAttribute("aria-label", dayFormat.format(date) + taskCount);
    button.setAttribute("aria-pressed", key === selectedKey);
    if (key === todayKey) button.setAttribute("aria-current", "date");
    button.addEventListener("click", (event) => {
      selectedDate = date;
      renderPlanner();
      days.querySelector('[data-date="' + key + '"]').focus({ preventScroll: true });
      if (narrowScreen.matches && event.detail > 0 && dailyList.getBoundingClientRect().top > window.innerHeight - 140) {
        dailyList.scrollIntoView({ block: "start" });
      }
    });
    cells.append(button);
  }

  days.replaceChildren(cells);
}

function updateProgress(tasks) {
  const complete = tasks.filter((task) => task.done).length;
  taskProgress.textContent = tasks.length ? complete + " of " + tasks.length + " completed" : "No tasks planned for this day.";
}

function renderTasks() {
  const key = dateKey(selectedDate);
  const tasks = tasksByDate[key] || [];
  selectedLabel.textContent = dayFormat.format(selectedDate);
  updateProgress(tasks);
  taskList.replaceChildren();

  tasks.forEach((task, index) => {
    const row = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "task-" + index;
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      updateProgress(tasks);
    });

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    const title = document.createElement("span");
    title.textContent = task.name;
    const type = document.createElement("small");
    type.textContent = task.type;
    label.append(title, type);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "task-remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Delete " + task.name);
    remove.addEventListener("click", () => {
      tasks.splice(index, 1);
      if (!tasks.length) delete tasksByDate[key];
      saveTasks();
      renderPlanner();
      const nextButton = taskList.querySelectorAll(".task-remove")[Math.min(index, tasks.length - 1)];
      (nextButton || taskName).focus();
    });

    const taskMain = document.createElement("div");
    taskMain.className = "task-main";
    taskMain.append(checkbox, label, remove);
    row.append(taskMain, reminderEditor(task, key, index));
    taskList.append(row);
  });
}

function readReminder(input, key, current) {
  if (!input.value) return null;
  const at = new Date(key + "T" + input.value).getTime();
  if (current?.at === at) return current;
  if (!Number.isFinite(at) || at <= Date.now()) {
    input.setCustomValidity("Choose a reminder time in the future.");
    input.reportValidity();
    return undefined;
  }
  return {
    at,
    id: current?.id ?? (globalThis.crypto?.randomUUID?.() || Date.now() + "-" + Math.random().toString(36).slice(2)),
    shown: false
  };
}

function reminderEditor(task, key, index) {
  const details = document.createElement("details");
  details.className = "reminder-editor";
  const summary = document.createElement("summary");
  summary.id = "task-reminder-label-" + index;
  summary.textContent = task.reminder ? "Reminder at " + clockFormat.format(task.reminder.at) : "Set reminder";
  const form = document.createElement("form");
  const input = document.createElement("input");
  input.type = "time";
  input.setAttribute("aria-label", "Reminder time for " + task.name);
  if (task.reminder) {
    const date = new Date(task.reminder.at);
    input.value = [date.getHours(), date.getMinutes()].map((part) => String(part).padStart(2, "0")).join(":");
  }
  input.addEventListener("input", () => input.setCustomValidity(""));
  const save = document.createElement("button");
  save.className = "button button-small button-outline";
  save.type = "submit";
  save.textContent = "Save";
  form.append(input, save);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const reminder = readReminder(input, key, task.reminder);
    if (reminder === undefined) return;
    task.reminder = reminder;
    saveTasks();
    renderTasks();
    document.getElementById(summary.id).focus();
  });
  details.append(summary, form);
  if (task.reminder) {
    const clear = document.createElement("button");
    clear.className = "calendar-export";
    clear.type = "button";
    clear.textContent = "Remove reminder";
    clear.addEventListener("click", () => {
      input.value = "";
      input.setCustomValidity("");
      form.requestSubmit();
    });
    const actions = document.createElement("div");
    actions.className = "reminder-actions";
    actions.append(clear);
    details.append(actions);
  }
  return details;
}

function showReminder(task) {
  const alert = document.createElement("div");
  alert.className = "reminder-alert";
  const message = document.createElement("p");
  const heading = document.createElement("strong");
  heading.textContent = "Study reminder";
  message.append(heading, document.createTextNode(task.name));
  const dismiss = document.createElement("button");
  dismiss.className = "task-remove";
  dismiss.type = "button";
  dismiss.textContent = "×";
  dismiss.setAttribute("aria-label", "Dismiss reminder for " + task.name);
  dismiss.addEventListener("click", () => alert.remove());
  alert.append(message, dismiss);
  reminderAlerts.append(alert);
}

function checkReminders() {
  const now = Date.now();
  const due = Object.values(tasksByDate).flat().filter((task) =>
    !task.done && task.reminder && !task.reminder.shown && task.reminder.at <= now
  );
  if (!due.length) return;
  due.forEach((task) => { task.reminder.shown = true; });
  saveTasks();
  due.forEach(showReminder);
}

function renderPlanner() {
  taskReminder.setCustomValidity("");
  renderCalendar();
  renderTasks();
}

function changeMonth(offset) {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + offset, 1);
  selectedDate = displayedMonth;
  renderPlanner();
}

document.querySelector("#prev-month").addEventListener("click", () => changeMonth(-1));
document.querySelector("#next-month").addEventListener("click", () => changeMonth(1));
document.querySelector("#today").addEventListener("click", () => {
  selectedDate = new Date();
  displayedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  renderPlanner();
});

taskName.addEventListener("input", () => taskName.setCustomValidity(""));
taskReminder.addEventListener("input", () => taskReminder.setCustomValidity(""));
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = taskName.value.trim();
  if (!name) {
    taskName.setCustomValidity("Enter a task for this day.");
    taskName.reportValidity();
    return;
  }

  const key = dateKey(selectedDate);
  const reminder = readReminder(taskReminder, key);
  if (reminder === undefined) return;
  tasksByDate[key] ||= [];
  tasksByDate[key].push({ name, type: taskType.value, done: false, reminder });
  saveTasks();
  renderPlanner();
  taskForm.reset();
  taskName.focus();
});

window.addEventListener("storage", (event) => {
  if (event.key !== storageKey && event.key !== null) return;
  tasksByDate = loadTasks();
  renderPlanner();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  checkReminders();
});
window.addEventListener("focus", checkReminders);
window.setInterval(checkReminders, 5000);

renderPlanner();
checkReminders();
