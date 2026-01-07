// module/movement/collision-router.js
// ------------------------------------------------------------
// Car Wars Deluxe — Collision Router (Phase 2)
// Pure logic only:
// - Accepts a collision event
// - Determines collision type
// - Routes to the correct collision physics module
// - Returns a structured collision outcome
// - Does NOT update actor state
// - Does NOT rotate tokens
// - Does NOT apply armor damage
// - Does NOT post chat messages
// ------------------------------------------------------------

import { determineCollisionType } from "./collision-type.js";
import { resolveCollisionPhysics } from "./collision-physics.js";

/**
 * Route a collision event to the correct collision physics handler.
 *
 * @param {object} collisionEvent
 *   {
 *     actorA: Actor,
 *     actorB: Actor,
 *     speedA: number,
 *     speedB: number,
 *     angle: number,
 *     impactPoint: string,
 *     ...etc
 *   }
 *
 * @returns {object} collisionOutcome
 *   Structured collision result for movement-state + Phase 4 UI.
 */
export async function routeCollision(collisionEvent) {
  if (!collisionEvent) {
    console.error("routeCollision called without collisionEvent");
    return { type: "error", message: "No collision event provided" };
  }

  const { actorA, actorB } = collisionEvent;

  if (!actorA || !actorB) {
    return {
      type: "error",
      message: "Collision event missing actorA or actorB"
    };
  }

  // ------------------------------------------------------------
  // Determine collision type (head-on, T-bone, sideswipe, rear-end, etc.)
  // ------------------------------------------------------------
  const collisionType = determineCollisionType(collisionEvent);

  // ------------------------------------------------------------
  // Route to collision physics (pure logic)
  // ------------------------------------------------------------
  const collisionOutcome = await resolveCollisionPhysics(
    collisionType,
    collisionEvent
  );

  // ------------------------------------------------------------
  // Phase 2: DO NOT update actor or token here.
  // Movement state + UI will handle:
  // - armor damage
  // - tire damage
  // - token rotation
  // - chat messages
  // - templates
  // ------------------------------------------------------------

  return {
    type: "collision",
    collisionType,
    ...collisionOutcome
  };
}

// ------------------------------------------------------------
// Additional exports required by importers
// ------------------------------------------------------------
export { determineCollisionType, resolveCollisionPhysics };
