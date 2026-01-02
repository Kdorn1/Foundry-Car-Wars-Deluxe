Car Wars – Foundry VTT System (Conceptual Shell)

This repository contains the conceptual shell for a custom Car Wars system built for Foundry Virtual Tabletop. It establishes the full folder architecture, system metadata, actor/item types, and module stubs required to begin implementing the full Car Wars ruleset.

This shell does not include game logic, rule content, or copyrighted material. It is a structural foundation intended for personal use by the system owner, who owns all required Car Wars rulebooks and expansions.
✅ Overview

This project provides:

    A complete Foundry VTT system structure

    Minimal system.json and template.json

    Stubbed actor and item classes

    Stubbed construction, movement, and combat subsystems

    Basic HTML sheet templates

    Basic CSS styling

    Empty compendiums for future data import

It is the starting point for implementing:

    Vehicle construction

    Movement and maneuver automation

    Control rolls and hazards

    Weapons, armor, and equipment

    Arena play

    Expansion content via compendiums
    carwars-system/
│
├── system.json
├── template.json
├── README.md
│
├── module/
│   ├── carwars.js
│   ├── config.js
│   │
│   ├── actor/
│   │   ├── vehicle-actor.js
│   │   ├── driver-actor.js
│   │   └── actor-sheet.js
│   │
│   ├── item/
│   │   ├── weapon-item.js
│   │   ├── armor-item.js
│   │   ├── powerplant-item.js
│   │   ├── tire-item.js
│   │   ├── accessory-item.js
│   │   ├── suspension-item.js
│   │   └── item-sheet.js
│   │
│   ├── construction/
│   │   ├── chassis.js
│   │   ├── load-calculator.js
│   │   ├── derived-stats.js
│   │   ├── validation.js
│   │   └── armor-calculator.js
│   │
│   ├── movement/
│   │   ├── movement-engine.js
│   │   ├── phase-tracker.js
│   │   ├── maneuvers.js
│   │   ├── templates.js
│   │   └── hc-tracker.js
│   │
│   ├── rolls/
│   │   ├── control-rolls.js
│   │   └── hazard.js
│   │
│   └── ui/
│       ├── hud.js
│       └── helpers.js
│
├── templates/
│   ├── actor/
│   │   ├── vehicle-sheet.html
│   │   ├── driver-sheet.html
│   │   └── partials/
│   │       ├── movement-panel.html
│   │       ├── construction-panel.html
│   │       ├── armor-panel.html
│   │       ├── hc-tracker.html
│   │       ├── speed-controls.html
│   │       └── hazard-display.html
│   │
│   ├── item/
│   │   ├── weapon-sheet.html
│   │   ├── armor-sheet.html
│   │   ├── powerplant-sheet.html
│   │   ├── tire-sheet.html
│   │   ├── accessory-sheet.html
│   │   └── suspension-sheet.html
│   │
│   └── chat/
│       ├── control-roll-card.html
│       └── maneuver-card.html
│
├── styles/
│   ├── carwars.css
│   └── sheets.css
│
├── assets/
│   ├── icons/
│   ├── ui/
│   └── templates/
│
└── packs/
    ├── weapons.db
    ├── armor.db
    ├── powerplants.db
    ├── tires.db
    ├── accessories.db
    ├── suspensions.db
    ├── chassis.db
    ├── maneuvers.db
    └── vehicles.db
