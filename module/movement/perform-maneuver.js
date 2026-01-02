// module/movement/perform-maneuver.js
// ------------------------------------------------------------
// RAW Car Wars Deluxe Edition — Maneuver Resolution (Phase 2)
// ------------------------------------------------------------

import { ManeuverRegistry } from "./maneuver-registry.js";
import { applyControlRoll } from "./control-table.js";
import { updateMovementState } from "./movement-state.js";

/**
 * Perform a RAW maneuver.
 * Phase 2: This module DOES NOT:
 * - roll dice
 * - route crashes
 * - determine success/failure
 *
 * It ONLY:
 * - computes RAW hazard & handling
 * - computes control roll requirements
 * - stores a pending control roll in movement state
 */
export async function performManeuver(actor, maneuverId, speedMph) {
  const system = actor.system;
  const mv = system.movement ?? {};

  const maneuver = ManeuverRegistry.get(maneuverId);
  if (!maneuver) {
    console.warn(`Unknown maneuver: ${maneuverId}`);
    return;
  }

  // ------------------------------------------------------------
  // RAW: Extract maneuver difficulty & hazard
  // ------------------------------------------------------------
  const difficulty = maneuver.difficulty ?? 0;
  const baseHazard = maneuver.hazard ?? 0;

  // ------------------------------------------------------------
  // RAW: Deceleration Hazard
  // ------------------------------------------------------------
  const decelHazard = mv.decelHazard ?? 0;

  // ------------------------------------------------------------
  // RAW: Terrain Hazard
  // ------------------------------------------------------------
  const terrainHazard = mv.terrainHazard ?? 0;

  // ------------------------------------------------------------
  // RAW: Total Hazard
  // ------------------------------------------------------------
  const totalHazard = baseHazard + decelHazard + terrainHazard;

  // ------------------------------------------------------------
  // RAW: Handling Track
  // ------------------------------------------------------------
  const handlingStatus = mv.handlingStatus ?? 0;
  const newHandlingStatus = handlingStatus - totalHazard;

  // ------------------------------------------------------------
  // RAW: Bootlegger Reverse (special case)
  // ------------------------------------------------------------
  if (maneuver.type === "bootlegger") {
    return await handleBootlegger(actor, maneuver, speedMph, totalHazard);
  }

  // ------------------------------------------------------------
  // Phase 2: Compute control roll requirements (NO dice rolled)
  // ------------------------------------------------------------
  const controlRequest = applyControlRoll(actor, {
    speed: speedMph,
    difficulty,
    handlingStatus: newHandlingStatus
  });

  // ------------------------------------------------------------
  // Phase 2: Store pending control roll in movement state
  // UI will:
  // - show control roll card
  // - roll dice
  // - call crash router if needed
  // ------------------------------------------------------------
  await updateMovementState(actor, {
    maneuver: maneuverId,
    difficulty,
    hazard: totalHazard,
    speed: speedMph,
    newHandlingStatus,
    pendingControlRoll: controlRequest,
    crashOutcome: null
  });
}

// ------------------------------------------------------------
// RAW Bootlegger Reverse (special maneuver)
// ------------------------------------------------------------
async function handleBootlegger(actor, maneuver, speedMph, totalHazard) {
  const system = actor.system;
  const mv = system.movement ?? {};

  if (actor.system?.vehicleType === "cycle") {
    ui.notifications.warn("Cycles cannot perform a bootlegger reverse.");
    return;
  }

  if (speedMph < 20 || speedMph > 35) {
    ui.notifications.warn("Speed must be between 20 and 35 mph for a bootlegger reverse.");
    return;
  }

  const newHandlingStatus = (mv.handlingStatus ?? 0) - totalHazard;

  const token = actor.getActiveTokens()[0];
  const facing = token?.rotation ?? 0;

  const skidDirectionDegrees =
    maneuver.direction === "left"
      ? (facing - 90 + 360) % 360
      : (facing + 90) % 360;

  const finalFacing = (facing + 180) % 360;
  const nextSpeed = 0;

  await updateMovementState(actor, {
    maneuver: maneuver.id,
    difficulty: maneuver.difficulty ?? 0,
    hazard: totalHazard,
    speed: speedMph,
    newHandlingStatus,
    isSkidding: newHandlingStatus < 0,
    isSpinout: newHandlingStatus < -5,
    skidDirectionDegrees,
    finalFacing,
    nextSpeed,
    pendingControlRoll: null,
    crashOutcome: null
  });
}
