# WheelsEye Frontend Plugin Marketplace

Internal Claude AI plugin marketplace for the WheelsEye frontend development team.

## For Team Members — One-time Setup (2 minutes)

### Step 1: Install Claude Desktop
Download from [claude.ai/download](https://claude.ai/download) and sign in.

### Step 2: Add This Marketplace
Open Claude Desktop → Settings → Plugins → Add Marketplace → paste this URL:
```
https://github.com/WeyeTech/foapp-front-warrior-marketplace
```
(Or whatever your internal Git URL is)

### Step 3: Install the Plugin
After adding the marketplace, you'll see **FOAPPFrontWarrior** in the plugin list. Click **Install**.

### Step 4: Connect Your Tools
Go to Settings → Connectors and connect:
- **Figma** — for design specs
- **Atlassian Rovo** — for Confluence PRDs and Jira

### Step 5: Start Using
1. Open a new Cowork session
2. Add your `OperatorAppFlutter` and `OperatorApp` folders
3. The plugin will automatically show you available commands
4. Type `/sync` to initialize

**That's it! The plugin will guide you from here.**

---

## For Maintainers — How to Update the Plugin

### Updating plugin code:
```bash
# Clone the marketplace repo
git clone https://github.com/WeyeTech/foapp-front-warrior-marketplace.git
cd foapp-front-warrior-marketplace

# Edit any skill file
vim plugins/foapp-front-warrior/skills/build-feature/SKILL.md

# Bump version in plugin.json
vim plugins/foapp-front-warrior/.claude-plugin/plugin.json

# Also bump in marketplace.json
vim marketplace.json

# Push
git add -A && git commit -m "update: added new validation rule for bridge code"
git push origin main
```

### Auto-sync:
If your team enabled auto-sync when adding the marketplace, changes will propagate automatically. Otherwise, team members can manually refresh from Settings → Plugins.

### Adding a new skill:
```bash
mkdir -p plugins/foapp-front-warrior/skills/new-skill-name
# Create SKILL.md following the existing skill format
vim plugins/foapp-front-warrior/skills/new-skill-name/SKILL.md
# Update plugin.json and marketplace.json
git add -A && git commit -m "feat: added /new-skill-name skill"
git push origin main
```

### File structure:
```
foapp-front-warrior-marketplace/
├── marketplace.json                          ← Plugin registry
├── README.md                                 ← This file
└── plugins/
    └── foapp-front-warrior/
        ├── .claude-plugin/
        │   └── plugin.json                   ← Plugin manifest (name, version)
        ├── README.md                         ← Plugin documentation
        ├── context/
        │   ├── project-context.md            ← Auto-loaded project rules
        │   └── welcome.md                    ← Self-onboarding welcome message
        ├── hooks/
        │   └── hooks.json                    ← SessionStart hook
        └── skills/
            ├── sync/SKILL.md                 ← /sync — scan repos, update knowledge
            ├── build-feature/SKILL.md        ← /build-feature — PRD → code
            ├── check-code/SKILL.md           ← /check-code — convention validator
            ├── explain-flow/SKILL.md         ← /explain-flow — feature flow tracer
            └── find-widget/SKILL.md          ← /find-widget — widget discovery
```

## Versioning

| Version | Date | Changes |
|---------|------|---------|
| 0.2.0 | May 2026 | Dual-repo support (Android + Flutter), MethodChannel bridge mapping, migration tracker, Android convention validation |
| 0.1.0 | May 2026 | Initial release — Flutter-only support |
