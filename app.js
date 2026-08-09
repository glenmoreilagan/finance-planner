const formatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

function createId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const defaultState = {
  categories: [
    { id: createId(), name: "PhilHealth", color: "#0f9f8f" },
    { id: createId(), name: "SSS", color: "#d59621" },
    { id: createId(), name: "Banks", color: "#2f6eb5" },
    { id: createId(), name: "Stocks", color: "#c65a68" },
  ],
  goals: [
    {
      id: createId(),
      name: "Monthly contributions",
      categoryId: null,
      set: "Government",
      target: 12000,
      saved: 3200,
    },
    {
      id: createId(),
      name: "First stock portfolio",
      categoryId: null,
      set: "Investing",
      target: 50000,
      saved: 15000,
    },
  ],
};

defaultState.goals[0].categoryId = defaultState.categories[0].id;
defaultState.goals[1].categoryId = defaultState.categories[3].id;

let state = loadState();
let activeView = "goals";
let activeSet = "All";

const goalForm = document.querySelector("#goalForm");
const categoryForm = document.querySelector("#categoryForm");
const goalList = document.querySelector("#goalList");
const categoryList = document.querySelector("#categoryList");
const goalCategory = document.querySelector("#goalCategory");
const setFilter = document.querySelector("#setFilter");
const goalSets = document.querySelector("#goalSets");

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeView = tab.dataset.view;
    render();
  });
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const target = Number(document.querySelector("#goalTarget").value);
  const saved = Number(document.querySelector("#goalSaved").value || 0);

  state.goals.unshift({
    id: createId(),
    name: document.querySelector("#goalName").value.trim(),
    target,
    saved: Math.min(saved, target),
    categoryId: goalCategory.value,
    set: document.querySelector("#goalSet").value.trim(),
  });

  goalForm.reset();
  saveState();
  render();
});

categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.categories.push({
    id: createId(),
    name: document.querySelector("#categoryName").value.trim(),
    color: document.querySelector("#categoryColor").value,
  });

  categoryForm.reset();
  document.querySelector("#categoryColor").value = "#0f9f8f";
  saveState();
  render();
});

setFilter.addEventListener("change", () => {
  activeSet = setFilter.value;
  renderGoals();
});

function loadState() {
  const saved = localStorage.getItem("pera-goals-state");
  return saved ? JSON.parse(saved) : defaultState;
}

function saveState() {
  localStorage.setItem("pera-goals-state", JSON.stringify(state));
}

function render() {
  renderTabs();
  renderStats();
  renderCategoryOptions();
  renderGoals();
  renderCategories();
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.view === activeView);
  });
  document.querySelector("#goalsView").classList.toggle("is-visible", activeView === "goals");
  document.querySelector("#categoriesView").classList.toggle("is-visible", activeView === "categories");
}

function renderStats() {
  const totalSaved = state.goals.reduce((sum, goal) => sum + goal.saved, 0);
  const average = state.goals.length
    ? Math.round(
        state.goals.reduce((sum, goal) => sum + getProgress(goal), 0) / state.goals.length
      )
    : 0;

  document.querySelector("#totalSaved").textContent = formatter.format(totalSaved);
  document.querySelector("#goalCount").textContent = state.goals.length;
  document.querySelector("#categoryCount").textContent = state.categories.length;
  document.querySelector("#averageProgress").textContent = `${average}%`;
}

function renderCategoryOptions() {
  goalCategory.innerHTML = "";
  state.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    goalCategory.append(option);
  });
}

function renderGoals() {
  const sets = ["All", ...new Set(state.goals.map((goal) => goal.set))];
  if (!sets.includes(activeSet)) activeSet = "All";

  setFilter.innerHTML = "";
  goalSets.innerHTML = "";
  sets.forEach((set) => {
    const option = document.createElement("option");
    option.value = set;
    option.textContent = set;
    setFilter.append(option);

    if (set !== "All") {
      const dataOption = document.createElement("option");
      dataOption.value = set;
      goalSets.append(dataOption);
    }
  });
  setFilter.value = activeSet;

  const visibleGoals =
    activeSet === "All" ? state.goals : state.goals.filter((goal) => goal.set === activeSet);
  goalList.innerHTML = "";

  if (!visibleGoals.length) {
    goalList.innerHTML = '<p class="empty-state">No goals in this set yet.</p>';
    return;
  }

  visibleGoals.forEach((goal) => {
    const category = state.categories.find((item) => item.id === goal.categoryId);
    const card = document.querySelector("#goalTemplate").content.cloneNode(true);
    const article = card.querySelector(".goal-card");
    const title = card.querySelector("h3");
    const subtitle = card.querySelector("p");
    const progress = card.querySelector(".progress-track span");
    const saved = card.querySelector(".money-row strong");
    const target = card.querySelector(".money-row small");

    title.textContent = goal.name;
    subtitle.textContent = `${goal.set} | ${category?.name || "Uncategorized"}`;
    progress.style.width = `${getProgress(goal)}%`;
    progress.style.background = category?.color || "#0f9f8f";
    saved.textContent = formatter.format(goal.saved);
    target.textContent = `${getProgress(goal)}% of ${formatter.format(goal.target)}`;

    card.querySelector(".ghost-button").addEventListener("click", () => {
      state.goals = state.goals.filter((item) => item.id !== goal.id);
      saveState();
      render();
    });

    card.querySelectorAll(".quick-add button").forEach((button) => {
      button.addEventListener("click", () => {
        goal.saved = Math.min(goal.target, goal.saved + Number(button.dataset.add));
        saveState();
        render();
      });
    });

    article.style.borderColor = category?.color || "#dce5e4";
    goalList.append(card);
  });
}

function renderCategories() {
  categoryList.innerHTML = "";
  state.categories.forEach((category) => {
    const usedBy = state.goals.filter((goal) => goal.categoryId === category.id).length;
    const card = document.querySelector("#categoryTemplate").content.cloneNode(true);
    card.querySelector(".swatch").style.background = category.color;
    card.querySelector("h3").textContent = category.name;
    card.querySelector("small").textContent = `${usedBy} goal${usedBy === 1 ? "" : "s"}`;
    card.querySelector(".ghost-button").addEventListener("click", () => {
      state.categories = state.categories.filter((item) => item.id !== category.id);
      state.goals = state.goals.map((goal) =>
        goal.categoryId === category.id ? { ...goal, categoryId: state.categories[0]?.id || null } : goal
      );
      saveState();
      render();
    });
    categoryList.append(card);
  });
}

function getProgress(goal) {
  return Math.min(100, Math.round((goal.saved / goal.target) * 100));
}

render();
