export const MODULE_ID = "dc20-action-points";
export const TEMPLATE = `modules/${MODULE_ID}/templates/ap-tracker-radios.hbs`;

const MAX_AP_LIMIT = 20;
const BLOCKED_EVENTS = ["click", "dblclick", "pointerdown", "mousedown", "contextmenu"];

export function registerSettings() {
  game.settings.register(MODULE_ID, "defaultMaxAP", {
    name: "DC20AP.Settings.DefaultMax.Name",
    hint: "DC20AP.Settings.DefaultMax.Hint",
    scope: "world",
    config: true,
    type: Number,
    range: { min: 0, max: MAX_AP_LIMIT, step: 1 },
    default: 4,
    onChange: () => ui.combat?.render()
  });
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getDefaultMax() {
  return game.settings.get(MODULE_ID, "defaultMaxAP");
}

function getMaxFlag(combatant) {
  const value = combatant.getFlag(MODULE_ID, "max");
  return Number.isInteger(value) ? value : null;
}

export function getMaxAP(combatant) {
  return getMaxFlag(combatant) ?? getDefaultMax();
}

export function getSpentAP(combatant) {
  const spent = Number(combatant.getFlag(MODULE_ID, "spent")) || 0;
  return clamp(spent, 0, getMaxAP(combatant));
}

export async function setSpentAP(combatant, value) {
  const spent = clamp(Math.trunc(value), 0, getMaxAP(combatant));
  return combatant.setFlag(MODULE_ID, "spent", spent);
}

export async function setMaxAP(combatant, value) {
  if (value === null) {
    return combatant.update({
      [`flags.${MODULE_ID}.-=max`]: null,
      [`flags.${MODULE_ID}.spent`]: Math.min(getSpentAP(combatant), getDefaultMax())
    });
  }
  const max = clamp(Math.trunc(value), 0, MAX_AP_LIMIT);
  return combatant.update({
    [`flags.${MODULE_ID}.max`]: max,
    [`flags.${MODULE_ID}.spent`]: Math.min(getSpentAP(combatant), max)
  });
}

/** Duplicates store AP on the original combatant they were created from. */
export function getAPSource(combatant) {
  const linkedId = combatant.getFlag(MODULE_ID, "linkedTo");
  return (linkedId && combatant.combat?.combatants.get(linkedId)) || combatant;
}

export async function resetCombatant(combatant) {
  const source = getAPSource(combatant);
  if (!source.getFlag(MODULE_ID, "spent")) return;
  return source.setFlag(MODULE_ID, "spent", 0);
}

// Same token/actor means HP is shared automatically; initiative stays per combatant.
export async function duplicateCombatant(combatant) {
  const source = getAPSource(combatant);
  const combat = source.combat;
  const count = combat.combatants.filter(c => getAPSource(c) === source).length;
  return combat.createEmbeddedDocuments("Combatant", [{
    tokenId: source.tokenId,
    sceneId: source.sceneId,
    actorId: source.actorId,
    name: `${source.name} (${count + 1})`,
    img: source.img,
    hidden: source.hidden,
    flags: { [MODULE_ID]: { linkedTo: source.id } }
  }]);
}

function buildContext(combatant, source) {
  const max = getMaxAP(source);
  const spent = getSpentAP(source);
  const editable = source.isOwner;
  return {
    combatantId: combatant.id,
    editable,
    readonly: !editable,
    canDuplicate: game.user.isGM,
    isLinked: source !== combatant,
    max,
    spent,
    remaining: max - spent,
    maxFlag: getMaxFlag(source) ?? "",
    defaultMax: getDefaultMax(),
    limit: MAX_AP_LIMIT,
    pips: Array.fromRange(max, 1).map(index => ({ index, spent: index <= spent }))
  };
}

export async function injectTracker(app, html) {
  const combat = app.viewed;
  if (!combat) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root) return;

  const rows = root.querySelectorAll("li.combatant[data-combatant-id]");
  await Promise.all(Array.from(rows, async row => {
    const combatant = combat.combatants.get(row.dataset.combatantId);
    if (!combatant) return;
    const source = getAPSource(combatant);

    const markup = await foundry.applications.handlebars.renderTemplate(TEMPLATE, buildContext(combatant, source));
    const template = document.createElement("template");
    template.innerHTML = markup.trim();
    const element = template.content.firstElementChild;
    if (!element) return;

    activateListeners(element, combatant, source);
    row.querySelector(".dc20ap")?.remove();
    row.append(element);
  }));
}

function activateListeners(element, combatant, source) {
  // Keep interactions from triggering the tracker's row handlers (pan/select/open sheet).
  for (const type of BLOCKED_EVENTS) element.addEventListener(type, event => event.stopPropagation());

  element.querySelector("button.dc20ap-duplicate")?.addEventListener("click", event => {
    event.preventDefault();
    if (game.user.isGM) duplicateCombatant(combatant);
  });

  if (!source.isOwner) return;

  element.querySelectorAll("input.dc20ap-pip-input").forEach(input => {
    input.addEventListener("change", event => {
      const index = Number(event.currentTarget.dataset.pip);
      const spent = getSpentAP(source);
      // Fill-style: clicking a spent pip refunds it and everything after; clicking an unspent pip spends up to it.
      setSpentAP(source, index <= spent ? index - 1 : index);
    });
  });

  const maxInput = element.querySelector("input.dc20ap-max");
  maxInput?.addEventListener("keydown", event => {
    event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  });
  maxInput?.addEventListener("change", event => {
    const raw = event.currentTarget.value.trim();
    const value = raw === "" ? null : Number(raw);
    if (value !== null && !Number.isFinite(value)) {
      event.currentTarget.value = getMaxFlag(source) ?? "";
      return;
    }
    setMaxAP(source, value);
  });
}
