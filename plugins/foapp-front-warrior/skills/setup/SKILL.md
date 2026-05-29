---
name: setup
description: >
  One-time setup for FOAPPFrontWarrior plugin. Auto-detects Flutter SDK, Android SDK, and project
  paths. Runs automatically on first session or when dev says "setup", "configure plugin",
  "set paths", "reconfigure". Also triggered when any build tool fails with "not configured" error.
metadata:
  version: "1.0.0"
---

# Plugin Setup — One-Time Configuration

This skill configures the Local Build MCP Server so the AI can build, analyze, and fix compile errors automatically on the developer's machine.

---

## When to trigger

Run this setup automatically when ANY of these conditions are true:
1. **First session** — No config exists at `~/.foapp-build-server/config.json`
2. **Build tool fails** — Any `flutter_analyze`, `gradle_build`, or `run_terminal` call returns "not configured"
3. **Dev asks** — "setup", "configure plugin", "set paths", "reconfigure", "setup karo"

---

## Setup Flow

### Step 1 — Check if MCP server is running

Call `detect_sdks` tool from the `foapp-build` MCP server.

**If MCP responds:** Server is running. Go to Step 2.

**If MCP does NOT respond (server not installed):**
Tell the developer:
```
The Local Build Server needs a one-time install. Please run this in your terminal:

  cd <plugin_mcp_directory>/mcp
  npm install

Then restart Claude Desktop. I'll complete the setup after restart.
```

Wait for the developer to confirm. After restart, retry `detect_sdks`.

### Step 2 — Auto-detect paths

Call `detect_sdks`. It returns:
```json
{
  "flutter_sdk": "/Users/dev/flutter" or "NOT FOUND",
  "android_sdk": "/Users/dev/Android/Sdk" or "NOT FOUND",
  "flutter_project": "/Users/dev/OperatorAppFlutter" or "NOT FOUND",
  "android_project": "/Users/dev/OperatorApp" or "NOT FOUND",
  "flutter_version": "...",
  "java_version": "...",
  "config_saved": true/false
}
```

### Step 3 — Confirm with developer

Present the detected paths:
```
Setup detected the following paths on your machine:

  Flutter SDK:     /Users/dev/flutter (v3.22.0)
  Android SDK:     /Users/dev/Android/Sdk
  Flutter Project: /Users/dev/OperatorAppFlutter
  Android Project: /Users/dev/OperatorApp
  Java:            OpenJDK 17.0.10

Are these correct? Or do you want to change any path?
```

**If all found and dev confirms:** Setup complete. Call `save_config` with the paths.

**If any path is "NOT FOUND":** Ask the developer:
```
I couldn't auto-detect your [Flutter SDK / Android project / etc.] path.
Please provide the full path (e.g., /Users/yourname/flutter):
```

**If dev wants to change a path:** Accept the new path, call `save_config` with updated values.

### Step 4 — Verify setup works

Run a quick verification:
```
1. Call flutter_analyze(paths: []) — should return "Analyzing..." output
2. Call run_terminal(command: "flutter --version") — should return Flutter version
3. If Android project exists: Call run_terminal(command: "./gradlew --version", cwd: "android")
```

**If all pass:**
```
Setup complete! Here's what I can now do automatically:

  ✓ Run flutter analyze to catch compile errors
  ✓ Run gradle build to verify Android/Kotlin code
  ✓ Run dart format to fix formatting
  ✓ Run any terminal command you need
  ✓ Auto-fix compile errors before presenting code to you

You'll see a permission prompt each time I run a command — just click Allow.
This setup is saved and won't be needed again.
```

**If any fail:** Show the error and ask developer to fix (wrong path, SDK not installed, etc.)

### Step 5 — Save to memory (if memory system available)

Save a reference memory:
```
Build MCP server configured. Flutter SDK: <path>, Android SDK: <path>,
Flutter project: <path>, Android project: <path>.
Config stored at ~/.foapp-build-server/config.json
```

---

## Reconfigure

If the developer says "reconfigure" or "change paths":
1. Call `detect_sdks` again (re-detects)
2. Show current saved config
3. Ask which paths to change
4. Call `save_config` with new values
5. Re-verify

---

## Important Notes

- NEVER skip setup if config is missing — setup is required for build verification to work
- NEVER guess SDK paths — always auto-detect or ask the developer
- The config persists across sessions at `~/.foapp-build-server/config.json`
- If dev moves SDK or project to a new location, they need to run `/setup` again
- Setup needs to happen only ONCE per developer machine
