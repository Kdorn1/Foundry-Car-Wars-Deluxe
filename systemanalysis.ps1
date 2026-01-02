# audit-movement-phase.ps1
$base = "module/movement/orchestrator"

$required = @(
  "maneuver-flow.js",
  "movement-flow.js",
  "hazard-flow.js",
  "control-flow.js",
  "collision-flow.js",
  "crash-flow.js",
  "movement-phase-orchestrator.js",
  "movement-phase-result.js",
  "movement-phase-schema.js",
  "movement-phase-validator.js",
  "index.js"
)

Write-Host "=== Movement Phase Audit ===`n"

foreach ($file in $required) {
  $path = Join-Path $base $file
  if (Test-Path $path) {
    $size = (Get-Item $path).Length
    if ($size -eq 0) {
      Write-Host "[EMPTY] $file" -ForegroundColor Yellow
    } else {
      Write-Host "[OK]    $file"
    }
  } else {
    Write-Host "[MISSING] $file" -ForegroundColor Red
  }
}

# Check top-level movement index
$movementIndex = "module/movement/index.js"
if (Test-Path $movementIndex) {
  Write-Host "`n[OK]    movement/index.js"
} else {
  Write-Host "`n[MISSING] movement/index.js" -ForegroundColor Red
}

Write-Host "`nAudit complete."
