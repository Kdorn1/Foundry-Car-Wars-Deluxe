param(
    [string]$Root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"
)

# Phase 1 directories (ONLY these are validated)
$Phase1Dirs = @(
    "data",
    "module\rules",
    "module\actor",
    "system.json",
    "template.json"
)

# Forbidden patterns for Phase 1 files
$ForbiddenPatterns = @(
    # Foundry API (not allowed in Phase 1)
    "actor\.update",
    "canvas",
    "token",
    "ChatMessage",
    "ui\.",
    "Hooks\.",
    "game\.",

    # Dice logic (actual rolling, not field names)
    "new\s+Roll",
    "\.roll\(",
    "2d6",

    # UI rendering (not allowed in Phase 1)
    "render\(",
    "html\(",

    # Async / side effects (not allowed in Phase 1)
    "await",
    "async",

    # Movement/Combat logic leakage (not allowed in Phase 1)
    "computeControlRoll",
    "collision",
    "skid",
    "spinout",
    "hazard-engine",
    "movement-engine"
)

Write-Host "Running Phase 1 validation..." -ForegroundColor Cyan

$results = @()

# Only scan Phase 1 directories
foreach ($dir in $Phase1Dirs) {
    $path = Join-Path $Root $dir

    if (Test-Path $path) {
        Get-ChildItem -Path $path -Recurse -File | ForEach-Object {
            $file = $_.FullName
            $content = Get-Content $file -Raw

            $failReason = $null

            foreach ($pattern in $ForbiddenPatterns) {
                if ($content -match $pattern) {
                    $failReason = "Contains forbidden pattern: $pattern"
                    break
                }
            }

            # JSON validity check for .json files
            if (-not $failReason -and $_.Extension -eq ".json") {
                try {
                    $null = $content | ConvertFrom-Json -ErrorAction Stop
                }
                catch {
                    $failReason = "Invalid JSON structure"
                }
            }

            $results += [PSCustomObject]@{
                File = $file
                Phase1_OK = [bool](-not $failReason)
                Reason = $failReason
            }
        }
    }
}

$results | Format-Table -AutoSize
