import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  GoogleAuthProvider,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCNzPgcW2ytan1zznO_S2jWRnHGTr7QNFk",
  authDomain: "budget-a1925.firebaseapp.com",
  projectId: "budget-a1925",
  storageBucket: "budget-a1925.firebasestorage.app",
  messagingSenderId: "719338777410",
  appId: "1:719338777410:web:a41228be8bc0c573bf76db",
};

const FIREBASE_READY =
  FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.includes("REPLACE_ME");

let auth = null;
let db = null;
if (FIREBASE_READY) {
  const app = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getFirestore(app);
}

const LOCAL_KEY = "budget.config.v1";
const MODE_KEY = "budget.mode";
const HELP_DISMISSED_KEY = "budget.help-dismissed";
const OVERSKUD_LABEL = "Overskud";
const CATEGORY_KINDS = [
  { value: "shared", label: "Delt" },
  { value: "personal", label: "Pr. person" },
];

const ACCENTS = [
  {
    headerClass: "text-rose-600",
    forbrugClass: "text-rose-600 font-semibold",
    canvas: "#e11d48",
  },
  {
    headerClass: "text-indigo-600",
    forbrugClass: "text-indigo-600 font-semibold",
    canvas: "#4f46e5",
  },
  {
    headerClass: "text-emerald-600",
    forbrugClass: "text-emerald-600 font-semibold",
    canvas: "#059669",
  },
  {
    headerClass: "text-amber-600",
    forbrugClass: "text-amber-600 font-semibold",
    canvas: "#d97706",
  },
  {
    headerClass: "text-sky-600",
    forbrugClass: "text-sky-600 font-semibold",
    canvas: "#0284c7",
  },
  {
    headerClass: "text-fuchsia-600",
    forbrugClass: "text-fuchsia-600 font-semibold",
    canvas: "#c026d3",
  },
];

const welcomeView = document.getElementById("welcomeView");
const mainView = document.getElementById("mainView");
const configView = document.getElementById("configView");
const moreView = document.getElementById("moreView");
const topNav = document.getElementById("topNav");
const tabMain = document.getElementById("tabMain");
const tabConfig = document.getElementById("tabConfig");
const tabMore = document.getElementById("tabMore");
const helpSheet = document.getElementById("helpSheet");
const helpSheetBackdrop = document.getElementById("helpSheetBackdrop");
const helpSheetBack = document.getElementById("helpSheetBack");
const helpSheetNext = document.getElementById("helpSheetNext");
const helpSteps = Array.from(helpSheet.querySelectorAll("[data-help-step]"));
const helpDots = Array.from(helpSheet.querySelectorAll("[data-help-dot]"));
const welcomeSignInButton = document.getElementById("welcomeSignInButton");
const welcomeLocalButton = document.getElementById("welcomeLocalButton");
const incomeInputs = document.getElementById("incomeInputs");
const budgetContent = document.getElementById("budgetContent");
const mainEmptyState = document.getElementById("mainEmptyState");
const overskudSection = document.getElementById("overskudSection");
const resultCards = document.getElementById("resultCards");
const totalForbrug = document.getElementById("totalForbrug");
const calcButton = document.getElementById("calcButton");
const resetButton = document.getElementById("resetButton");
const downloadButton = document.getElementById("downloadButton");
const calcWarning = document.getElementById("calcWarning");
const calcWarningAmount = document.getElementById("calcWarningAmount");
const peopleList = document.getElementById("peopleList");
const peopleAddButton = document.getElementById("peopleAddButton");
const configList = document.getElementById("configList");
const configAddButton = document.getElementById("configAddButton");
const configSaveButton = document.getElementById("configSaveButton");
const authStatus = document.getElementById("authStatus");
const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const deleteLocalButton = document.getElementById("deleteLocalButton");
const deleteAccountButton = document.getElementById("deleteAccountButton");
const loadingOverlay = document.getElementById("loadingOverlay");

