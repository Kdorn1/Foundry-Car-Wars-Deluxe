// module/movement/movement-state.js
// ------------------------------------------------------------
// Phase 2 — Central Movement State Manager (Pure Logic)
// Computes next movement state but does NOT update the actor.
// ------------------------------------------------------------

/**
 * Compute next movement state (pure logic).
 *
 * @param {object} current - current movement state (actor.system.movement)
 * @param {object} data - updates from maneuver/crash/etc.
 * @returns {object} new movement state
 */
export function computeMovementState(current = {}, data = {}) {
  const mv = structuredClone(current);

  // ------------------------------------------------------------
  // Spinout Recovery (RAW)
  // ------------------------------------------------------------
  if (mv.wasSpinoutLastPhase) {
    mv.isSpinout = false;
    mv.isSkidding = false;
    mv.hc = 0;
    mv.lastSpeed = mv.nextSpeed ?? mv.lastSpeed;
    mv.nextSpeed = undefined;
  }

  // ------------------------------------------------------------
  // Core maneuver metadata
  // ------------------------------------------------------------
  if (data.maneuver !== undefined) mv.lastManeuver = data.maneuver;
  if (data.difficulty !== undefined) mv.lastDifficulty = data.difficulty;
  if (data.hazard !== undefined) mv.lastHazard = data.hazard;

  if (data.speed !== undefined) mv.lastSpeed = data.speed;
  if (data.accel !== undefined) mv.lastAccel = data.accel;
  if (data.decel !== undefined) mv.lastDecel = data.decel;

  if (data.hazard !== undefined)
    mv.cumulativeHazard = (mv.cumulativeHazard ?? 0) + data.hazard;

  if (data.difficulty !== undefined)
    mv.cumulativeDifficulty = (mv.cumulativeDifficulty ?? 0) + data.difficulty;

  // ------------------------------------------------------------
  // Handling Track
  // ------------------------------------------------------------
  if (data.newHandlingStatus !== undefined) {
    mv.handlingStatus = data.newHandlingStatus;
  }

  // ------------------------------------------------------------
  // Crash Outcome
  // ------------------------------------------------------------
  if (data.crashOutcome !== undefined) {
    mv.crashOutcome = data.crashOutcome;
  }

  // ------------------------------------------------------------
  // Pending Control Roll
  // ------------------------------------------------------------
  if (data.pendingControlRoll !== undefined) {
    mv.pendingControlRoll = data.pendingControlRoll;
  }

  // ------------------------------------------------------------
  // Skid / Spinout State
  // ------------------------------------------------------------
  if (data.isSkidding !== undefined) mv.isSkidding = data.isSkidding;
  if (data.isSpinout !== undefined) mv.isSpinout = data.isSpinout;

  if (data.skidData !== undefined) mv.skidData = data.skidData;
  if (data.skidDirectionDegrees !== undefined)
    mv.skidDirectionDegrees = data.skidDirectionDegrees;

  // ------------------------------------------------------------
  // Facing & Speed Adjustments
  // ------------------------------------------------------------
  if (data.finalFacing !== undefined) mv.finalFacing = data.finalFacing;
  if (data.nextSpeed !== undefined) mv.nextSpeed = data.nextSpeed;
  if (data.temporarySpeed !== undefined) mv.temporarySpeed = data.temporarySpeed;

  // ------------------------------------------------------------
  // Track spinout for next phase
  // ------------------------------------------------------------
  mv.wasSpinoutLastPhase = mv.isSpinout === true;

  // ------------------------------------------------------------
  // Phase Advancement
  // ------------------------------------------------------------
  mv.phase = ((mv.phase ?? 0) % 10) + 1;

  return mv;
}
