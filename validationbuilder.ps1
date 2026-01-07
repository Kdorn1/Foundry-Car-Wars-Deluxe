# validationbuilder.ps1 - robust search for fromUuid usage in templates
# Works whether you run it from the repo root or from inside the module folder.

# Determine the script location
$scriptRoot = $PSScriptRoot

# Candidate template paths to try (covers both repo-root and module-root layouts)
$candidates = @(
  (Join-Path -Path $scriptRoot -ChildPath "systems\carwars-system\templates"),
  (Join-Path -Path $scriptRoot -ChildPath "templates"),
  (Join-Path -Path $scriptRoot -ChildPath ".\systems\carwars-system\templates"),
  (Join-Path -Path $scriptRoot -ChildPath ".\templates")
)

# Find the first existing path
$templatesPath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $templatesPath) {
  Write-Error "Templates path not found. Tried these candidates:`n$($candidates -join "`n")"
  exit 1
}

Write-Host "Searching templates at: $templatesPath"

# Search for fromUuid in all HTML templates and print file:line -> text
Get-ChildItem -Path $templatesPath -Recurse -Filter *.html |
  Select