function showLoading() {
  loadingOverlay?.classList.remove("is-hidden");
}

function hideLoading() {
  loadingOverlay?.classList.add("is-hidden");
}

let currentUser = null;
let config = { people: [], spending: [] };
let lastResult = null;
let currentShortfall = 0;

function isLocalMode() {
  return localStorage.getItem(MODE_KEY) === "local";
}

function setLocalMode() {
  localStorage.setItem(MODE_KEY, "local");
}

function clearLocalMode() {
  localStorage.removeItem(MODE_KEY);
}

function hasConfig() {
  return config.people.length > 0 || config.spending.length > 0;
}

function isAuthed() {
  return FIREBASE_READY && currentUser != null;
}

function determineView() {
  if (!isAuthed() && !isLocalMode() && FIREBASE_READY) return "welcome";
  return hasConfig() ? "main" : "config";
}

function setTabActive(tab, active) {
  tab.classList.toggle("border-slate-800", active);
  tab.classList.toggle("text-slate-900", active);
  tab.classList.toggle("font-semibold", active);
  tab.classList.toggle("border-transparent", !active);
  tab.classList.toggle("text-slate-500", !active);
  tab.classList.toggle("font-medium", !active);
}

function setView(name) {
  welcomeView.classList.toggle("hidden", name !== "welcome");
  mainView.classList.toggle("hidden", name !== "main");
  configView.classList.toggle("hidden", name !== "config");
  moreView.classList.toggle("hidden", name !== "more");
  const showTabs = name !== "welcome";
  topNav.classList.toggle("hidden", !showTabs);
  topNav.classList.toggle("grid", showTabs);
  setTabActive(tabMain, name === "main");
  setTabActive(tabConfig, name === "config");
  setTabActive(tabMore, name === "more");
  if (name === "config" && localStorage.getItem(HELP_DISMISSED_KEY) !== "true") {
    showHelpSheet();
  }
  hideLoading();
}

let helpStep = 0;

function renderHelpStep() {
  helpSteps.forEach((el, i) => el.classList.toggle("hidden", i !== helpStep));
  helpDots.forEach((el, i) => {
    el.classList.toggle("bg-slate-800", i === helpStep);
    el.classList.toggle("bg-slate-300", i !== helpStep);
  });
  helpSheetBack.classList.toggle("hidden", helpStep === 0);
  helpSheetNext.textContent =
    helpStep === helpSteps.length - 1 ? "Forstået" : "Næste";
}

