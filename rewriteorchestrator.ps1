# ------------------------------------------------------------
# Rewrite orchestrator imports to use movement-api.js
# ------------------------------------------------------------

$Root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system\module\movement"
$OrchestratorPath = Join-Path $Root "orchestrator"

Write-Host "🔧 Updating orchestrator imports to use movement-api.js..." -ForegroundColor Cyan

$Files = Get-ChildItem -Path $OrchestratorPath -Filter *.js

foreach ($file in $Files) {
    $Original = Get-Content $file.FullName
    $Updated  = @()

    $Changed = $false

    foreach ($line in $Original) {
        if ($line -match "import\s+{([^}]+)}\s+from\s+['""](.+)['""]") {
            $funcs = $matches[1].Trim()
            $Updated += "import { $funcs } from '../movement-api.js';"
            $Changed = $true
        }
        else {
            $Updated += $line
        }
    }

    if ($Changed) {
        $Backup = $file.FullName + ".bak"
        Copy-Item $file.FullName $Backup -Force

        $Updated | Set-Content $file.FullName -Encoding UTF8

        Write-Host "✔ Updated imports in $($file.Name)" -ForegroundColor Green
        Write-Host "  Backup saved as $($file.Name).bak"
    }
    else {
        Write-Host "• No import changes needed in $($file.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "`n🎉 All orchestrator imports updated to use movement-api.js" -ForegroundColor Yellow
