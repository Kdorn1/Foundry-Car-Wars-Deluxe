# ------------------------------------------------------------
# Audit Dev Environment for Missing Exports
# ------------------------------------------------------------

$DevPath = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"
$JsFiles = Get-ChildItem -Path $DevPath -Recurse -Filter *.js

$MissingExports = @()
$NoExports = @()

Write-Host "🔍 Auditing exports in: $DevPath" -ForegroundColor Cyan
Write-Host ""

foreach ($File in $JsFiles) {
    $Content = Get-Content $File.FullName
    $Relative = $File.FullName.Substring($DevPath.Length).TrimStart("\")
    
    $Defines = @()
    $Exports = @()

    foreach ($Line in $Content) {
        if ($Line -match '^\s*(export\s+)?function\s+(\w+)') {
            $Defines += $Matches[2]
        }
        elseif ($Line -match '^\s*(export\s+)?class\s+(\w+)') {
            $Defines += $Matches[2]
        }
        elseif ($Line -match '^\s*export\s+(const|let|var)\s+(\w+)') {
            $Defines += $Matches[2]
        }
        elseif ($Line -match '^\s*export\s*\{(.+?)\}') {
            $Exports += ($Matches[1] -split ',') | ForEach-Object { $_.Trim() }
        }
        elseif ($Line -match '^\s*export\s+(function|class)\s+(\w+)') {
            $Exports += $Matches[2]
        }
    }

    $Missing = $Defines | Where-Object { $_ -notin $Exports }

    if ($Defines.Count -gt 0 -and $Exports.Count -eq 0) {
        $NoExports += $Relative
    }
    elseif ($Missing.Count -gt 0) {
        $MissingExports += [PSCustomObject]@{
            File = $Relative
            Missing = $Missing -join ", "
        }
    }
}

# ------------------------------------------------------------
# Summary Output
# ------------------------------------------------------------
Write-Host ""
Write-Host "🟢 Export Audit Complete!" -ForegroundColor Green
Write-Host "----------------------------------------"

Write-Host "`nFiles with missing exports: $($MissingExports.Count)" -ForegroundColor Yellow
foreach ($Item in $MissingExports) {
    Write-Host " * $($Item.File): missing [$($Item.Missing)]"
}

Write-Host "`nFiles with no exports at all: $($NoExports.Count)" -ForegroundColor Red
$NoExports | ForEach-Object { Write-Host " ! $_" }

Write-Host "`n✅ All other files are clean."
Write-Host "----------------------------------------"
