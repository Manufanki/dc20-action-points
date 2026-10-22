import { MODULE_ID, TEMPLATE, registerSettings, injectTracker, resetCombatant } from "./ap-tracker.js";
import { registerAutomationSettings, onPostUseActivity, onMoveToken, onCreateChatMessage, resetMovement } from "./automation.js";

Hooks.once("init", () => {
  registerSettings();
  registerAutomationSettings();
  foundry.applications.handlebars.loadTemplates([TEMPLATE]);
  console.log(`${MODULE_ID} | Initialized`);
});

Hooks.on("dnd5e.postUseActivity", onPostUseActivity);
Hooks.on("moveToken", onMoveToken);
Hooks.on("createChatMessage", onCreateChatMessage);

Hooks.on("renderCombatTracker", (app, html) => {
  injectTracker(app, html);
});

Hooks.on("updateCombat", (combat, changed, options) => {
  // Only one client (the active GM) performs the reset to avoid duplicate updates.
  if (!game.users.activeGM?.isSelf) return;
  if (!("turn" in changed || "round" in changed)) return;
  if (options.direction === -1) return;
  // Reset whoever just ended their turn, so they enter other turns with full AP for reactions.
  const combatant = combat.combatants.get(combat.previous?.combatantId);
  if (combatant) resetCombatant(combatant);
  if (combat.combatant) resetMovement(combat.combatant);
});
