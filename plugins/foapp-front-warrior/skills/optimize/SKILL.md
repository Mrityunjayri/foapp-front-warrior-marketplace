---
name: optimize
description: >
  Optimize code after changes are made. Use when the user says "optimize", "optimize this",
  "check for optimizations", "can this be improved", "performance check", or after completing
  a feature/bug fix wants to ensure the code is optimal. Analyzes current session's changes
  and suggests codebase-wide optimizations related to those changes.
metadata:
  version: "0.1.0"
---

## Input
- "optimize" (analyzes all changes in current session)
- OR specific file/directory path
- OR "optimize the feature I just built"

## Optimization Categories

### Flutter Optimizations

1. **Widget rebuild optimization**
   - Unnecessary rebuilds in BlocBuilder (missing buildWhen)
   - const constructors missing on stateless widgets
   - Expensive operations inside build()
   - Using BlocBuilder when BlocSelector would suffice

2. **State management optimization**
   - Overly broad state emissions (emitting full state when partial would do)
   - Missing Equatable props (causes unnecessary rebuilds)
   - BLoC doing too much (should split into multiple BLoCs)

3. **Memory optimization**
   - Streams not closed/disposed
   - Controllers not disposed
   - Large lists without pagination
   - Images not cached/sized properly

4. **API optimization**
   - Duplicate API calls across screens
   - Missing error handling in repository
   - Not using DataState properly
   - Missing loading/error states

5. **Code duplication**
   - Same widget built in multiple places → extract to shared widget
   - Same API call pattern repeated → extract to usecase
   - Same color/style used with copyWith everywhere → add to WETheme/WEColors

### Android/Kotlin Optimizations

1. **ViewModel optimization** — LiveData vs StateFlow, unnecessary observers
2. **Memory leaks** — Activity/Fragment context held in ViewModel, uncancelled coroutines
3. **Bridge optimization** — Redundant MethodChannel calls, large data payloads
4. **DI optimization** — Singleton vs Factory scope, circular dependencies

### Cross-platform Optimizations

1. **Duplicate logic** — Same business logic in both Android and Flutter
2. **Bridge efficiency** — Batching multiple bridge calls into one
3. **Data consistency** — Same model defined differently on both sides

## Process

1. **Identify changed files** — git diff or session context
2. **Analyze each file** — check against optimization categories above
3. **Check ripple effects** — do changes affect other files that could benefit from optimization
4. **Prioritize** — Critical (performance/crash risk), Important (maintainability), Nice-to-have (code quality)
5. **Present findings** — show each optimization with before/after code
6. **Apply on approval** — only make changes user approves

## Rules

- NEVER optimize code unrelated to current session's changes
- Show before/after for every change
- Respect all project conventions (don't "optimize" by removing convention compliance)
- Don't change public APIs without flagging it as breaking
- Performance optimizations > code style optimizations
- Always explain WHY an optimization matters (not just what to change)

## Output format

```
## Optimization Report

### 🔴 Critical (Performance/Crash)
1. **file.dart:45** — BlocBuilder rebuilds entire list on every state change
   → Add `buildWhen: (prev, curr) => prev.items != curr.items`
   Impact: Reduces unnecessary widget rebuilds by ~80%

### 🟡 Important (Maintainability)
2. **bloc.dart:23** — Stream subscription not disposed
   → Add `await subscription.cancel()` in close()

### 🟢 Nice-to-have (Code Quality)
3. **widget.dart:67** — Same card widget duplicated in 3 places
   → Extract to shared `MyFeatureCard` widget
```
