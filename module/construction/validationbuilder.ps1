# Creates the modular validation folder structure and empty rule files
# for the Car Wars Foundry system (Option A)

$basePath = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system\module\construction\validation"

# Ensure the directory exists
if (-Not (Test-Path $basePath)) {
    New-Item -ItemType Directory -Path $basePath | Out-Null
}

# List of validation modules to create
$files = @(
    "index.js",
    "validate-body.js",
    "validate-chassis.js",
    "validate-armor.js",
    "validate-weapons.js",
    "validate-accessories.js",
    "validate-powerplant.js",
    "validate-gas-tank.js",
    "validate-tires.js",
    "validate-spaces.js",
    "validate-weight.js",
    "validate-performance.js",
    "validate-crew.js",
    "validate-internal.js"
)

foreach ($file in $files) {
    $fullPath = Join-Path $basePath $file

    if (-Not (Test-Path $fullPath)) {
        # Create file with a starter comment block
        @"
//
// $file
// Auto-generated shell for modular validation system (Option A)
// Each module exports a function:
//    export function validateX(vehicle, catalogs, messages) { ... }
//
"@ | Out-File -FilePath $fullPath -Encoding UTF8

        Write-Host "Created: $file"
    }
    else {
        Write-Host "Skipped (already exists): $file"
    }
}

Write-Host "`nValidation module shell created successfully."
