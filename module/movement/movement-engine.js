// module/movement/movement-engine.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Movement Engine (Phase 2)
// Pure logic orchestrator:
// - Handles conforming movement
// - Clears templates (Phase 4 will replace this)
// - Calls performManeuver()
// - Does NOT roll dice
// - Does NOT create templates
// - Does NOT rotate tokens
// - Does NOT post chat messages
// - Does NOT react to crash outcomes
// ------------------------------------------------------------

import { performManeuver } from "./perform-maneuver.js";
import { MovementTemplate } from "./movement-template.js";
import { LaneChangeTemplate } from "./lane-change-template.js";
import { ManeuverRegistry } from "./maneuver-registry.js";
import { SkidTemplate } from "./skid-template.js";
import { TurnArcTemplate } from "./turn-arc-template.js";
import { BootleggerTemplate } from "./bootlegger-template.js";
import { SpinoutTemplate } from "./spinout-template.js";

import {
  getConformingInfo,
  slideAlongPrimary,
  updateConformingState,
  tokensAreTouching,
  clearConformingForToken
} from "./conforming.js";

export class MovementEngine {
  constructor(actor) {
    this.actor = actor;
  }

  async execute(maneuverId) {
    const mv = this.actor.system.movement ?? {};
    const currentSpeed = mv.lastSpeed ?? 0;

    const token = this.actor.getActiveTokens()[0];

    if (token) {
      const conform = getConformingInfo(token);

      if (conform) {
        const primary = canvas.tokens.get(conform.primaryId);

        if (primary && tokensAreTouching(primary, token)) {
          await this.actor.update({ "system.movement.isConforming": true });

          await slideAlongPrimary(primary, token, { gridSteps: 1 });

          await updateConformingState(primary, token);
          return;
        }

        await clearConformingForToken(token);
        await this.actor.update({ "system.movement.isConforming": false });
      }
    }

    MovementTemplate.removeFor(this.actor);
    LaneChangeTemplate.removeFor(this.actor);
    TurnArcTemplate.removeFor(this.actor);
    SkidTemplate.removeFor(this.actor);
    BootleggerTemplate.removeFor(this.actor);
    SpinoutTemplate.removeFor(this.actor);

    const maneuver = ManeuverRegistry.get(maneuverId);

    if (maneuver?.difficulty != null) {
      await this.actor.update({
        "system.movement.lastManeuverDifficulty": maneuver.difficulty
      });
    }

    await performManeuver(this.actor, maneuverId, currentSpeed);
  }
}

// ------------------------------------------------------------
// Canvas Conversion Helpers — dynamic, no hard-coded values
// ------------------------------------------------------------

export function inchesPerTurn(speedMph) {
  return speedMph / 15;
}

export function inchesPerPhase(speedMph) {
  return inchesPerTurn(speedMph) / 10;
}

export function movementThisPhase(vehicle) {
  const speed = vehicle.system.movement?.lastSpeed || 0;
  return inchesPerPhase(speed);
}

export function inchesToGridUnits(inches) {
  const distancePerGrid = canvas.scene?.grid?.distance || 1;
  return inches / distancePerGrid;
}

export function inchesToPixels(inches) {
  const distancePerGrid = canvas.scene?.grid?.distance || 1;
  const pixelsPerGrid = canvas.scene?.grid?.size || 100;
  return (inches / distancePerGrid) * pixelsPerGrid;
}

export function gridUnitsToInches(units) {
  const distancePerGrid = canvas.scene?.grid?.distance || 1;
  return units * distancePerGrid;
}

export function pixelsToInches(px) {
  const pixelsPerGrid = canvas.scene?.grid?.size || 100;
  const distancePerGrid = canvas.scene?.grid?.distance || 1;
  const units = px / pixelsPerGrid;
  return units * distancePerGrid;
}

export async function runMovementEngine(actor, maneuverId) {
  const engine = new MovementEngine(actor);
  await engine.execute(maneuverId);
}
