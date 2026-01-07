<#
    Car Wars System Audit Script
    -------------------------------------
    Compares Dev → Foundry system folders
    Detects:
      - Missing files
      - Extra/orphan files
      - Modified files
      - Empty files
      - Zero-byte assets
      - Duplicate filenames
      - Unreferenced JS modules
      - Unreferenced templates
      - Unused CSS classes
      - Files not referenced anywhere

    Non-destructive. Safe to run anytime.
#>

Write-Host "========================================="
Write-Host "🟢 CAR WARS SYSTEM AUDIT STARTING"
Write-Host "========================================="

# --- CONFIG -------------------------------------------------------------

# Your Dev environment root
$DevRoot = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"

# Your Foundry system install root
$FoundryRoot = "C:\Users\Feindevil.SANCTUARY\Documents\Foundry\FoundryPortable\Data\systems\carwars-system"

# Validate paths
if (-not (Test-Path $DevRoot)) {
    Write-Host "❌ Dev path does not exist: $DevRoot" -ForegroundColor Red
    exit
}

if (-not (Test-Path $FoundryRoot)) {
    Write-Host "❌ Foundry path does not exist: $FoundryRoot" -ForegroundColor Red
    exit
}

# --- HELPERS -------------------------------------------------------------

function NormalizePath($path, $root) {
    return $path.FullName.Replace($root, "").TrimStart("\")
}

# --- COLLECT FILE LISTS -------------------------------------------------

$DevFiles     = Get-ChildItem -Recurse $DevRoot
$FoundryFiles = Get-ChildItem -Recurse $FoundryRoot

$DevMap = $DevFiles |
    Where-Object { -not $_.PSIsContainer } |
    ForEach-Object { NormalizePath $_ $DevRoot }

$FoundryMap = $FoundryFiles |
    Where-Object { -not $_.PSIsContainer } |
    ForEach-Object { NormalizePath $_ $FoundryRoot }

# --- BASIC DIFF ---------------------------------------------------------

$MissingInFoundry = $DevMap      | Where-Object { $_ -notin $FoundryMap }
$OrphansInFoundry = $FoundryMap  | Where-Object { $_ -notin $DevMap }
$CommonFiles      = $DevMap      | Where-Object { $_ -in $FoundryMap }

# --- MODIFIED FILES -----------------------------------------------------

$Modified = @()

foreach ($file in $CommonFiles) {
    $devFile     = Join-Path $DevRoot     $file
    $foundryFile = Join-Path $FoundryRoot $file

    if ((Get-FileHash $devFile).Hash -ne (Get-FileHash $foundryFile).Hash) {
        $Modified += $file
    }
}

# --- ZERO-BYTE FILES ----------------------------------------------------

$ZeroByte = $DevFiles |
    Where-Object { -not $_.PSIsContainer -and $_.Length -eq 0 } |
    ForEach-Object { NormalizePath $_ $DevRoot }

# --- DUPLICATE FILENAMES ------------------------------------------------

$DuplicateNames = $DevFiles |
    Where-Object { -not $_.PSIsContainer } |
    Group-Object Name |
    Where-Object { $_.Count -gt 1 } |
    Select-Object Name, Count, Group

# --- UNREFERENCED JS MODULES -------------------------------------------

$AllJS = $DevFiles | Where-Object { $_.Extension -eq ".js" }
$AllContent = (Get-ChildItem -Recurse $DevRoot -File | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$UnreferencedJS = @()

foreach ($js in $AllJS) {
    $name = $js.Name
    if ($AllContent -notmatch [regex]::Escape($name)) {
        $UnreferencedJS += NormalizePath $js $DevRoot
    }
}

# --- UNREFERENCED HANDLEBARS TEMPLATES ---------------------------------

$AllHBS = $DevFiles | Where-Object { $_.Extension -eq ".hbs" }

$UnreferencedHBS = @()

foreach ($hbs in $AllHBS) {
    $name = $hbs.Name
    if ($AllContent -notmatch [regex]::Escape($name)) {
        $UnreferencedHBS += NormalizePath $hbs $DevRoot
    }
}

# --- UNUSED CSS CLASSES -------------------------------------------------

$CSSFiles = $DevFiles | Where-Object { $_.Extension -eq ".css" }
$CSSContent = ($CSSFiles | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

$CSSClasses = Select-String -InputObject $CSSContent -Pattern "\.([a-zA-Z0-9\-_]+)" -AllMatches |
    ForEach-Object { $_.Matches.Value.TrimStart(".") } |
    Sort-Object -Unique

$UnusedCSS = @()

foreach ($cls in $CSSClasses) {
    if ($AllContent -notmatch $cls) {
        $UnusedCSS += $cls
    }
}

# --- OUTPUT REPORT ------------------------------------------------------

Write-Host ""
Write-Host "========================================="
Write-Host "📦 FILE AUDIT"
Write-Host "========================================="

Write-Host "`n🟡 Missing in Foundry:" -ForegroundColor Yellow
$MissingInFoundry | ForEach-Object { Write-Host "  + $_" }

Write-Host "`n🔵 Orphans in Foundry:" -ForegroundColor Cyan
$OrphansInFoundry | ForEach-Object { Write-Host "  ! $_" }

Write-Host "`n🟠 Modified Files:" -ForegroundColor DarkYellow
$Modified | ForEach-Object { Write-Host "  * $_" }

Write-Host "`n⚫ Zero-byte Files:" -ForegroundColor Gray
$ZeroByte | ForEach-Object { Write-Host "  - $_" }

Write-Host "`n🟣 Duplicate Filenames:" -ForegroundColor Magenta
foreach ($d in $DuplicateNames) {
    Write-Host "  $($d.Name) ($($d.Count)x)"
    foreach ($g in $d.Group) {
        Write-Host "    - $($g.FullName)"
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "🧩 CODE AUDIT"
Write-Host "========================================="

Write-Host "`n🔴 Unreferenced JS Modules:" -ForegroundColor Red
$UnreferencedJS | ForEach-Object { Write-Host "  ! $_" }

Write-Host "`n🟤 Unreferenced Templates (.hbs):" -ForegroundColor DarkYellow
$UnreferencedHBS | ForEach-Object { Write-Host "  ! $_" }

Write-Host "`n🟢 Unused CSS Classes:" -ForegroundColor Green
$UnusedCSS | ForEach-Object { Write-Host "  . $_" }

Write-Host ""
Write-Host "========================================="
Write-Host "🟢 AUDIT COMPLETE"
Write-Host "========================================="
