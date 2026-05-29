#!/usr/bin/env node

/**
 * FOAPPFrontWarrior Local Build MCP Server — ZERO DEPENDENCIES
 *
 * Implements MCP protocol over stdio using pure Node.js.
 * No npm install needed — works immediately after plugin install.
 *
 * Tools:
 *   - detect_sdks        : Auto-detect Flutter & Android SDK paths
 *   - save_config         : Save SDK/project paths to config
 *   - flutter_analyze     : Run flutter analyze on specified files/dirs
 *   - flutter_pub_get     : Run flutter pub get in project
 *   - gradle_build        : Run gradle compileDebugKotlin
 *   - dart_format         : Run dart format on files
 *   - run_terminal        : Run any safe terminal command
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const readline = require("readline");

// ============================================================
// CONFIG
// ============================================================
const CONFIG_DIR = path.join(os.homedir(), ".foapp-build-server");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8")); } catch { return {}; }
}

function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// ============================================================
// SDK DETECTION
// ============================================================
function detectFlutterSDK() {
  try {
    const p = execSync("which flutter 2>/dev/null || where flutter 2>nul", {
      encoding: "utf-8", timeout: 5000
    }).trim();
    if (p) {
      const resolved = fs.realpathSync(p);
      const root = path.dirname(path.dirname(resolved));
      if (fs.existsSync(path.join(root, "bin", "flutter"))) return root;
    }
  } catch {}
  const candidates = [
    process.env.FLUTTER_ROOT,
    path.join(os.homedir(), "flutter"),
    path.join(os.homedir(), "development", "flutter"),
    path.join(os.homedir(), "fvm", "default"),
    "/usr/local/flutter",
    path.join(os.homedir(), "Library", "flutter"),
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(path.join(p, "bin", "flutter"))) return p;
  }
  return null;
}

function detectAndroidSDK() {
  const candidates = [
    process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT,
    path.join(os.homedir(), "Android", "Sdk"),
    path.join(os.homedir(), "Library", "Android", "sdk"),
    path.join(os.homedir(), "AppData", "Local", "Android", "Sdk"),
  ].filter(Boolean);
  for (const p of candidates) { if (fs.existsSync(p)) return p; }
  return null;
}

function detectProjectPaths() {
  const home = os.homedir();
  const flutterCandidates = [
    path.join(home, "OperatorAppFlutter"),
    path.join(home, "StudioProjects", "OperatorAppFlutter"),
    path.join(home, "Projects", "OperatorAppFlutter"),
    path.join(home, "work", "OperatorAppFlutter"),
  ];
  const androidCandidates = [
    path.join(home, "OperatorApp"),
    path.join(home, "StudioProjects", "OperatorApp"),
    path.join(home, "Projects", "OperatorApp"),
    path.join(home, "work", "OperatorApp"),
  ];
  return {
    flutterProject: flutterCandidates.find(p => fs.existsSync(path.join(p, "pubspec.yaml"))) || null,
    androidProject: androidCandidates.find(p =>
      fs.existsSync(path.join(p, "build.gradle")) || fs.existsSync(path.join(p, "build.gradle.kts"))
    ) || null,
  };
}

// ============================================================
// COMMAND RUNNER
// ============================================================
function runCommand(cmd, cwd, timeoutMs = 120000) {
  try {
    const output = execSync(cmd, {
      cwd, encoding: "utf-8", timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024, env: { ...process.env },
    });
    return { success: true, output: output.trim(), exitCode: 0 };
  } catch (err) {
    return {
      success: false,
      output: ((err.stdout || "") + "\n" + (err.stderr || "")).trim(),
      exitCode: err.status || 1,
    };
  }
}

// Safety blocklist
const BLOCKED = [
  /\brm\s+-rf\s+[\/~]/, /\brm\s+-rf\s+\*/, /\bmkfs\b/, /\bdd\s+if=/,
  /\bcurl\b.*\|\s*sh/, /\bwget\b.*\|\s*sh/, /\bsudo\b/,
  /\bchmod\s+777\s+\//, /\bkill\s+-9\s+1\b/, /\breboot\b/, /\bshutdown\b/,
  /\bnpm\s+publish\b/, /\bgit\s+push\s+.*--force\s+.*main/, /\bdrop\s+database\b/i,
];
function isBlocked(cmd) { return BLOCKED.some(p => p.test(cmd)); }

