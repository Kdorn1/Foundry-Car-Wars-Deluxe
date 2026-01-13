<#
    outputfilestructure-lite.ps1
    -----------------------------
    Generates a lightweight file structure report that excludes:
      - Git files
      - Hashes
      - Full paths
      - Directory metadata

    Output is small enough to upload directly.
#>

$Root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"

$items = Get-ChildItem -Path $Root -Recurse -Force |
    Where-Object {
        $_.FullName -notmatch "\\\.git($|\\)" -and
        $_.Name -notmatch "^\.git"
    }

$files = $items | ForEach-Object {
    $relative = $_.FullName.Substring($Root.Length).TrimStart("\\")

    [PSCustomObject]@{
        RelativePath = $relative
        SizeBytes    = if ($_.PSIsContainer) { 0 } else { $_.Length }
        LastModified = $_.LastWriteTime
    }
}

$sorted = $files | Sort-Object RelativePath

$outFile = Join-Path $Root "project-file-structure-lite.json"
$sorted | ConvertTo-Json -Depth 5 | Out-File $outFile -Encoding UTF8

Write-Host "Lite file structure written to:"
Write-Host "  $outFile"
