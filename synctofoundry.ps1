# ------------------------------------------------------------
# Sync Dev → Foundry (Copy only changed or missing files)
# Also verify existence of all other files
# New + Updated files are printed LAST for easy review
# ------------------------------------------------------------

$DevPath      = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"
$FoundryPath  = "C:\Users\Feindevil.SANCTUARY\Documents\Foundry\FoundryPortable\Data\systems\carwars-system"

Write-Host "🔵 Scanning for changes..." -ForegroundColor Cyan
Write-Host "Dev:      $DevPath"
Write-Host "Foundry:  $FoundryPath"
Write-Host ""

# ------------------------------------------------------------
# OneDrive hydration — ensure all files are visible to PowerShell
# ------------------------------------------------------------
try {
    attrib -P -S -H "$DevPath\*" /S | Out-Null
} catch {
    Write-Host "⚠️ OneDrive hydration skipped (attrib not available)" -ForegroundColor Yellow
}

# ------------------------------------------------------------
# Exclude ONLY the root /carwars/ folder (literal match, not regex)
# ------------------------------------------------------------
$ExcludePattern = "*\carwars\*"

$DevFiles = Get-ChildItem -Path $DevPath -Recurse -File |
    Where-Object { $_.FullName -notlike $ExcludePattern }

$FoundryFiles = Get-ChildItem -Path $FoundryPath -Recurse -File |
    Where-Object { $_.FullName -notlike $ExcludePattern }

# ------------------------------------------------------------
# Ensure all directories exist in Foundry
# ------------------------------------------------------------
$DevDirs = Get-ChildItem -Path $DevPath -Recurse -Directory |
    Where-Object { $_.FullName -notlike $ExcludePattern }

foreach ($Dir in $DevDirs) {
    $Relative = $Dir.FullName.Substring($DevPath.Length).TrimStart("\")
    $DestDir = Join-Path $FoundryPath $Relative

    if (!(Test-Path $DestDir)) {
        New-Item -ItemType Directory -Path $DestDir | Out-Null
        Write-Host "📁 Created directory: $Relative" -ForegroundColor DarkYellow
    }
}

# ------------------------------------------------------------
# Prepare tracking arrays
# ------------------------------------------------------------
$NewFiles     = @()
$UpdatedFiles = @()
$MatchedFiles = @()
$Orphans      = @()

# ------------------------------------------------------------
# Check every file in DEV → compare to Foundry
# ------------------------------------------------------------
foreach ($File in $DevFiles) {

    $Relative = $File.FullName.Substring($DevPath.Length).TrimStart("\")
    $DestFile = Join-Path $FoundryPath $Relative

    # Ensure directory exists (safety)
    $DestDir = Split-Path $DestFile
    if (!(Test-Path $DestDir)) {
        New-Item -ItemType Directory -Path $DestDir | Out-Null
    }

    if (!(Test-Path $DestFile)) {
        Copy-Item -Path $File.FullName -Destination $DestFile -Force
        $NewFiles += $Relative
        continue
    }

    # Compare hashes
    $SrcHash = Get-FileHash $File.FullName -Algorithm SHA256
    $DstHash = Get-FileHash $DestFile -Algorithm SHA256

    if ($SrcHash.Hash -ne $DstHash.Hash) {
        Copy-Item -Path $File.FullName -Destination $DestFile -Force
        $UpdatedFiles += $Relative
    }
    else {
        $MatchedFiles += $Relative
    }
}

# ------------------------------------------------------------
# Check for orphaned files in Foundry (not present in DEV)
# ------------------------------------------------------------
foreach ($File in $FoundryFiles) {
    $Relative = $File.FullName.Substring($FoundryPath.Length).TrimStart("\")
    $DevFile  = Join-Path $DevPath $Relative

    if (!(Test-Path $DevFile)) {
        $Orphans += $Relative
    }
}

# ------------------------------------------------------------
# Summary Output (Unchanged + Orphans FIRST)
# ------------------------------------------------------------
Write-Host ""
Write-Host "🟢 Sync complete!" -ForegroundColor Green
Write-Host "----------------------------------------"

Write-Host "`nUnchanged files: $($MatchedFiles.Count)"
$MatchedFiles | ForEach-Object { Write-Host " = $_" }

Write-Host "`nOrphans in Foundry (not in Dev): $($Orphans.Count)"
$Orphans | ForEach-Object { Write-Host " ! $_" }

# ------------------------------------------------------------
# IMPORTANT SECTION — PRINTED LAST
# ------------------------------------------------------------
Write-Host "`n================ IMPORTANT CHANGES ================" -ForegroundColor Yellow

Write-Host "`nNew files copied: $($NewFiles.Count)" -ForegroundColor Green
$NewFiles | ForEach-Object { Write-Host " + $_" }

Write-Host "`nUpdated files copied: $($UpdatedFiles.Count)" -ForegroundColor Cyan
$UpdatedFiles | ForEach-Object { Write-Host " * $_" }

Write-Host "`n==================================================="
