<#
    Move Car Wars partial templates to the correct folder structure.

    This script:
      - Ensures the correct folder exists:
            templates/actor/partials/
      - Moves partials from:
            module/actor/templates/partials/
        into the correct location.
      - Skips files already in the correct place.
      - Never overwrites existing files.
      - Logs everything it does.

    Safe and non-destructive.
#>

Write-Host "========================================="
Write-Host "🟢 CAR WARS PARTIALS FOLDER FIX"
Write-Host "========================================="

# --- CONFIG -------------------------------------------------------------

$DevRoot = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"

$OldPath = Join-Path $DevRoot "module\actor\templates\partials"
$NewPath = Join-Path $DevRoot "templates\actor\partials"

# --- VALIDATE PATHS -----------------------------------------------------

if (-not (Test-Path $OldPath)) {
    Write-Host "No old partials folder found at:" -ForegroundColor Yellow
    Write-Host "  $OldPath"
    Write-Host "Nothing to move."
    exit
}

if (-not (Test-Path $NewPath)) {
    Write-Host "Creating new partials folder:" -ForegroundColor Cyan
    Write-Host "  $NewPath"
    New-Item -ItemType Directory -Path $NewPath | Out-Null
}

# --- MOVE FILES ---------------------------------------------------------

$Files = Get-ChildItem -Path $OldPath -File

if ($Files.Count -eq 0) {
    Write-Host "No partials found in old folder. Nothing to move." -ForegroundColor Yellow
    exit
}

Write-Host "`nMoving partials..." -ForegroundColor Cyan

foreach ($file in $Files) {

    $Source = $file.FullName
    $Destination = Join-Path $NewPath $file.Name

    if (Test-Path $Destination) {
        Write-Host "⚠ Skipping (already exists): $($file.Name)" -ForegroundColor Yellow
        continue
    }

    Write-Host "➡ Moving: $($file.Name)" -ForegroundColor Green
    Move-Item -Path $Source -Destination $Destination
}

Write-Host "`n========================================="
Write-Host "🟢 PARTIALS MOVE COMPLETE"
Write-Host "========================================="
Write-Host "Old folder (still exists): $OldPath"
Write-Host "New folder:               $NewPath"
