const mealInput = document.querySelector("#meal");
const notesInput = document.querySelector("#notes");
const timeInput = document.querySelector("#time");
const moodInput = document.querySelector("#mood");
const addEntryButton = document.querySelector("#add-entry");
const clearFormButton = document.querySelector("#clear-form");
const entriesList = document.querySelector("#entries-list");
const todayCount = document.querySelector("#today-count");
const recentEntry = document.querySelector("#recent-entry");
const sortNewest = document.querySelector("#sort-newest");
const sortOldest = document.querySelector("#sort-oldest");
const entryTemplate = document.querySelector("#entry-template");

const STORAGE_KEY = "eatlog.entries";
let sortDirection = "newest";

const defaultTimeValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const loadEntries = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Unable to parse stored entries", error);
    return [];
  }
};

const saveEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const formatDate = (value) => {
  if (!value) {
    return "No time set";
  }
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const renderSummary = (entries) => {
  const today = new Date().toDateString();
  const todayEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.time).toDateString();
    return entryDate === today;
  });
  todayCount.textContent = `${todayEntries.length} entr${
    todayEntries.length === 1 ? "y" : "ies"
  }`;

  if (entries.length === 0) {
    recentEntry.textContent = "Add your first meal.";
    return;
  }

  const mostRecent = [...entries].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  )[0];
  recentEntry.textContent = `${mostRecent.meal} · ${formatDate(
    mostRecent.time
  )}`;
};

const renderEntries = (entries) => {
  entriesList.innerHTML = "";
  const sorted = [...entries].sort((a, b) => {
    const diff = new Date(a.time) - new Date(b.time);
    return sortDirection === "newest" ? -diff : diff;
  });

  sorted.forEach((entry) => {
    const clone = entryTemplate.content.cloneNode(true);
    clone.querySelector(".entry-meal").textContent = entry.meal;
    clone.querySelector(".entry-notes").textContent =
      entry.notes || "No notes";
    clone.querySelector(".entry-time").textContent = formatDate(entry.time);
    clone.querySelector(".entry-mood").textContent = entry.mood || "Mood: —";
    entriesList.appendChild(clone);
  });
};

const clearForm = () => {
  mealInput.value = "";
  notesInput.value = "";
  timeInput.value = defaultTimeValue();
  moodInput.value = "";
  mealInput.focus();
};

const handleAddEntry = () => {
  const meal = mealInput.value.trim();
  if (!meal) {
    mealInput.focus();
    mealInput.setCustomValidity("Please add a meal name.");
    mealInput.reportValidity();
    mealInput.setCustomValidity("");
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    meal,
    notes: notesInput.value.trim(),
    time: timeInput.value || defaultTimeValue(),
    mood: moodInput.value,
  };

  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  renderEntries(entries);
  renderSummary(entries);
  clearForm();
};

const init = () => {
  timeInput.value = defaultTimeValue();
  const entries = loadEntries();
  renderEntries(entries);
  renderSummary(entries);
};

addEntryButton.addEventListener("click", handleAddEntry);
clearFormButton.addEventListener("click", clearForm);

sortNewest.addEventListener("click", () => {
  sortDirection = "newest";
  renderEntries(loadEntries());
});

sortOldest.addEventListener("click", () => {
  sortDirection = "oldest";
  renderEntries(loadEntries());
});

init();
