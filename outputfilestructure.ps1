Get-ChildItem -Recurse | ForEach-Object {
    $path = $_.FullName
    $type = if ($_.PSIsContainer) { "Folder" } else { "File" }
    $size = if ($_.PSIsContainer) { "" } else { [math]::Round($_.Length / 1KB, 1) }


    $preview = ""
    $lineCount = ""

    if (-not $_.PSIsContainer) {
        try {
            $firstLine = Get-Content -Path $_.FullName -TotalCount 1 -ErrorAction Stop
            $preview = ($firstLine -replace '\s+', ' ').Trim()
            $lineCount = (Get-Content -Path $_.FullName -ErrorAction Stop).Count
        }
        catch {
            $preview = "[binary]"
        }
    }

    [PSCustomObject]@{
        Path    = $path
        Type    = $type
        KB      = $size
        Lines   = $lineCount
        Preview = $preview
    }
} | Format-Table -AutoSize
