# FOAPPFrontWarrior

AI-powered frontend development assistant for the WheelsEye OperatorApp — a **hybrid Android (Kotlin) + Flutter** mobile application. Enforces coding conventions across both platforms, generates compliant code from PRDs and Figma designs, maps MethodChannel bridges, tracks migration progress, and keeps team knowledge current.

## What it does

This plugin gives Claude deep understanding of your **dual-repo hybrid monorepo**:

- **OperatorAppFlutter** — Flutter module (Melos monorepo with 15 apps, 5 shared packages)
- **OperatorApp** — Android host app (Kotlin, 344+ files, hosts Flutter via FlutterEngine)

It knows your widgets (Flutter + Android custom views), colors, text styles, navigation patterns, BLoC conventions, API structures, MethodChannel bridges, and migration status — so every line of generated code follows your team's rules on both platforms.

## 9 Skills

| Skill | What it does |
|-------|-------------|
| `/sync` | Scan BOTH repos and update the knowledge base — widgets, flows, APIs, design tokens, bridge map, migration tracker |
| `/build-feature` | Give a PRD + Figma link → get an impact analysis (both platforms) → approve iteratively → get production-ready code (Flutter + Android + bridge) |
| `/check-code` | Validate any code against conventions — Dart, Kotlin, AND cross-platform bridge consistency |
| `/explain-flow` | Understand how any feature works — screens, BLoCs, Activities, ViewModels, APIs, MethodChannel bridges |
| `/find-widget` | Search for existing widgets and design tokens in BOTH repos before creating new ones |
| `/fix-bug` | Fix bugs with minimal diff — scoped changes only, no refactoring, 6 bug categories (UI, State, API, Bridge, Navigation, Crash) |
| `/add-events` | Add analytics events from a sheet or requirements — generates EventManager, constants, locator registration, and places events in UI |
| `/optimize` | Post-work optimization report — widget rebuilds, memory, API, code duplication across Flutter + Android |
| `/upgrade` | Upgrade Android SDK, Flutter, Kotlin, Gradle, or packages — compatibility check, migration plan, rollback commands |

## Setup

1. Install this plugin in Claude Desktop / Cowork
2. Connect your Figma account (for design context)
3. Connect Atlassian Rovo (for Confluence PRDs and Jira tickets)
4. Mount your **OperatorAppFlutter** repo as a workspace folder
5. Mount your **OperatorApp** repo as a workspace folder (may be under StudioProjects/)
6. Run `/sync` to initialize the knowledge base for both repos

## Requirements

- **Figma connector** — for reading design specs
- **Atlassian Rovo connector** — for reading PRDs from Confluence
- **Local repo access** — BOTH OperatorAppFlutter AND OperatorApp mounted in workspace

No external APIs, databases, or cloud services needed. Everything runs locally.

## Workflow

```
1. Run /sync (once per sprint or after major merges — scans both repos)
2. Dev gives PRD + Figma link → runs /build-feature
3. Claude shows impact analysis (Flutter + Android + bridge changes) → dev reviews and adjusts
4. Dev approves → Claude generates code following all conventions (both platforms)
5. Auto-compliance check runs → violations auto-fixed (Dart + Kotlin + bridge consistency)
6. Dev reviews generated code → requests any changes
7. Run /add-events with analytics sheet → events placed at correct locations
8. Run /optimize → check for performance issues in generated code
9. Done — production-ready code following all team rules across both repos
```

## Architecture

```
Android (OperatorApp)          MethodChannel Bridge           Flutter (OperatorAppFlutter)
┌──────────────────┐     ┌──────────────────────────┐     ┌──────────────────────┐
│ Activities       │     │ COMMUNICATION_WITH_       │     │ Screens (views/)     │
│ Fragments        │────>│   NATIVE_APP              │────>│ BLoCs (bloc/)        │
│ ViewModels       │     │ COMMUNICATION_WITH_       │     │ API Services         │
│ Adapters         │<────│   ACTIVITY                │<────│ Repositories         │
│ FlutterAppManger │     │ FlutterActionProviders    │     │ NativeActionInvokers │
└──────────────────┘     └──────────────────────────┘     └──────────────────────┘
```