// ============================================================
// TOOL DEFINITIONS
// ============================================================
const TOOLS = [
  {
    name: "detect_sdks",
    description: "Auto-detect Flutter SDK, Android SDK, and project paths. Run first during setup.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "save_config",
    description: "Save SDK/project paths to config file.",
    inputSchema: {
      type: "object",
      properties: {
        flutter_sdk: { type: "string" }, android_sdk: { type: "string" },
        flutter_project: { type: "string" }, android_project: { type: "string" },
      },
    },
  },
  {
    name: "flutter_analyze",
    description: "Run flutter analyze. Returns compile errors/warnings. Use after code generation.",
    inputSchema: {
      type: "object",
      properties: {
        paths: { type: "array", items: { type: "string" }, description: "Paths relative to flutter project root. Empty = entire project." },
      },
    },
  },
  {
    name: "dart_format",
    description: "Run dart format on files.",
    inputSchema: {
      type: "object",
      properties: { paths: { type: "array", items: { type: "string" } } },
      required: ["paths"],
    },
  },
  {
    name: "flutter_pub_get",
    description: "Run flutter pub get to resolve dependencies.",
    inputSchema: {
      type: "object",
      properties: { app_path: { type: "string", description: "Relative app path e.g. apps/gps_route" } },
    },
  },
  {
    name: "gradle_build",
    description: "Run Gradle build on Android project.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", enum: ["compileDebugKotlin", "assembleDebug", "lint", "clean"] },
      },
    },
  },
  {
    name: "run_terminal",
    description: "Run ANY terminal command on dev machine. Dangerous commands blocked. User sees permission prompt.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Terminal command to run" },
        cwd: { type: "string", description: "'flutter', 'android', or absolute path. Default: flutter project." },
        timeout_seconds: { type: "number", description: "Timeout (default 120, max 600)" },
      },
      required: ["command"],
    },
  },
];

