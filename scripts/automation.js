import { MODULE_ID, getAPSource, getMaxAP, getSpentAP } from "./ap-tracker.js";

const ACTIVATION_COST_SETTINGS = { action: "actionCost", bonus: "bonusActionCost" };
// Repositioning through the token config, pasting, or undoing a move is not movement a creature pays for.
const IGNORED_MOVE_METHODS = new Set(["config", "paste", "undo"]);
const FLAG = path => `flags.${MODULE_ID}.${path}`;

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

export function onPostUseActivity(activity) {
  if (!isEnabled()) return;
  const setting = ACTIVATION_COST_SETTINGS[activity?.activation?.type];
  if (!setting) return;
  const cost = game.settings.get(MODULE_ID, setting);
  if (cost <= 0) return;

  const actor = activity.actor;
  const source = findSource(game.combat, { tokenId: actor?.token?.id, sceneId: actor?.token?.parent?.id, actor });
  if (!source?.isOwner) return;

  const label = activity.item?.name ?? activity.name;
  void source.update(buildSpendUpdate(source, cost, label)).catch(error =>
    console.error(`${MODULE_ID} | Failed to consume AP for ${label}`, error));
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

  if (cost > 0) Object.assign(updates, buildSpendUpdate(source, cost, labels.join(" + ")));
  void source.update(updates).catch(error =>
    console.error(`${MODULE_ID} | Failed to record movement for ${source.name}`, error));
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
