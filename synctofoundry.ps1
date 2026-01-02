# sync-to-foundry.ps1
# ------------------------------------------------------------
# Sync Car Wars system from VS Code workspace to Foundry VTT
# Overwrites files by default
# Reports which files changed
# ------------------------------------------------------------

# Path to your VS Code project root
$Source = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"

# Path to your Foundry Portable system folder
$Destination = "C:\Users\Feindevil.SANCTUARY\Documents\Foundry\FoundryPortable\Data\systems\carwars-system"

Write-Host "🔵 Syncing Car Wars system to Foundry..." -ForegroundColor Cyan
Write-Host "Source:      $Source"
Write-Host "Destination: $Destination"
Write-Host ""

# Collect all source files
$SourceFiles = Get-ChildItem -Path $Source -Recurse -File

# Track changed files
$ChangedFiles = @()

foreach ($File in $SourceFiles) {

    # Build destination path
    $RelativePath = $File.FullName.Substring($Source.Length).TrimStart("\")
    $DestFile = Join-Path $Destination $RelativePath

    # Ensure destination directory exists
    $DestDir = Split-Path $DestFile
    if (!(Test-Path $DestDir)) {
        New-Item -ItemType Directory -Path $DestDir | Out-Null
    }

    $CopyNeeded = $true

    # If destination file exists, compare hashes
    if (Test-Path $DestFile) {
        $SourceHash = Get-FileHash $File.FullName -Algorithm SHA256
        $DestHash   = Get-FileHash $DestFile -Algorithm SHA256

        if ($SourceHash.Hash -eq $DestHash.Hash) {
            $CopyNeeded = $false
        }
    }

    # Copy only if changed or missing
    if ($CopyNeeded) {
        Copy-Item -Path $File.FullName -Destination $DestFile -Force
        $ChangedFiles += $RelativePath
    }
}

# Summary
Write-Host ""
Write-Host "🟢 Sync complete!" -ForegroundColor Green
Write-Host "----------------------------------------"

if ($ChangedFiles.Count -eq 0) {
    Write-Host "No files were changed."
} else {
    Write-Host "$($ChangedFiles.Count) file(s) updated:"
    $ChangedFiles | ForEach-Object { Write-Host " - $_" }
}

Write-Host "----------------------------------------"
