$root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system"

Get-ChildItem -Path $root -Recurse -Directory |
    Where-Object { $_.FullName -like "*carwars*" } |
    Select-Object FullName
