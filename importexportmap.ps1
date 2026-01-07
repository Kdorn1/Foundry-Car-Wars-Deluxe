<#
    Car Wars System – File Usage Audit
    ----------------------------------
    For every file in DevRoot, checks whether it is referenced
    anywhere in the entire codebase.

    Detects:
      - Unused JS modules
      - Unused HBS templates
      - Unused CSS files
      - Unused data JSON files
      - Unused movement templates
      - Unused rule modules
      - Any file not referenced anywhere

    Non-destructive. Safe to run anytime.
#>

Write-Host "========================================="
Write-Host "🟢 CAR WARS FILE USAGE AUDIT STARTING"
Write-Host "========================================="

# --- CONFIG -------------------------------------------------------------

$DevRoot = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"

if (-not (Test-Path $DevRoot)) {
    Write-Host "❌ Dev path does not exist: $DevRoot" -ForegroundColor Red
    exit
}

# --- LOAD ALL CONTENT ---------------------------------------------------

Write-Host "Loading all file content..." -ForegroundColor Cyan

$AllFiles = Get-ChildItem -Recurse $DevRoot -File
$AllContent = ($AllFiles | ForEach-Object { Get-Content $_ -Raw }) -join "`n"

# --- AUDIT --------------------------------------------------------------

$UnusedFiles = @()

foreach ($file in $AllFiles) {

    $name = $file.Name
    $path = $file.FullName.Replace($DevRoot, "").TrimStart("\")
    $ext  = $file.Extension.ToLower()

    # Skip the audit script itself
    if ($name -eq "audit-file-usage.ps1") { continue }

    # Skip logs
    if ($ext -eq ".log") { continue }

    # Skip DB files (Foundry loads them dynamically)
    if ($ext -eq ".db") { continue }

    # Skip workspace/editor files
    if ($ext -eq ".code-workspace") { continue }

    # Check if file name appears anywhere in the codebase
    $pattern = [regex]::Escape($name)

    if ($AllContent -notmatch $pattern) {
        $UnusedFiles += $path
    }
}

# --- OUTPUT -------------------------------------------------------------

Write-Host ""
Write-Host "========================================="
Write-Host "📦 UNUSED FILES REPORT"
Write-Host "========================================="

if ($UnusedFiles.Count -eq 0) {
    Write-Host "🎉 No unused files detected. Everything is referenced." -ForegroundColor Green
} else {
    Write-Host "🔴 Unused files detected:" -ForegroundColor Red
    foreach ($f in $UnusedFiles) {
        Write-Host "  ! $f"
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "🟢 AUDIT COMPLETE"
Write-Host "========================================="
