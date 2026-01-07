<#
    verify-template-structure.ps1
    ------------------------------------------------------------
    Performs two checks:

    1. PATH VERIFICATION PASS
       Ensures no code references archived or moved template files.

    2. NORMALIZATION SAFETY TEST
       Ensures all template references in JS/JSON files point to
       real files under the normalized template structure.

    This script is SAFE — it makes no changes.
#>

Write-Host "=== Car Wars Template Verification ===" -ForegroundColor Cyan

# ------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------

$ArchivedPaths = @(
    "module/actor/templates/vehicle-sheet.hbs",
    "module/actor/templates/driver-sheet.hbs",
    "templates/actor/partials/engine-panel.html"
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScanExtensions = @("*.js", "*.json", "*.hbs", "*.html")

# ------------------------------------------------------------
# 1. PATH VERIFICATION PASS
# ------------------------------------------------------------
Write-Host "`n=== 1. PATH VERIFICATION PASS ===" -ForegroundColor Yellow

foreach ($badPath in $ArchivedPaths) {
    $results = Get-ChildItem -Path $Root -Recurse -Include $ScanExtensions |
               Select-String -Pattern ([regex]::Escape($badPath))

    if ($results) {
        Write-Host "FOUND reference to archived path: $badPath" -ForegroundColor Red
        $results | ForEach-Object {
            Write-Host "  -> $($_.Path):$($_.LineNumber)  $($_.Line.Trim())"
        }
    }
    else {
        Write-Host "OK: No references to $badPath" -ForegroundColor Green
    }
}

# ------------------------------------------------------------
# 2. NORMALIZATION SAFETY TEST
# ------------------------------------------------------------
Write-Host "`n=== 2. TEMPLATE NORMALIZATION SAFETY TEST ===" -ForegroundColor Yellow

$RealTemplates = Get-ChildItem -Path "$Root\templates" -Recurse -Include *.html |
                 ForEach-Object {
                     $_.FullName.Replace($Root + "\", "").Replace("\", "/")
                 }

$TemplateRefPattern = "systems/carwars-system/(templates/[^""']+)"


$Refs = Get-ChildItem -Path $Root -Recurse -Include $ScanExtensions |
        Select-String -Pattern $TemplateRefPattern

$MissingRefs = @()
foreach ($ref in $Refs) {
    $regexMatches = [regex]::Matches($ref.Line, $TemplateRefPattern)
    foreach ($match in $regexMatches) {

        $path = $match.Groups[1].Value
        if ($RealTemplates -notcontains $path) {
            $MissingRefs += [PSCustomObject]@{
                File      = $ref.Path
                Line      = $ref.LineNumber
                Reference = $path
            }
        }
    }
}

if ($MissingRefs.Count -eq 0) {
    Write-Host "OK: All template references point to real files." -ForegroundColor Green
}
else {
    Write-Host "WARNING: Some template references do NOT match real files:" -ForegroundColor Red
    $MissingRefs | Format-Table -AutoSize
}

Write-Host "`n=== Verification Complete ===" -ForegroundColor Cyan
