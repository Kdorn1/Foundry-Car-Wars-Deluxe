# =====================================================================
#  Car Wars FoundryVTT System Deep Analysis Script
#  Produces:
#    1) carwars-project-scan.json       (per-file metadata)
#    2) carwars-architecture.json       (system-level analysis)
# =====================================================================

$root = Get-Location
$scanFile = Join-Path $root "carwars-project-scan.json"
$archFile = Join-Path $root "carwars-architecture.json"

$results = @()
$dependencyMap = @{}
$reverseDeps = @{}
$allTemplates = @()
$allJS = @()

# ------------------------------------------------------------
# Helper: Detect architectural role
# ------------------------------------------------------------
function Get-Role($file, $content) {
    if ($file.Extension -eq ".js") {
        if ($content -match "registerSheet") { return "Sheet Registration" }
        if ($content -match "class\s+.*Sheet") { return "Sheet Class" }
        if ($content -match "Hooks\.(on|once)") { return "System Bootstrap / Hook Listener" }
        if ($content -match "DataModel") { return "Actor/Item Data Model" }
        if ($content -match "rules" -or $file.Name -match "loader") { return "Rules Loader" }
        if ($content -match "movement") { return "Movement Engine" }
        if ($content -match "construction") { return "Construction Engine" }
        return "General JS Module"
    }

    if ($file.Extension -eq ".html") {
        if ($content -match "<form") { return "Sheet Template" }
        if ($content -match "{{>") { return "Partial Template" }
        return "UI Template"
    }

    if ($file.Extension -eq ".json") {
        return "JSON Configuration"
    }

    return "Other"
}

# ------------------------------------------------------------
# Scan all files
# ------------------------------------------------------------
Get-ChildItem -Path $root -Recurse -File | ForEach-Object {
    $file = $_
    $content = Get-Content $file.FullName -Raw

    $info = [ordered]@{
        Path        = $file.FullName.Replace($root, ".")
        Type        = $file.Extension
        SizeKB      = [math]::Round($file.Length / 1KB, 2)
        Summary     = ""
        Role        = Get-Role $file $content
        Classes     = @()
        Imports     = @()
        Exports     = @()
        Hooks       = @()
        Templates   = @()
        Partials    = @()
    }

    # Track JS files for dependency graph
    if ($file.Extension -eq ".js") {
        $allJS += $info.Path
    }

    # Detect JS metadata
    if ($file.Extension -eq ".js") {
        $info.Classes   = ([regex]::Matches($content, "class\s+([A-Za-z0-9_]+)")).Groups[1].Value
        $info.Imports   = ([regex]::Matches($content, "import\s+.*?from\s+['""](.+?)['""]")).Groups[1].Value
        $info.Exports   = ([regex]::Matches($content, "export\s+(class|function|const)\s+([A-Za-z0-9_]+)")).Groups[2].Value
        $info.Hooks     = ([regex]::Matches($content, "Hooks\.(on|once)\(['""](.+?)['""]")).Groups[2].Value

        # Summary tags
        if ($content -match "registerSheet") { $info.Summary += "Registers sheets; " }
        if ($content -match "Actor")         { $info.Summary += "Actor logic; " }
        if ($content -match "Item")          { $info.Summary += "Item logic; " }
        if ($content -match "movement")      { $info.Summary += "Movement engine; " }
        if ($content -match "template")      { $info.Summary += "Template renderer; " }

        # Build dependency map
        $dependencyMap[$info.Path] = $info.Imports
    }

    # Detect HTML templates
    if ($file.Extension -eq ".html") {
        $info.Partials  = ([regex]::Matches($content, "{{>\s*['""](.+?)['""]")).Groups[1].Value
        $info.Templates = ([regex]::Matches($content, "{{\s*([A-Za-z0-9_.]+)\s*}}")).Groups[1].Value

        $allTemplates += $info.Path

        if ($content -match "<form") { $info.Summary += "Sheet template; " }
        if ($content -match "tab")   { $info.Summary += "Tabbed UI; " }
        if ($content -match "crew")  { $info.Summary += "Crew UI; " }
        if ($content -match "weapon"){ $info.Summary += "Weapon UI; " }
    }

    # Detect JSON files
    if ($file.Extension -eq ".json") {
        $info.Summary = "JSON configuration or data file"
    }

    $results += New-Object PSObject -Property $info
}

# ------------------------------------------------------------
# Build reverse dependency graph
# ------------------------------------------------------------
foreach ($file in $dependencyMap.Keys) {
    foreach ($dep in $dependencyMap[$file]) {
        if (-not $reverseDeps.ContainsKey($dep)) {
            $reverseDeps[$dep] = @()
        }
        $reverseDeps[$dep] += $file
    }
}

# ------------------------------------------------------------
# Detect orphaned templates
# ------------------------------------------------------------
$usedTemplates = @()
foreach ($r in $results) {
    if ($r.Partials) { $usedTemplates += $r.Partials }
    if ($r.Templates) { $usedTemplates += $r.Templates }
}

$orphanedTemplates = $allTemplates | Where-Object { $usedTemplates -notcontains $_ }

# ------------------------------------------------------------
# Detect orphaned JS modules
# ------------------------------------------------------------
$importedJS = $dependencyMap.Values | ForEach-Object { $_ }
$orphanedJS = $allJS | Where-Object { $importedJS -notcontains $_ -and $_ -notmatch "carwars.js" }

# ------------------------------------------------------------
# Detect circular dependencies
# ------------------------------------------------------------
$circular = @()
foreach ($file in $dependencyMap.Keys) {
    foreach ($dep in $dependencyMap[$file]) {
        if ($dependencyMap.ContainsKey($dep) -and $dependencyMap[$dep] -contains $file) {
            $circular += "$file <-> $dep"
        }
    }
}

# ------------------------------------------------------------
# Build architecture summary
# ------------------------------------------------------------
$architecture = [ordered]@{
    TotalFiles          = $results.Count
    TotalJS             = $allJS.Count
    TotalTemplates      = $allTemplates.Count
    DependencyGraph     = $dependencyMap
    ReverseDependencies = $reverseDeps
    OrphanedTemplates   = $orphanedTemplates
    OrphanedJS          = $orphanedJS
    CircularDependencies = $circular
    Roles = @{
        SheetClasses     = $results | Where-Object { $_.Role -eq "Sheet Class" }
        SheetRegistration = $results | Where-Object { $_.Role -eq "Sheet Registration" }
        DataModels       = $results | Where-Object { $_.Role -eq "Actor/Item Data Model" }
        RulesLoaders     = $results | Where-Object { $_.Role -eq "Rules Loader" }
        MovementEngine   = $results | Where-Object { $_.Role -eq "Movement Engine" }
        ConstructionEngine = $results | Where-Object { $_.Role -eq "Construction Engine" }
        Templates        = $results | Where-Object { $_.Type -eq ".html" }
    }
}

# ------------------------------------------------------------
# Write output files
# ------------------------------------------------------------
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $scanFile -Encoding UTF8
$architecture | ConvertTo-Json -Depth 10 | Out-File -FilePath $archFile -Encoding UTF8

Write-Host "Deep project analysis complete."
Write-Host "File 1: $scanFile"
Write-Host "File 2: $archFile"