function showHelpSheet() {
  helpStep = 0;
  renderHelpStep();
  helpSheet.classList.remove("hidden");
  helpSheet.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function dismissHelpSheet() {
  helpSheet.classList.add("hidden");
  helpSheet.classList.remove("flex");
  document.body.style.overflow = "";
  localStorage.setItem(HELP_DISMISSED_KEY, "true");
}

function formatNumber(value) {
  return Number(value).toLocaleString("da-DK");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function newId() {
  return crypto.randomUUID();
}

function accentFor(personIndex) {
  return ACCENTS[personIndex % ACCENTS.length];
}

function normalizeConfig(raw) {
  const people = Array.isArray(raw?.people)
    ? raw.people
        .filter((p) => p && typeof p.name === "string")
        .map((p) => ({ id: p.id || newId(), name: p.name }))
    : [];
  const spending = Array.isArray(raw?.spending)
    ? raw.spending
        .filter((c) => c && typeof c.label === "string")
        .map((c) => ({
          id: c.id || newId(),
          label: c.label,
          target: Number(c.target) || 0,
          kind: c.kind === "personal" ? "personal" : "shared",
        }))
    : [];
  if (
    Number.isFinite(Number(raw?.selvCap)) &&
    Number(raw.selvCap) > 0 &&
    !spending.some((c) => c.kind === "personal")
  ) {
    spending.push({
      id: newId(),
      label: "Selv",
      target: Number(raw.selvCap),
      kind: "personal",
    });
  }
  return { people, spending };
}

function loadLocalConfig() {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return null;
  try {
    return normalizeConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveLocalConfig(cfg) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(cfg));
}

async function loadRemoteConfig(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? normalizeConfig(snap.data()) : null;
}

async function saveRemoteConfig(uid, cfg) {
  await setDoc(doc(db, "users", uid), cfg);
}

async function persistConfig() {
  if (currentUser && db) {
    await saveRemoteConfig(currentUser.uid, config);
  } else {
    saveLocalConfig(config);
  }
}

function rowHtml(label, amount, accent, { separator = false, forbrug = false } = {}) {
  const amountClass = forbrug ? accent.forbrugClass : "font-medium text-slate-900";
  const amountStr =
    amount == null
      ? `<span class="text-slate-300">—</span>`
      : formatNumber(amount);
  const rowClass = separator
    ? "flex items-center justify-between border-t border-slate-200 mt-2 pt-3"
    : "flex items-center justify-between py-1.5";
  return `<div class="${rowClass}">
    <dt class="text-slate-600">${escapeHtml(label)}</dt>
    <dd class="tabular-nums ${amountClass}">${amountStr}</dd>
  </div>`;
}

function renderIncomeInputs() {
  if (!config.people.length) {
    incomeInputs.innerHTML = `<div class="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3 text-center text-sm text-slate-400">Tilføj personer i konfigurationen</div>`;
    return;
  }
  incomeInputs.innerHTML = `<div class="space-y-2">${config.people
    .map(
      (p) => `<label class="block">
        <span class="mb-1 block text-xs font-medium text-slate-500">${escapeHtml(p.name)}</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" placeholder="Indkomst"
          data-person-income="${p.id}"
          class="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-left text-base font-medium tabular-nums text-slate-900 placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
      </label>`,
    )
    .join("")}</div>`;
}

function readIncomeForPerson(personId) {
  const input = incomeInputs.querySelector(
    `[data-person-income="${personId}"]`,
  );
  return input ? parseFloat(input.value) : NaN;
}

function renderResultCards() {
  if (!config.people.length) {
    resultCards.innerHTML = "";
    return;
  }
  resultCards.innerHTML = config.people
    .map((p, i) => {
      const accent = accentFor(i);
      return `<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header class="mb-2">
          <h2 class="text-base font-semibold ${accent.headerClass}">${escapeHtml(p.name)}</h2>
        </header>
        <dl class="text-sm" data-person-result="${p.id}"></dl>
      </section>`;
    })
    .join("");
  config.people.forEach((p) => renderPersonResult(p.id, null));
}

function renderPersonResult(personId, amounts) {
  const dl = resultCards.querySelector(`[data-person-result="${personId}"]`);
  if (!dl) return;
  const idx = config.people.findIndex((p) => p.id === personId);
  if (idx === -1) return;
  const accent = accentFor(idx);
  const rows = [];
  config.spending.forEach((c) => {
    rows.push(rowHtml(c.label, amounts?.spending[c.id] ?? null, accent));
  });
  rows.push(
    rowHtml(OVERSKUD_LABEL, amounts?.forbrug ?? null, accent, {
      separator: true,
      forbrug: true,
    }),
  );
  dl.innerHTML = rows.join("");
}

function shareOf(income, total, target) {
  return Math.round((income / total) * target);
}

function calcPerson(income, totalIncome) {
  const spending = {};
  let leftover = income;
  let hasShortfall = false;
  for (const c of config.spending) {
    const ideal =
      c.kind === "personal"
        ? c.target
        : shareOf(income, totalIncome, c.target);
    const actual = Math.max(0, Math.min(leftover, ideal));
    if (ideal - actual > 1) hasShortfall = true;
    spending[c.id] = actual;
    leftover -= actual;
  }
  return {
    spending,
    forbrug: Math.max(0, Math.round(leftover)),
    hasShortfall,
  };
}

function calculateTransfers() {
  const incomes = {};
  for (const p of config.people) {
    const v = readIncomeForPerson(p.id);
    if (!Number.isFinite(v)) return;
    incomes[p.id] = v;
  }
  const totalIncome = Object.values(incomes).reduce((a, b) => a + b, 0);
  if (totalIncome <= 0) return;

  const perPerson = {};
  let totalRest = 0;
  config.people.forEach((p) => {
    const r = calcPerson(incomes[p.id], totalIncome);
    perPerson[p.id] = r;
    totalRest += r.forbrug;
    renderPersonResult(p.id, r);
  });

  const totalRequired = config.spending.reduce(
    (sum, c) =>
      sum + (c.kind === "personal" ? c.target * config.people.length : c.target),
    0,
  );
  const shortfall = Math.max(0, Math.round(totalRequired - totalIncome));

  totalForbrug.textContent = formatNumber(totalRest);
  lastResult = { perPerson, totalRest };
  setShortfall(shortfall);

  if (shortfall === 0 && window.matchMedia("(max-width: 639px)").matches) {
    requestAnimationFrame(() => {
      resultCards.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function setShortfall(amount) {
  currentShortfall = Math.max(0, amount);
  const show = currentShortfall > 0;
  calcWarning?.classList.toggle("hidden", !show);
  if (calcWarningAmount) {
    calcWarningAmount.textContent = show
      ? `Der mangler ${formatNumber(currentShortfall)} kr.`
      : "";
  }
  refreshResultsVisibility();
}

function setShortfallVisible(visible) {
  if (!visible) setShortfall(0);
}

function refreshResultsVisibility() {
  const ready = config.people.length > 0 && config.spending.length > 0;
  const showResults = ready && lastResult != null && currentShortfall === 0;
  resultCards.classList.toggle("hidden", !showResults);
  overskudSection.classList.toggle("hidden", !showResults);
  downloadButton.classList.toggle("hidden", !showResults);
}

function refreshCalcAvailability() {
  const allIncomes =
    config.people.length > 0 &&
    config.people.every((p) => Number.isFinite(readIncomeForPerson(p.id)));
  calcButton.disabled = !allIncomes;
  const anyIncomeTyped = config.people.some((p) => {
    const input = incomeInputs.querySelector(
      `[data-person-income="${p.id}"]`,
    );
    return input && input.value.trim() !== "";
  });
  resetButton.disabled = !anyIncomeTyped && lastResult == null;
}

function resetCalculation() {
  incomeInputs.querySelectorAll("[data-person-income]").forEach((input) => {
    input.value = "";
  });
  lastResult = null;
  totalForbrug.textContent = "—";
  setShortfall(0);
  refreshCalcAvailability();
}

function snapshotIncomes() {
  const snap = {};
  incomeInputs.querySelectorAll("[data-person-income]").forEach((input) => {
    snap[input.dataset.personIncome] = input.value;
  });
  return snap;
}

function restoreIncomes(snap) {
  if (!snap) return;
  Object.entries(snap).forEach(([id, value]) => {
    const input = incomeInputs.querySelector(`[data-person-income="${id}"]`);
    if (input) input.value = value;
  });
}

function peopleRowHtml(p) {
  return `<div class="flex items-center gap-2 py-1.5" data-people-row data-id="${p.id}">
    <input type="text" data-field="name" value="${escapeHtml(p.name)}"
      placeholder="Navn"
      class="h-9 flex-1 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-base text-slate-900 outline-none focus:border-slate-400" />
    <button type="button" data-action="delete-person" aria-label="Slet"
      class="h-9 w-9 shrink-0 rounded-md border border-slate-200 bg-white text-slate-400 transition hover:text-rose-500 focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
    </button>
  </div>`;
}

function renderPeopleConfig() {
  peopleList.innerHTML = config.people.map(peopleRowHtml).join("");
}

function addPersonRow() {
  const tmpl = document.createElement("template");
  tmpl.innerHTML = peopleRowHtml({ id: newId(), name: "" });
  peopleList.appendChild(tmpl.content.firstElementChild);
}

function readPeopleFromUI() {
  return Array.from(peopleList.querySelectorAll("[data-people-row]"))
    .map((row) => ({
      id: row.dataset.id,
      name: row.querySelector('[data-field="name"]').value.trim(),
    }))
    .filter((p) => p.name);
}

function configRowHtml(c) {
  const targetAttr = c.target === "" || c.target == null ? "" : c.target;
  const kind = c.kind === "personal" ? "personal" : "shared";
  return `<div class="space-y-2 py-1.5" data-row data-id="${c.id}">
    <input type="text" data-field="label" value="${escapeHtml(c.label)}"
      placeholder="Navn"
      class="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-base text-slate-900 outline-none focus:border-slate-400" />
    <div class="flex items-center gap-2">
      <input type="text" inputmode="numeric" pattern="[0-9]*" data-field="target" value="${escapeHtml(targetAttr)}"
        placeholder="Beløb"
        class="h-9 w-24 rounded-md border border-slate-200 bg-white px-2 text-left text-base tabular-nums text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400" />
      <select data-field="kind"
        class="h-9 flex-1 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-base text-slate-900 outline-none focus:border-slate-400">
        ${CATEGORY_KINDS.map(
          (k) =>
            `<option value="${k.value}"${k.value === kind ? " selected" : ""}>${k.label}</option>`,
        ).join("")}
      </select>
      <button type="button" data-action="delete" aria-label="Slet"
        class="h-9 w-9 shrink-0 rounded-md border border-slate-200 bg-white text-slate-400 transition hover:text-rose-500 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button>
    </div>
  </div>`;
}

function renderConfig() {
  configList.innerHTML = config.spending.map(configRowHtml).join("");
}

function readSpendingFromUI() {
  return Array.from(configList.querySelectorAll("[data-row]"))
    .map((row) => {
      const label = row.querySelector('[data-field="label"]').value.trim();
      const targetRaw = row.querySelector('[data-field="target"]').value;
      const target = parseFloat(targetRaw);
      const kind =
        row.querySelector('[data-field="kind"]').value === "personal"
          ? "personal"
          : "shared";
      return { id: row.dataset.id, label, target, kind };
    })
    .filter((c) => c.label && Number.isFinite(c.target));
}

function addConfigRow() {
  const tmpl = document.createElement("template");
  tmpl.innerHTML = configRowHtml({
    id: newId(),
    label: "",
    target: "",
    kind: "shared",
  });
  configList.appendChild(tmpl.content.firstElementChild);
}

async function saveConfigFromUI() {
  configSaveButton.disabled = true;
  configSaveButton.textContent = "Gemmer...";
  try {
    const incomeSnap = snapshotIncomes();
    const people = readPeopleFromUI();
    const spending = readSpendingFromUI();
    config = { people, spending };
    if (!hasConfig()) {
      await resetToWelcome();
      configSaveButton.textContent = "Gem";
      configSaveButton.disabled = false;
      return;
    }
    await persistConfig();
    renderPeopleConfig();
    renderConfig();
    renderIncomeInputs();
    restoreIncomes(incomeSnap);
    renderResultCards();
    totalForbrug.textContent = "—";
    lastResult = null;
    setShortfall(0);
    refreshCalcAvailability();
    refreshMainViewVisibility();
    configSaveButton.textContent = "Gemt";
    setTimeout(() => setView("main"), 600);
  } catch (err) {
    console.error("Save failed", err);
    configSaveButton.textContent = "Fejl";
  }
  setTimeout(() => {
    configSaveButton.textContent = "Gem";
    configSaveButton.disabled = false;
  }, 1500);
}

async function deleteAccount() {
  if (!auth?.currentUser) return;
  if (
    !confirm(
      "Sletter din konto og al data. Dette kan ikke fortrydes. Er du sikker?",
    )
  )
    return;
  const user = auth.currentUser;
  try {
    await deleteDoc(doc(db, "users", user.uid));
  } catch (err) {
    console.error("Could not delete Firestore document", err);
  }
  try {
    await deleteUser(user);
  } catch (err) {
    if (err?.code === "auth/requires-recent-login") {
      try {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
        await deleteUser(user);
      } catch (reauthErr) {
        console.error("Reauth failed", reauthErr);
        alert("Kunne ikke slette kontoen. Prøv at logge ud og ind igen.");
        return;
      }
    } else {
      console.error("Delete failed", err);
      alert("Kunne ikke slette kontoen.");
      return;
    }
  }
  localStorage.removeItem(LOCAL_KEY);
  clearLocalMode();
}

async function resetToWelcome() {
  localStorage.removeItem(LOCAL_KEY);
  clearLocalMode();
  if (currentUser && db) {
    try {
      await saveRemoteConfig(currentUser.uid, { people: [], spending: [] });
    } catch (err) {
      console.error("Remote reset failed", err);
    }
    if (auth) await signOut(auth).catch(() => {});
  } else {
    applyLoadedConfig(null);
    setView("welcome");
  }
}

function updateAuthUI() {
  deleteLocalButton.classList.toggle(
    "hidden",
    !(!currentUser && isLocalMode()),
  );
  deleteAccountButton.classList.toggle("hidden", !currentUser);
  if (!FIREBASE_READY) {
    authStatus.textContent = isLocalMode()
      ? "Lokal bruger"
      : "Login ikke konfigureret";
    signInButton.classList.add("hidden");
    signOutButton.classList.add("hidden");
    return;
  }
  if (currentUser) {
    const who =
      currentUser.email ?? currentUser.displayName ?? "ukendt bruger";
    authStatus.innerHTML = `<span class="block text-xs text-slate-400">Logget ind som</span><span class="block text-sm text-slate-700">${escapeHtml(who)}</span>`;
    signInButton.classList.add("hidden");
    signOutButton.classList.remove("hidden");
  } else if (isLocalMode()) {
    authStatus.textContent = "Lokal bruger";
    signInButton.textContent = "Log ind med Google";
    signInButton.classList.remove("hidden");
    signOutButton.classList.add("hidden");
  } else {
    authStatus.textContent = "Ikke logget ind";
    signInButton.textContent = "Log ind";
    signInButton.classList.remove("hidden");
    signOutButton.classList.add("hidden");
  }
}

function applyLoadedConfig(cfg) {
  config = cfg ?? { people: [], spending: [] };
  renderPeopleConfig();
  renderConfig();
  renderIncomeInputs();
  renderResultCards();
  totalForbrug.textContent = "—";
  lastResult = null;
  setShortfall(0);
  refreshCalcAvailability();
  refreshMainViewVisibility();
}

function refreshMainViewVisibility() {
  const ready = config.people.length > 0 && config.spending.length > 0;
  mainEmptyState.classList.toggle("hidden", ready);
  budgetContent.classList.toggle("hidden", !ready);
  if (!ready) setShortfall(0);
  refreshResultsVisibility();
}

async function handleAuthChange(user) {
  if (user) clearLocalMode();
  currentUser = user;
  updateAuthUI();
  if (user) {
    const remote = await loadRemoteConfig(user.uid);
    if (remote) {
      applyLoadedConfig(remote);
    } else {
      const local = loadLocalConfig();
      if (local) {
        config = local;
        await saveRemoteConfig(user.uid, config);
      }
      applyLoadedConfig(local);
    }
  } else if (isLocalMode()) {
    applyLoadedConfig(loadLocalConfig());
  } else {
    applyLoadedConfig(null);
  }
  setView(determineView());
}

function chooseLocalMode() {
  setLocalMode();
  applyLoadedConfig(loadLocalConfig());
  updateAuthUI();
  setView(determineView());
}

document.addEventListener("beforeinput", (e) => {
  const t = e.target;
  if (!(t instanceof HTMLInputElement)) return;
  if (t.inputMode !== "numeric") return;
  if (e.data != null && !/^[0-9]+$/.test(e.data)) {
    e.preventDefault();
  }
});

incomeInputs.addEventListener("input", (e) => {
  if (e.target.matches("[data-person-income]")) refreshCalcAvailability();
});

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    const keyboardOpen =
      window.innerHeight - window.visualViewport.height > 150;
    topNav.classList.toggle("keyboard-open", keyboardOpen);
  });
}

if (canShareResultImage()) {
  document.getElementById("downloadButtonLabel").textContent =
    "Del som billede";
  document.getElementById("downloadIcon").classList.add("hidden");
  document.getElementById("shareIcon").classList.remove("hidden");
}
calcButton.addEventListener("click", calculateTransfers);
resetButton.addEventListener("click", resetCalculation);
downloadButton.addEventListener("click", downloadImage);
tabMain.addEventListener("click", () => setView("main"));
tabConfig.addEventListener("click", () => setView("config"));
tabMore.addEventListener("click", () => setView("more"));
helpSheetNext.addEventListener("click", () => {
  if (helpStep < helpSteps.length - 1) {
    helpStep += 1;
    renderHelpStep();
  } else {
    dismissHelpSheet();
  }
});
helpSheetBack.addEventListener("click", () => {
  if (helpStep > 0) {
    helpStep -= 1;
    renderHelpStep();
  }
});
helpSheetBackdrop.addEventListener("click", dismissHelpSheet);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !helpSheet.classList.contains("hidden")) {
    dismissHelpSheet();
  }
});
peopleAddButton.addEventListener("click", addPersonRow);
configAddButton.addEventListener("click", addConfigRow);
configSaveButton.addEventListener("click", saveConfigFromUI);
peopleList.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="delete-person"]');
  if (!btn) return;
  btn.closest("[data-people-row]")?.remove();
});
configList.addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="delete"]');
  if (!btn) return;
  btn.closest("[data-row]")?.remove();
});

