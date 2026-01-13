# ------------------------------------------------------------
# Condensed file listing for Car Wars dev environment
# Safe, read-only, copy/paste friendly
# ------------------------------------------------------------

# 👉 Set your project root here
$root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"

# 👉 Folders to ignore
$ignore = @(
    ".git",
    "node_modules",
    ".vs",
    ".vscode",
    "dist",
    "build"
)

# 👉 File extensions to include
$extensions = @(
    ".js", ".json", ".html", ".hbs", ".css", ".md", ".ps1"
)

Write-Host "=== PROJECT FILE LISTING (CONDENSED) ==="
Write-Host "Root: $root"
Write-Host ""

Get-ChildItem -Path $root -Recurse -File |
    Where-Object {
        # Ignore unwanted folders
        foreach ($folder in $ignore) {
            if ($_.FullName -like "*\$folder\*") { return $false }
        }
        # Only include relevant extensions
        $_.Extension -in $extensions
    } |
    ForEach-Object {
        # Convert to relative path
        $relative = $_.FullName.Replace($root, "").TrimStart("\","/")

        # Output in compact format
        Write-Host $relative
    }

Write-Host ""
Write-Host "=== END OF LIST ==="
