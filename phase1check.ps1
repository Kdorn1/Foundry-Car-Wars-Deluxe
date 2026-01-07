<#
Compare two folder trees and print differences to the console for easy copy/paste.
Usage examples:
  .\compare-folders-print.ps1
  .\compare-folders-print.ps1 -CompareHashes
#>

param(
  [string]$Source      = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system",
  [string]$Destination = "C:\Users\Feindevil.SANCTUARY\Documents\Foundry\FoundryPortable\Data\systems\carwars-system",
  [switch]$CompareHashes
)

function Normalize-Path { param($p) (Resolve-Path -Path $p -ErrorAction Stop).ProviderPath }

try { $Source = Normalize-Path $Source } catch { Write-Error "Source not found: $Source"; exit 2 }
try { $Destination = Normalize-Path $Destination } catch { Write-Error "Destination not found: $Destination"; exit 2 }

Write-Host "Comparing:" -ForegroundColor Cyan
Write-Host "  Source:      $Source"
Write-Host "  Destination: $Destination"
Write-Host ""

$srcFiles = Get-ChildItem -Path $Source -Recurse -File | ForEach-Object {
  [PSCustomObject]@{ RelPath = $_.FullName.Substring($Source.Length).TrimStart('\','/'); FullPath = $_.FullName; Length = $_.Length; Time = $_.LastWriteTime }
}
$dstFiles = Get-ChildItem -Path $Destination -Recurse -File | ForEach-Object {
  [PSCustomObject]@{ RelPath = $_.FullName.Substring($Destination.Length).TrimStart('\','/'); FullPath = $_.FullName; Length = $_.Length; Time = $_.LastWriteTime }
}

$srcIndex = @{}; foreach ($f in $srcFiles) { $srcIndex[$f.RelPath] = $f }
$dstIndex = @{}; foreach ($f in $dstFiles) { $dstIndex[$f.RelPath] = $f }

$onlyInSource = New-Object System.Collections.Generic.List[object]
$onlyInDest   = New-Object System.Collections.Generic.List[object]
$differing     = New-Object System.Collections.Generic.List[object]

$allRel = ($srcIndex.Keys + $dstIndex.Keys) | Sort-Object -Unique
foreach ($rel in $allRel) {
  $inSrc = $srcIndex.ContainsKey($rel)
  $inDst = $dstIndex.ContainsKey($rel)
  if ($inSrc -and -not $inDst) { $onlyInSource.Add($rel); continue }
  if ($inDst -and -not $inSrc) { $onlyInDest.Add($rel); continue }

  $s = $srcIndex[$rel]; $d = $dstIndex[$rel]
  $sizeDiff = ($s.Length -ne $d.Length)
  $timeDiff = ([math]::Abs((New-TimeSpan -Start $s.Time -End $d.Time).TotalSeconds) -gt 2)
  if ($sizeDiff -or $timeDiff) {
    $hashMatch = $null
    if ($CompareHashes) {
      try {
        $sHash = (Get-FileHash -Path $s.FullPath -Algorithm SHA256).Hash
        $dHash = (Get-FileHash -Path $d.FullPath -Algorithm SHA256).Hash
        $hashMatch = ($sHash -eq $dHash)
      } catch { $hashMatch = "HASH-ERROR" }
    }
    $differing.Add([PSCustomObject]@{
      Path = $rel
      SourceSize = $s.Length
      DestSize = $d.Length
      SourceTime = $s.Time
      DestTime = $d.Time
      HashMatch = $hashMatch
    })
  }
}

# Print results in three copy-friendly blocks
Write-Host ""
Write-Host "===== OnlyInSource ($($onlyInSource.Count)) =====" -ForegroundColor Yellow
if ($onlyInSource.Count -eq 0) { Write-Host "(none)" } else { $onlyInSource | ForEach-Object { Write-Host $_ } }

Write-Host ""
Write-Host "===== OnlyInDestination ($($onlyInDest.Count)) =====" -ForegroundColor Yellow
if ($onlyInDest.Count -eq 0) { Write-Host "(none)" } else { $onlyInDest | ForEach-Object { Write-Host $_ } }

Write-Host ""
Write-Host "===== Differing ($($differing.Count)) =====" -ForegroundColor Yellow
if ($differing.Count -eq 0) { Write-Host "(none)" } else {
  foreach ($row in $differing) {
    $line = "{0} | src:{1} dst:{2} | srcTime:{3} dstTime:{4}" -f $row.Path, $row.SourceSize, $row.DestSize, $row.SourceTime, $row.DestTime
    if ($CompareHashes) { $line += " | HashMatch:$($row.HashMatch)" }
    Write-Host $line
  }
}

Write-Host ""
Write-Host "Done. Copy the three blocks above and paste them here." -ForegroundColor Green
