//
// validate-suspension.js
// Full validation for SUSPENSION rules
//

export function validateSuspension(vehicle, catalogs, messages) {
  const suspensionId = vehicle.suspensionId;
  const bodyId = vehicle.bodyId;

  const suspension = catalogs.suspension[suspensionId];
  const body = catalogs.bodies[bodyId];

  // ------------------------------------------------------------
  // 1. Suspension must exist
  // ------------------------------------------------------------
  if (!suspension) {
    messages.errors.push(`Selected suspension '${suspensionId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Required suspension fields
  // ------------------------------------------------------------
  const required = ["name", "costMultiplier", "hcModifier"];

  for (const field of required) {
    if (suspension[field] === undefined || suspension[field] === null) {
      messages.errors.push(
        `Suspension '${suspension.name}' is missing required field '${field}'. Check suspension.json.`
      );
    }
  }

  // ------------------------------------------------------------
  // 3. Body must exist for compatibility checks
  // ------------------------------------------------------------
  if (!body) {
    messages.errors.push(
      `Suspension '${suspension.name}' cannot be validated because body '${bodyId}' does not exist.`
    );
    return;
  }

  // ------------------------------------------------------------
  // 4. Race-only suspension rules
  // ------------------------------------------------------------
  if (suspension.specialRules?.includes("race-only")) {
    const raceBodies = ["race", "formula", "can-am", "dragster", "funny-car"];

    if (!raceBodies.includes(body.category)) {
      messages.errors.push(
        `Suspension '${suspension.name}' can only be used on race car bodies.`
      );
    }
  }

  // ------------------------------------------------------------
  // 5. Cycle / Trike suspension rules
  // ------------------------------------------------------------
  if (["cycle", "trike", "rev-trike"].includes(body.category)) {
    if (!suspension.specialRules?.includes("cycle")) {
      messages.errors.push(
        `Suspension '${suspension.name}' is not valid for cycle/trike bodies.`
      );
    }
  }

  // ------------------------------------------------------------
  // 6. Off-road suspension rules
  // ------------------------------------------------------------
  if (suspension.specialRules?.includes("off-road")) {
    messages.info.push(
      `Suspension '${suspension.name}' provides off-road capability.`
    );
  }

  // ------------------------------------------------------------
  // 7. HC modifier sanity
  // ------------------------------------------------------------
  if (typeof suspension.hcModifier !== "number") {
    messages.errors.push(
      `Suspension '${suspension.name}' has invalid HC modifier '${suspension.hcModifier}'.`
    );
  }

  // ------------------------------------------------------------
  // 8. Cost multiplier sanity
  // ------------------------------------------------------------
  if (suspension.costMultiplier <= 0) {
    messages.errors.push(
      `Suspension '${suspension.name}' has invalid cost multiplier '${suspension.costMultiplier}'.`
    );
  }

  // ------------------------------------------------------------
  // 9. Van/Subcompact HC overrides (Excel rule)
  // ------------------------------------------------------------
  // Excel has special HC tables for vans and subcompacts.
  if (body.category === "van" && suspension.vanHC !== undefined) {
    messages.info.push(
      `Suspension '${suspension.name}' uses van-specific HC modifier: ${suspension.vanHC}.`
    );
  }

  if (body.category === "subcompact" && suspension.subcompactHC !== undefined) {
    messages.info.push(
      `Suspension '${suspension.name}' uses subcompact-specific HC modifier: ${suspension.subcompactHC}.`
    );
  }

  // ------------------------------------------------------------
  // 10. Future-proofing for special vehicle types
  // ------------------------------------------------------------
  if (["boat", "hovercraft", "helicopter"].includes(body.category)) {
    messages.info.push(
      `Body '${body.name}' is a special vehicle type. Suspension '${suspension.name}' may require additional rules.`
    );
  }

  // ------------------------------------------------------------
  // 11. Sanity check: suspension must not reduce HC below RAW minimum
  // ------------------------------------------------------------
  const baseHC = body.baseHC ?? 0;
  const hcTotal = baseHC + (suspension.hcModifier ?? 0);

  if (hcTotal < -6) {
    messages.warnings.push(
      `Suspension '${suspension.name}' reduces HC below RAW minimum (-6).`
    );
  }
}