// ============================================================
// TOOL HANDLERS
// ============================================================
function handleTool(name, args) {
  const config = loadConfig();

  if (name === "detect_sdks") {
    const flutterSDK = detectFlutterSDK();
    const androidSDK = detectAndroidSDK();
    const { flutterProject, androidProject } = detectProjectPaths();
    const result = {
      flutter_sdk: flutterSDK || "NOT FOUND",
      android_sdk: androidSDK || "NOT FOUND",
      flutter_project: flutterProject || "NOT FOUND",
      android_project: androidProject || "NOT FOUND",
    };
    try { result.flutter_version = execSync(`${flutterSDK ? path.join(flutterSDK, "bin", "flutter") : "flutter"} --version`, { encoding: "utf-8", timeout: 15000 }).split("\n")[0]; } catch {}
    try { result.java_version = execSync("java -version 2>&1", { encoding: "utf-8", timeout: 5000 }).split("\n")[0]; } catch {}
    if (flutterSDK && flutterProject) {
      saveConfig({ flutter_sdk: flutterSDK, android_sdk: androidSDK, flutter_project: flutterProject, android_project: androidProject });
      result.config_saved = true;
    }
    return JSON.stringify(result, null, 2);
  }

  if (name === "save_config") {
    saveConfig({ ...config, ...args });
    return `Config saved to ${CONFIG_FILE}\n${JSON.stringify({ ...config, ...args }, null, 2)}`;
  }

  if (name === "flutter_analyze") {
    if (!config.flutter_project) return "ERROR: Flutter project not configured. Run detect_sdks first.";
    const bin = config.flutter_sdk ? path.join(config.flutter_sdk, "bin", "flutter") : "flutter";
    const targets = args.paths && args.paths.length ? args.paths.join(" ") : ".";
    const r = runCommand(`${bin} analyze ${targets} --no-pub`, config.flutter_project, 180000);
    return `## Flutter Analyze\nExit: ${r.exitCode} | Success: ${r.success}\n\n\`\`\`\n${r.output}\n\`\`\``;
  }

  if (name === "dart_format") {
    if (!config.flutter_project) return "ERROR: Flutter project not configured.";
    const bin = config.flutter_sdk ? path.join(config.flutter_sdk, "bin", "dart") : "dart";
    const r = runCommand(`${bin} format ${args.paths.join(" ")}`, config.flutter_project);
    return `## Dart Format\n\`\`\`\n${r.output}\n\`\`\``;
  }

  if (name === "flutter_pub_get") {
    if (!config.flutter_project) return "ERROR: Flutter project not configured.";
    const bin = config.flutter_sdk ? path.join(config.flutter_sdk, "bin", "flutter") : "flutter";
    const cwd = args.app_path ? path.join(config.flutter_project, args.app_path) : config.flutter_project;
    const r = runCommand(`${bin} pub get`, cwd, 120000);
    return `## Pub Get\n\`\`\`\n${r.output}\n\`\`\``;
  }

  if (name === "gradle_build") {
    if (!config.android_project) return "ERROR: Android project not configured.";
    const task = args.task || "compileDebugKotlin";
    const gw = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
    const r = runCommand(`${gw} ${task}`, config.android_project, 300000);
    return `## Gradle: ${task}\nExit: ${r.exitCode} | Success: ${r.success}\n\n\`\`\`\n${r.output}\n\`\`\``;
  }

  if (name === "run_terminal") {
    if (isBlocked(args.command)) return `BLOCKED: Dangerous command not allowed.\nCommand: ${args.command}`;
    let cwd;
    if (!args.cwd || args.cwd === "flutter") cwd = config.flutter_project;
    else if (args.cwd === "android") cwd = config.android_project;
    else cwd = args.cwd;
    if (!cwd || !fs.existsSync(cwd)) return `ERROR: Directory not found: ${cwd || "not configured"}. Run detect_sdks first.`;
    const timeout = Math.min((args.timeout_seconds || 120) * 1000, 600000);
    const r = runCommand(args.command, cwd, timeout);
    return `## Terminal: ${args.command}\nDir: ${cwd}\nExit: ${r.exitCode} | Success: ${r.success}\n\n\`\`\`\n${r.output}\n\`\`\``;
  }

  return `Unknown tool: ${name}`;
}

// ============================================================
// MCP PROTOCOL — Pure JSON-RPC over stdio (zero dependencies)
// ============================================================
let buffer = "";

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on("line", (line) => {
  buffer += line;
  try {
    const msg = JSON.parse(buffer);
    buffer = "";
    handleMessage(msg);
  } catch {
    // Incomplete JSON — wait for more lines
  }
});

function send(response) {
  const json = JSON.stringify(response);
  process.stdout.write(json + "\n");
}

function handleMessage(msg) {
  const { id, method, params } = msg;

  // Initialize
  if (method === "initialize") {
    send({
      jsonrpc: "2.0", id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "foapp-build-server", version: "1.0.0" },
      },
    });
    return;
  }

  // Initialized notification
  if (method === "notifications/initialized") return;

  // List tools
  if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
    return;
  }

  // Call tool
  if (method === "tools/call") {
    const toolName = params.name;
    const toolArgs = params.arguments || {};
    try {
      const result = handleTool(toolName, toolArgs);
      const isError = result.startsWith("ERROR:") || result.startsWith("BLOCKED:");
      send({
        jsonrpc: "2.0", id,
        result: {
          content: [{ type: "text", text: result }],
          isError,
        },
      });
    } catch (err) {
      send({
        jsonrpc: "2.0", id,
        result: {
          content: [{ type: "text", text: `Error executing ${toolName}: ${err.message}\n${err.stack}` }],
          isError: true,
        },
      });
    }
    return;
  }

  // Ping
  if (method === "ping") {
    send({ jsonrpc: "2.0", id, result: {} });
    return;
  }

  // Unknown method
  if (id) {
    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  }
}

// Keep process alive
process.stdin.resume();
process.stderr.write("foapp-build-server started (zero-dependency MCP)\n");
