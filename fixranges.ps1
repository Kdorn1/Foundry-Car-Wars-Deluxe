# ------------------------------------------------------------
# Fix-InvalidRangeUsage.ps1
# Finds and corrects invalid {{range ...}} usage in templates
# ------------------------------------------------------------

$root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"
$pattern = "{{range\s+([^}]+)}}"
$validPattern = "{{#each\s+\(range\s+[^)]+\)}}"

Write-Host "`n🔍 Scanning for invalid {{range ...}} usage in: $root`n"

Get-ChildItem -Path $root -Recurse -Include *.html, *.hbs | ForEach-Object {
    $file = $_.FullName
    $lines = Get-Content $file
    $modified = $false

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]

        # Skip valid usage
        if ($line -match $validPattern) { continue }

        # Detect invalid inline usage
        if ($line -match $pattern) {
            $args = $Matches[1].Trim()

            Write-Host "⚠️  Fixing invalid range usage in $file at line $($i + 1):"
            Write-Host "    BEFORE: $line" -ForegroundColor Yellow

            # Replace inline {{range X Y}} with {{#each (range X Y)}}{{this}}{{/each}}
            $newLine = $line -replace $pattern, "{{#each (range $args)}}{{this}}{{/each}}"
            $lines[$i] = $newLine
            $modified = $true

            Write-Host "    AFTER:  $newLine" -ForegroundColor Green
        }
    }

    if ($modified) {
        # Backup original file
        Copy-Item $file "$file.bak" -Force

        # Write corrected file
        Set-Content -Path $file -Value $lines

        Write-Host "💾 Saved corrections to $file (backup created)" -ForegroundColor Cyan
    }
}

Write-Host "`n✅ Scan + correction complete.`n"
