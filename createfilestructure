$root = "C:\Users\Feindevil.SANCTUARY\OneDrive\carwars-system\module\rules"

# Folder structure
$folders = @(
    "$root",
    "$root\loaders",
    "$root\apply"
)

# Files to create
$files = @(
    "$root\rule-engine.js",
    "$root\loaders\body-loader.js",
    "$root\loaders\chassis-loader.js",
    "$root\loaders\suspension-loader.js",
    "$root\loaders\engine-loader.js",
    "$root\loaders\gas-tank-loader.js",
    "$root\loaders\tires-loader.js",
    "$root\loaders\armor-loader.js",
    "$root\loaders\weapons-loader.js",
    "$root\loaders\accessories-loader.js",
    "$root\apply\apply-body.js",
    "$root\apply\apply-chassis.js",
    "$root\apply\apply-suspension.js",
    "$root\apply\apply-engine.js",
    "$root\apply\apply-gas-tank.js",
    "$root\apply\apply-tires.js",
    "$root\apply\apply-armor.js",
    "$root\apply\apply-weapons.js",
    "$root\apply\apply-accessories.js"
)

# Create folders if missing
foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
        Write-Host "Created folder: $folder"
    }
}

# Create files if missing
foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        "/* Auto-generated placeholder for $([System.IO.Path]::GetFileName($file)) */" | Out-File $file -Encoding utf8
        Write-Host "Created file: $file"
    }
}

