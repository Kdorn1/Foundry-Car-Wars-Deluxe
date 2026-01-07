# ------------------------------------------------------------
# Build movement-api.js — Unified Movement API Layer
# ------------------------------------------------------------

$Root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system\module\movement"
$ApiFile = Join-Path $Root "movement-api.js"

Write-Host "🔍 Building unified movement API..." -ForegroundColor Cyan

# ------------------------------------------------------------
# 1. Collect orchestrator imports (what the API must provide)
# ------------------------------------------------------------
$OrchestratorFiles = Get-ChildItem -Path "$Root\orchestrator" -Filter *.js

$Imports = @()

foreach ($file in $OrchestratorFiles) {
    $lines = Get-Content $file.FullName
    foreach ($line in $lines) {
        if ($line -match "import\s+{([^}]+)}\s+from\s+['""](.+)['""]") {
            $funcs = $matches[1].Split(",") | ForEach-Object { $_.Trim() }
            foreach ($f in $funcs) {
                $Imports += $f
            }
        }
    }
}

$Imports = $Imports | Sort-Object -Unique

# ------------------------------------------------------------
# 2. Force-include core engine/orchestrator functions
# ------------------------------------------------------------
$ForcedExports = @(
    "performManeuver",
    "runManeuverFlow",
    "runMovementPhase",
    "runMovementEngine",
    "runCrashTable"
)

$Imports = $Imports + $ForcedExports | Sort-Object -Unique

# ------------------------------------------------------------
# 3. Collect exports from ALL movement files (excluding movement-api.js)
# ------------------------------------------------------------
$AllFiles = Get-ChildItem -Path $Root -Recurse -Filter *.js |
    Where-Object { $_.Name -ne "movement-api.js" }

$Exports = @()

foreach ($file in $AllFiles) {
    $lines = Get-Content $file.FullName
    foreach ($line in $lines) {

        # export function foo(...)
        if ($line -match "export\s+function\s+([A-Za-z0-9_]+)") {
            $Exports += [PSCustomObject]@{
                File = $file.Name
                Func = $matches[1]
            }
        }

        # export async function foo(...)
        if ($line -match "export\s+async\s+function\s+([A-Za-z0-9_]+)") {
            $Exports += [PSCustomObject]@{
                File = $file.Name
                Func = $matches[1]
            }
        }

        # export const foo = ...
        if ($line -match "export\s+const\s+([A-Za-z0-9_]+)") {
            $Exports += [PSCustomObject]@{
                File = $file.Name
                Func = $matches[1]
            }
        }

        # export { foo }, export { foo as bar }, export { foo, bar }
        if ($line -match "export\s*{\s*([^}]+)\s*}") {
            $names = $matches[1].Split(",") | ForEach-Object {
                ($_ -replace "as.*", "").Trim()
            }
            foreach ($n in $names) {
                if ($n -match "^[A-Za-z0-9_]+$") {
                    $Exports += [PSCustomObject]@{
                        File = $file.Name
                        Func = $n
                    }
                }
            }
        }
    }
}

# ------------------------------------------------------------
# 4. Build API file
# ------------------------------------------------------------
$ApiContent = @()
$ApiContent += "// AUTO-GENERATED — DO NOT EDIT"
$ApiContent += "// Unified Movement API Layer"
$ApiContent += "// ------------------------------------------------------------`n"

foreach ($func in $Imports) {

    # Only take the FIRST matching export, not all of them
    $match = ($Exports | Where-Object { $_.Func -eq $func }) | Select-Object -First 1

    if ($match) {
        $ApiContent += "export { $func } from './$($match.File)';"
    }
    else {
        $ApiContent += "// MISSING: $func"
    }
}

# ------------------------------------------------------------
# 5. Write movement-api.js
# ------------------------------------------------------------
$ApiContent | Set-Content $ApiFile -Encoding UTF8

Write-Host "✅ movement-api.js generated at:" -ForegroundColor Green
Write-Host $ApiFile

Write-Host "`n📄 Summary:"
foreach ($line in $ApiContent) {
    Write-Host $line
}
