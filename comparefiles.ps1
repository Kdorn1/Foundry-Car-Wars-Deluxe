# ------------------------------------------------------------
# Car Wars System — Movement API Consistency Checker
# Scans orchestrators + engine modules for:
# - Missing exports
# - Mismatched names
# - Unused engine functions
# ------------------------------------------------------------

$Root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system\module\movement"

Write-Host "🔍 Scanning orchestrators and engine modules..." -ForegroundColor Cyan

# ------------------------------------------------------------
# 1. Collect orchestrator imports
# ------------------------------------------------------------
$OrchestratorFiles = Get-ChildItem -Path "$Root\orchestrator" -Filter *.js

$OrchestratorImports = @()

foreach ($file in $OrchestratorFiles) {
    $lines = Get-Content $file.FullName
    foreach ($line in $lines) {
        if ($line -match "import\s+{([^}]+)}\s+from\s+['""](.+)['""]") {
            $funcs = $matches[1].Split(",") | ForEach-Object { $_.Trim() }
            $path  = $matches[2]
            foreach ($f in $funcs) {
                $OrchestratorImports += [PSCustomObject]@{
                    File       = $file.Name
                    Function   = $f
                    ImportPath = $path
                }
            }
        }
    }
}

# ------------------------------------------------------------
# 2. Collect engine exports
# ------------------------------------------------------------
$EngineFiles = Get-ChildItem -Path $Root -Recurse -Filter *.js |
    Where-Object { $_.FullName -notmatch "orchestrator" }

$EngineExports = @()

foreach ($file in $EngineFiles) {
    $lines = Get-Content $file.FullName
    foreach ($line in $lines) {
        # export function foo(...)
        if ($line -match "export\s+function\s+([A-Za-z0-9_]+)") {
            $EngineExports += [PSCustomObject]@{
                File     = $file.Name
                Function = $matches[1]
            }
        }

        # export const foo = ...
        if ($line -match "export\s+const\s+([A-Za-z0-9_]+)") {
            $EngineExports += [PSCustomObject]@{
                File     = $file.Name
                Function = $matches[1]
            }
        }
    }
}

# ------------------------------------------------------------
# 3. Compare orchestrator imports vs engine exports
# ------------------------------------------------------------
$MissingExports = @()
$UnusedExports  = @()

foreach ($imp in $OrchestratorImports) {
    $match = $EngineExports | Where-Object { $_.Function -eq $imp.Function }
    if (-not $match) {
        $MissingExports += $imp
    }
}

foreach ($exp in $EngineExports) {
    $match = $OrchestratorImports | Where-Object { $_.Function -eq $exp.Function }
    if (-not $match) {
        $UnusedExports += $exp
    }
}

# ------------------------------------------------------------
# 4. Output results
# ------------------------------------------------------------
Write-Host "`n==================== IMPORTS EXPECTED ====================" -ForegroundColor Yellow
$OrchestratorImports | Format-Table -AutoSize

Write-Host "`n==================== ENGINE EXPORTS ======================" -ForegroundColor Yellow
$EngineExports | Format-Table -AutoSize

Write-Host "`n==================== MISSING EXPORTS =====================" -ForegroundColor Red
if ($MissingExports.Count -eq 0) {
    Write-Host "✔ No missing exports!" -ForegroundColor Green
} else {
    $MissingExports | Format-Table -AutoSize
}

Write-Host "`n==================== UNUSED EXPORTS ======================" -ForegroundColor Magenta
if ($UnusedExports.Count -eq 0) {
    Write-Host "✔ No unused exports!" -ForegroundColor Green
} else {
    $UnusedExports | Format-Table -AutoSize
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Scan complete."
