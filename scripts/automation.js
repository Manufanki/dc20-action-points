import { MODULE_ID, getAPSource, getMaxAP, getSpentAP } from "./ap-tracker.js";

const ACTIVATION_COST_SETTINGS = { action: "actionCost", bonus: "bonusActionCost" };
// Repositioning through the token config, pasting, or undoing a move is not movement a creature pays for.
const IGNORED_MOVE_METHODS = new Set(["config", "paste", "undo"]);
const FLAG = path => `flags.${MODULE_ID}.${path}`;
const COMBAT_SYSTEM_ID = "dc20-combat-system";
// Dice count rolled by DC20 Combat System -> cost setting; 2d20 uses advantageCost.
const TIER_COST_SETTINGS = { 3: "doubleAdvantageCost", 4: "tripleAdvantageCost" };
let updateQueue = Promise.resolve();

export function registerAutomationSettings() {
  game.settings.register(MODULE_ID, "autoConsume", {
    name: "DC20AP.Settings.AutoConsume.Name",
    hint: "DC20AP.Settings.AutoConsume.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  registerCostSetting("actionCost", "DC20AP.Settings.ActionCost", 1);
  registerCostSetting("bonusActionCost", "DC20AP.Settings.BonusActionCost", 1);
  registerCostSetting("moveCost", "DC20AP.Settings.MoveCost", 1);
  registerCostSetting("extraMoveCost", "DC20AP.Settings.OverSpeedCost", 1);
  registerCostSetting("advantageCost", "DC20AP.Settings.AdvantageCost", 2);
  registerCostSetting("doubleAdvantageCost", "DC20AP.Settings.DoubleAdvantageCost", 3);
  registerCostSetting("tripleAdvantageCost", "DC20AP.Settings.TripleAdvantageCost", 4);
  registerCostSetting("disadvantageCost", "DC20AP.Settings.DisadvantageCost", 1);
}

function registerCostSetting(key, label, defaultValue) {
  game.settings.register(MODULE_ID, key, {
    name: `${label}.Name`,
    hint: `${label}.Hint`,
    scope: "world",
    config: true,
    type: Number,
    range: { min: 0, max: 10, step: 1 },
    default: defaultValue
  });
}

const isEnabled = () => game.settings.get(MODULE_ID, "autoConsume");

function findSource(combat, { tokenId, sceneId, actor }) {
  if (!combat?.started) return null;
  const combatants = combat.combatants.contents;
  const match = (tokenId && combatants.find(c => c.tokenId === tokenId && (!sceneId || c.sceneId === sceneId)))
    ?? (actor && combatants.find(c => c.actor === actor));
  return match ? getAPSource(match) : null;
}

function buildSpendUpdate(source, cost, label) {
  const max = getMaxAP(source);
  const spent = getSpentAP(source);
  if (spent + cost > max) {
    ui.notifications.warn(game.i18n.format("DC20AP.Notifications.NotEnough", {
      name: source.name, action: label, cost, remaining: max - spent
    }));
  }
  return { [FLAG("spent")]: Math.min(spent + cost, max) };
}

// Serialises AP writes so overlapping spends don't overwrite each other.
function queueUpdate(source, { cost = 0, label = "", extra = {} } = {}) {
  updateQueue = updateQueue
    .then(() => {
      const spend = cost > 0 ? buildSpendUpdate(source, cost, label) : {};
      return source.update({ ...spend, ...extra });
    })
    .catch(error => console.error(`${MODULE_ID} | Failed to update AP for ${source.name}`, error));
  return updateQueue;
}

export function onPostUseActivity(activity) {
  if (!isEnabled()) return;
  const setting = ACTIVATION_COST_SETTINGS[activity?.activation?.type];
  if (!setting) return;
  const isAttack = activity.type === "attack";
  const cost = game.settings.get(MODULE_ID, setting);
  if (cost <= 0 && !isAttack) return;

  const actor = activity.actor;
  const source = findSource(game.combat, { tokenId: actor?.token?.id, sceneId: actor?.token?.parent?.id, actor });
  if (!source?.isOwner) return;

  const label = activity.item?.name ?? activity.name;
  if (isAttack) return joinAttackActivation(source, cost, label);
  void queueUpdate(source, { cost, label });
}

// Attack AP depends on the d20 roll's advantage state, so the activity and the roll are joined in either order.
const ATTACK_JOIN_MS = 3000;
let pendingActivation = null;
let pendingRoll = null;

function joinAttackActivation(source, activationCost, label) {
  if (pendingRoll) {
    const { source: rollSource, rollCost, timer } = pendingRoll;
    clearTimeout(timer);
    pendingRoll = null;
    return spendLater(rollSource, rollCost ?? activationCost, label);
  }
  flushPendingActivation();
  pendingActivation = {
    source, cost: activationCost, label,
    timer: setTimeout(flushPendingActivation, ATTACK_JOIN_MS)
  };
}

function joinAttackRoll(source, { advantageCost, rollCost }) {
  if (pendingActivation) {
    const { source: activationSource, cost, label, timer } = pendingActivation;
    clearTimeout(timer);
    pendingActivation = null;
    return spendLater(activationSource, rollCost ?? cost, label);
  }
  flushPendingRoll();
  pendingRoll = {
    source, advantageCost, rollCost,
    timer: setTimeout(flushPendingRoll, ATTACK_JOIN_MS)
  };
}

function flushPendingActivation() {
  if (!pendingActivation) return;
  const { source, cost, label, timer } = pendingActivation;
  clearTimeout(timer);
  pendingActivation = null;
  spendLater(source, cost, label);
}

function flushPendingRoll() {
  if (!pendingRoll) return;
  const { source, advantageCost, timer } = pendingRoll;
  clearTimeout(timer);
  pendingRoll = null;
  spendLater(source, advantageCost, game.i18n.localize("DC20AP.Advantage"));
}

function spendLater(source, cost, label) {
  if (cost > 0) void queueUpdate(source, { cost, label });
}

export function onMoveToken(tokenDoc, movement, operation, user) {
  // moveToken fires on every client; only the client that moved the token records it.
  if (!user?.isSelf || !isEnabled()) return;
  if (IGNORED_MOVE_METHODS.has(movement.method)) return;
  const distance = movement.passed?.distance ?? 0;
  if (distance <= 0) return;

  const combat = game.combat;
  const source = findSource(combat, { tokenId: tokenDoc.id, sceneId: tokenDoc.parent?.id, actor: tokenDoc.actor });
  if (!source?.isOwner) return;
  // Only movement during the creature's own turn counts against its speed.
  if (!combat.combatant || getAPSource(combat.combatant) !== source) return;

  const speed = getSpeed(tokenDoc);
  if (!speed) return;

  const moved = (Number(source.getFlag(MODULE_ID, "moved")) || 0) + distance;
  const updates = { [FLAG("moved")]: moved };
  let cost = 0;
  const labels = [];

  const moveCost = game.settings.get(MODULE_ID, "moveCost");
  if (!source.getFlag(MODULE_ID, "moveStarted")) {
    updates[FLAG("moveStarted")] = true;
    if (moveCost > 0) {
      cost += moveCost;
      labels.push(game.i18n.localize("DC20AP.Move"));
    }
  }

  const extraCost = game.settings.get(MODULE_ID, "extraMoveCost");
  if (moved > speed && !source.getFlag(MODULE_ID, "moveCharged")) {
    updates[FLAG("moveCharged")] = true;
    if (extraCost > 0) {
      cost += extraCost;
      labels.push(game.i18n.localize("DC20AP.OverSpeedMove"));
    }
  }

  void queueUpdate(source, { cost, label: labels.join(" + "), extra: updates });
}

export function onCreateChatMessage(message) {
  // createChatMessage fires on every client; only the author's client spends AP.
  if (message.author?.id !== game.userId || !isEnabled()) return;
  const costs = getRollCosts(message);
  if (!costs) return;

  const source = findSource(game.combat, {
    tokenId: message.speaker?.token,
    sceneId: message.speaker?.scene,
    actor: message.getAssociatedActor?.()
  });
  if (!source?.isOwner) return;
  joinAttackRoll(source, costs);
}

// rollCost is null for a normal roll, otherwise the cost that replaces the activation cost.
function getRollCosts(message) {
  const combatSystemActive = Boolean(game.modules.get(COMBAT_SYSTEM_ID)?.active);
  let hasD20 = false;
  let advantage = false;
  let disadvantage = false;
  let advantageCost = 0;
  for (const roll of message.rolls ?? []) {
    if (!(roll instanceof CONFIG.Dice.D20Roll)) continue;
    hasD20 = true;
    if (roll.hasAdvantage) {
      advantage = true;
      const diceCount = combatSystemActive
        ? Number(message.getFlag(COMBAT_SYSTEM_ID, "d20")?.diceCount ?? roll.dice?.[0]?.number)
        : 2;
      advantageCost += game.settings.get(MODULE_ID, TIER_COST_SETTINGS[diceCount] ?? "advantageCost");
    } else if (roll.hasDisadvantage) {
      disadvantage = true;
    }
  }
  if (!hasD20) return null;
  const disadvantageCost = disadvantage && !advantage ? game.settings.get(MODULE_ID, "disadvantageCost") : null;
  return { advantageCost, rollCost: advantage ? advantageCost : disadvantageCost };
}

function getSpeed(tokenDoc) {
  const movement = tokenDoc.actor?.system?.attributes?.movement;
  if (!movement) return 0;
  return Number(movement[tokenDoc.movementAction]) || Number(movement.walk) || 0;
}

export async function resetMovement(combatant) {
  const source = getAPSource(combatant);
  const flags = ["moved", "moveStarted", "moveCharged"];
  if (!flags.some(flag => source.getFlag(MODULE_ID, flag))) return;
  return source.update({ [FLAG("moved")]: 0, [FLAG("moveStarted")]: false, [FLAG("moveCharged")]: false });
}