function triggerSignIn() {
  if (!FIREBASE_READY) return;
  showLoading();
  signInWithPopup(auth, new GoogleAuthProvider()).catch((err) => {
    console.error("Sign-in failed", err);
    hideLoading();
  });
}

welcomeSignInButton.addEventListener("click", triggerSignIn);
welcomeLocalButton.addEventListener("click", chooseLocalMode);
deleteLocalButton.addEventListener("click", async () => {
  if (!confirm("Sletter al lokal data. Er du sikker?")) return;
  await resetToWelcome();
  updateAuthUI();
});
deleteAccountButton.addEventListener("click", deleteAccount);

if (FIREBASE_READY) {
  signInButton.addEventListener("click", triggerSignIn);
  signOutButton.addEventListener("click", () => {
    clearLocalMode();
    showLoading();
    signOut(auth).catch((err) => {
      console.error("Sign-out failed", err);
      hideLoading();
    });
  });
  if (!isLocalMode()) {
    welcomeSignInButton.disabled = false;
  }
  onAuthStateChanged(auth, handleAuthChange);
} else {
  welcomeSignInButton.disabled = true;
  welcomeSignInButton.classList.add("opacity-40", "pointer-events-none");
  updateAuthUI();
  if (isLocalMode()) {
    applyLoadedConfig(loadLocalConfig());
    setView(determineView());
  } else {
    setView("welcome");
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function canShareResultImage() {
  if (!window.matchMedia("(pointer: coarse)").matches) return false;
  if (!navigator.canShare) return false;
  const probe = new File([""], "budget.png", { type: "image/png" });
  return navigator.canShare({ files: [probe] });
}

function downloadImage() {
  if (!lastResult || !config.people.length) return;

  const rows = [
    ...config.spending.map((c) => ({
      label: c.label,
      key: c.id,
      kind: "spending",
    })),
    { label: OVERSKUD_LABEL, kind: "forbrug", separator: true },
  ];

  const scale = 2;
  const pagePad = 40;
  const cardGap = 16;
  const cardPad = 28;
  const cardRadius = 20;
  const cardWidth = 460;
  const headerHeight = 48;
  const rowHeight = 44;
  const separatorGap = 10;

  const labelFont =
    "28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const amountFont =
    "500 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const headerFont =
    "600 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const personCardHeight =
    cardPad * 2 + headerHeight + rows.length * rowHeight + separatorGap;
  const totalCardHeight = cardPad * 2 + headerHeight;

  const pageWidth = pagePad * 2 + cardWidth;
  const pageHeight =
    pagePad * 2 +
    config.people.length * (personCardHeight + cardGap) +
    totalCardHeight;

  const canvas = document.createElement("canvas");
  canvas.width = pageWidth * scale;
  canvas.height = pageHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const baseTheme = {
    bg: "#ffffff",
    border: "#e2e8f0",
    separator: "#e2e8f0",
    label: "#475569",
    amount: "#0f172a",
  };
  const totalTheme = {
    bg: "#ffffff",
    border: "#e2e8f0",
    header: "#059669",
    amount: "#059669",
  };

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, pageWidth, pageHeight);

  let y = pagePad;

  function drawCard(height, theme) {
    ctx.fillStyle = theme.bg;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    roundRect(ctx, pagePad, y, cardWidth, height, cardRadius);
    ctx.fill();
    ctx.stroke();
  }

  function amountForRow(row, person) {
    if (row.kind === "spending") return person.spending[row.key];
    return person.forbrug;
  }

  function drawPersonCard(title, person, accent) {
    const theme = {
      ...baseTheme,
      header: accent.canvas,
      forbrug: accent.canvas,
    };
    drawCard(personCardHeight, theme);
    const innerLeft = pagePad + cardPad;
    const innerRight = pagePad + cardWidth - cardPad;
    let ry = y + cardPad;

    ctx.fillStyle = theme.header;
    ctx.font = headerFont;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(title, innerLeft, ry + headerHeight / 2);
    ry += headerHeight;

    rows.forEach((row) => {
      if (row.separator) {
        ry += separatorGap / 2;
        ctx.strokeStyle = theme.separator;
        ctx.beginPath();
        ctx.moveTo(innerLeft, ry);
        ctx.lineTo(innerRight, ry);
        ctx.stroke();
        ry += separatorGap / 2;
      }

      const cy = ry + rowHeight / 2;
      ctx.fillStyle = theme.label;
      ctx.font = labelFont;
      ctx.textAlign = "left";
      ctx.fillText(row.label, innerLeft, cy);

      const isForbrug = row.kind === "forbrug";
      ctx.fillStyle = isForbrug ? theme.forbrug : theme.amount;
      ctx.font = isForbrug
        ? "600 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        : amountFont;
      ctx.textAlign = "right";
      ctx.fillText(formatNumber(amountForRow(row, person)), innerRight, cy);

      ry += rowHeight;
    });

    y += personCardHeight + cardGap;
  }

  config.people.forEach((p, i) => {
    drawPersonCard(p.name, lastResult.perPerson[p.id], accentFor(i));
  });

  drawCard(totalCardHeight, totalTheme);
  const innerLeft = pagePad + cardPad;
  const innerRight = pagePad + cardWidth - cardPad;
  const cy = y + cardPad + headerHeight / 2;
  ctx.font = headerFont;
  ctx.fillStyle = totalTheme.header;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Overskud", innerLeft, cy);
  ctx.font =
    "600 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = totalTheme.amount;
  ctx.textAlign = "right";
  ctx.fillText(formatNumber(lastResult.totalRest), innerRight, cy);

  canvas.toBlob(async (blob) => {
    const file = new File([blob], "budget.png", { type: "image/png" });
    if (canShareResultImage() && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "ProRata-Fordeleren" });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "budget.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, "image/png");
}
