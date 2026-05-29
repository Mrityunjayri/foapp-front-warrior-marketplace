#!/usr/bin/env node

/**
 * FOAPPFrontWarrior Local Build MCP Server
 *
 * Runs on the developer's local machine. Provides build/analyze tools
 * that Cowork Desktop calls via MCP protocol.
 *
 * Tools:
 *   - detect_sdks        : Auto-detect Flutter & Android SDK paths
 *   - flutter_analyze     : Run flutter analyze on specified files/dirs
 *   - flutter_pub_get     : Run flutter pub get in project
 *   - gradle_build        : Run gradle compileDebugKotlin
 *   - dart_format         : Run dart format on files
 *   - run_build_command   : Run any allowed build command
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { execSync, exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// --- Config ---
const CONFIG_DIR = path.join(os.homedir(), ".foapp-build-server");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// --- SDK Detection ---
function detectFlutterSDK() {
  const paths = [
    // Common Flutter install locations
    process.env.FLUTTER_ROOT,
    path.join(os.homedir(), "flutter"),
    path.join(os.homedir(), "development", "flutter"),
    path.join(os.homedir(), "dev", "flutter"),
    path.join(os.homedir(), "fvm", "default"),
    "/usr/local/flutter",
    "/opt/flutter",
    // macOS
    path.join(os.homedir(), "Library", "flutter"),
  ].filter(Boolean);

  // Try which/where first
  try {
    const flutterPath = execSync("which flutter 2>/dev/null || where flutter 2>nul", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    if (flutterPath) {
      // Resolve symlinks and get SDK root
      const resolved = fs.realpathSync(flutterPath);
      const sdkRoot = path.dirname(path.dirname(resolved));
      if (fs.existsSync(path.join(sdkRoot, "bin", "flutter"))) return sdkRoot;
    }
  } catch {}

  for (const p of paths) {
    if (p && fs.existsSync(path.join(p, "bin", "flutter"))) return p;
  }
  return null;
}

function detectAndroidSDK() {
  const paths = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(os.homedir(), "Android", "Sdk"),
    path.join(os.homedir(), "Library", "Android", "sdk"),
    path.join(os.homedir(), "AppData", "Local", "Android", "Sdk"),
    "/usr/local/android-sdk",
  ].filter(Boolean);

  for (const p of paths) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function detectProjectPaths() {
  const home = os.homedir();
  const candidates = [
    path.join(home, "OperatorAppFlutter"),
    path.join(home, "StudioProjects", "OperatorAppFlutter"),
    path.join(home, "Projects", "OperatorAppFlutter"),
    path.join(home, "work", "OperatorAppFlutter"),
  ];
  const flutterProject = candidates.find((p) =>
    fs.existsSync(path.join(p, "pubspec.yaml"))
  );

  const androidCandidates = [
    path.join(home, "OperatorApp"),
    path.join(home, "StudioProjects", "OperatorApp"),
    path.join(home, "Projects", "OperatorApp"),
    path.join(home, "work", "OperatorApp"),
  ];
  const androidProject = androidCandidates.find((p) =>
    fs.existsSync(path.join(p, "build.gradle")) ||
    fs.existsSync(path.join(p, "build.gradle.kts"))
  );

  return { flutterProject, androidProject };
}

// --- Command Runner ---
function runCommand(cmd, cwd, timeoutMs = 120000) {
  try {
    const output = execSync(cmd, {
      cwd,
      encoding: "utf-8",
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      env: { ...process.env },
    });
    return { success: true, output: output.trim() };
  } catch (err) {
    const output = (err.stdout || "") + "\n" + (err.stderr || "");
    return { success: false, output: output.trim(), exitCode: err.status };
  }
}

// --- Dangerous commands blocklist (NEVER allow these) ---
const BLOCKED_PATTERNS = [
  /\brm\s+-rf\s+[\/~]/, // rm -rf / or ~
  /\brm\s+-rf\s+\*/, // rm -rf *
  /\bmkfs\b/, // format disk
  /\bdd\s+if=/, // disk destroy
  /\bcurl\b.*\|\s*sh/, // pipe curl to shell
  /\bwget\b.*\|\s*sh/, // pipe wget to shell
  /\bsudo\b/, // sudo commands
  /\bchmod\s+777\s+\//, // chmod 777 on root
  /\bkill\s+-9\s+1\b/, // kill init
  /\breboot\b/, // reboot
  /\bshutdown\b/, // shutdown
  /\bnpm\s+publish\b/, // accidental publish
  /\bgit\s+push\s+.*--force\s+.*main/, // force push to main
  /\bdrop\s+database\b/i, // SQL drop
  /\bpasswd\b/, // change password
];

function isCommandBlocked(cmd) {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(cmd));
}

// --- MCP Server ---
const server = new Server(
  { name: "foapp-build-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "detect_sdks",
      description:
        "Auto-detect Flutter SDK, Android SDK, and project paths on this machine. Run this first during setup.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "save_config",
      description:
        "Save SDK paths and project paths to config. Run after detect_sdks if paths need to be overridden.",
      inputSchema: {
        type: "object",
        properties: {
          flutter_sdk: { type: "string", description: "Path to Flutter SDK root" },
          android_sdk: { type: "string", description: "Path to Android SDK root" },
          flutter_project: { type: "string", description: "Path to OperatorAppFlutter root" },
          android_project: { type: "string", description: "Path to OperatorApp root" },
        },
      },
    },
    {
      name: "flutter_analyze",
      description:
        "Run 'flutter analyze' on the Flutter project or specific files. Returns all compile errors and warnings. Use after code generation to verify zero errors.",
      inputSchema: {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: { type: "string" },
            description: "Specific file or directory paths to analyze (relative to flutter project root). If empty, analyzes entire project.",
          },
        },
      },
    },
    {
      name: "dart_format",
      description: "Run 'dart format' on specified files to fix formatting.",
      inputSchema: {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: { type: "string" },
            description: "File paths to format (relative to flutter project root)",
          },
        },
        required: ["paths"],
      },
    },
    {
      name: "flutter_pub_get",
      description: "Run 'flutter pub get' to resolve dependencies. Use after adding new packages.",
      inputSchema: {
        type: "object",
        properties: {
          app_path: {
            type: "string",
            description: "Path to specific app (e.g., 'apps/gps_route'). If empty, runs in project root.",
          },
        },
      },
    },
    {
      name: "gradle_build",
      description:
        "Run Gradle build command on the Android project. Use to verify Kotlin/Android code compiles.",
      inputSchema: {
        type: "object",
        properties: {
          task: {
            type: "string",
            description: "Gradle task to run. Default: compileDebugKotlin",
            enum: ["compileDebugKotlin", "assembleDebug", "lint"],
          },
        },
      },
    },
    {
      name: "run_terminal",
      description:
        "Run ANY terminal command on the developer's local machine. Dangerous commands (rm -rf /, sudo, reboot, etc.) are blocked for safety. User will see a permission prompt before execution. Use this for: git commands, file operations, custom scripts, package installs, or any command the AI needs to run.",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "The terminal command to run" },
          cwd: {
            type: "string",
            description: "Working directory. Use 'flutter' for OperatorAppFlutter, 'android' for OperatorApp, or an absolute path. Defaults to flutter project.",
          },
          timeout_seconds: {
            type: "number",
            description: "Timeout in seconds. Default: 120. Max: 600.",
          },
        },
        required: ["command"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const config = loadConfig();

  switch (name) {
    case "detect_sdks": {
      const flutterSDK = detectFlutterSDK();
      const androidSDK = detectAndroidSDK();
      const { flutterProject, androidProject } = detectProjectPaths();

      const result = {
        flutter_sdk: flutterSDK || "NOT FOUND",
        android_sdk: androidSDK || "NOT FOUND",
        flutter_project: flutterProject || "NOT FOUND",
        android_project: androidProject || "NOT FOUND",
        flutter_version: null,
        java_version: null,
      };

      if (flutterSDK) {
        try {
          result.flutter_version = execSync(
            `${path.join(flutterSDK, "bin", "flutter")} --version --machine`,
            { encoding: "utf-8", timeout: 15000 }
          ).trim();
        } catch {}
      }

      try {
        result.java_version = execSync("java -version 2>&1", {
          encoding: "utf-8",
          timeout: 5000,
        }).trim();
      } catch {}

      // Auto-save if all found
      if (flutterSDK && flutterProject) {
        saveConfig({
          flutter_sdk: flutterSDK,
          android_sdk: androidSDK,
          flutter_project: flutterProject,
          android_project: androidProject,
        });
        result.config_saved = true;
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "save_config": {
      const newConfig = { ...config, ...args };
      saveConfig(newConfig);
      return {
        content: [{ type: "text", text: `Config saved to ${CONFIG_FILE}\n${JSON.stringify(newConfig, null, 2)}` }],
      };
    }

    case "flutter_analyze": {
      const projectPath = config.flutter_project;
      if (!projectPath) {
        return {
          content: [{ type: "text", text: "ERROR: Flutter project path not configured. Run detect_sdks first." }],
          isError: true,
        };
      }

      const flutterBin = config.flutter_sdk
        ? path.join(config.flutter_sdk, "bin", "flutter")
        : "flutter";

      const targetPaths = args.paths && args.paths.length > 0
        ? args.paths.join(" ")
        : ".";

      const result = runCommand(
        `${flutterBin} analyze ${targetPaths} --no-pub`,
        projectPath,
        180000 // 3 min timeout
      );

      return {
        content: [{
          type: "text",
          text: `## Flutter Analyze Result\n\nExit code: ${result.exitCode || 0}\nSuccess: ${result.success}\n\n\`\`\`\n${result.output}\n\`\`\``,
        }],
      };
    }

    case "dart_format": {
      const projectPath = config.flutter_project;
      if (!projectPath) {
        return {
          content: [{ type: "text", text: "ERROR: Flutter project path not configured." }],
          isError: true,
        };
      }

      const dartBin = config.flutter_sdk
        ? path.join(config.flutter_sdk, "bin", "dart")
        : "dart";

      const filePaths = args.paths.join(" ");
      const result = runCommand(`${dartBin} format ${filePaths}`, projectPath);

      return {
        content: [{ type: "text", text: `## Dart Format Result\n\n\`\`\`\n${result.output}\n\`\`\`` }],
      };
    }

    case "flutter_pub_get": {
      const projectPath = config.flutter_project;
      if (!projectPath) {
        return {
          content: [{ type: "text", text: "ERROR: Flutter project path not configured." }],
          isError: true,
        };
      }

      const flutterBin = config.flutter_sdk
        ? path.join(config.flutter_sdk, "bin", "flutter")
        : "flutter";

      const cwd = args.app_path
        ? path.join(projectPath, args.app_path)
        : projectPath;

      const result = runCommand(`${flutterBin} pub get`, cwd, 120000);

      return {
        content: [{ type: "text", text: `## Pub Get Result\n\n\`\`\`\n${result.output}\n\`\`\`` }],
      };
    }

    case "gradle_build": {
      const projectPath = config.android_project;
      if (!projectPath) {
        return {
          content: [{ type: "text", text: "ERROR: Android project path not configured." }],
          isError: true,
        };
      }

      const task = args.task || "compileDebugKotlin";
      const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
      const result = runCommand(`${gradlew} ${task}`, projectPath, 300000); // 5 min

      return {
        content: [{
          type: "text",
          text: `## Gradle Build Result\n\nTask: ${task}\nExit code: ${result.exitCode || 0}\nSuccess: ${result.success}\n\n\`\`\`\n${result.output}\n\`\`\``,
        }],
      };
    }

    case "run_terminal": {
      const cmd = args.command;

      // Safety: block dangerous commands
      if (isCommandBlocked(cmd)) {
        return {
          content: [{
            type: "text",
            text: `BLOCKED: This command is not allowed for safety reasons.\nCommand: ${cmd}\n\nBlocked patterns include: rm -rf /, sudo, reboot, shutdown, force push to main, drop database, etc.`,
          }],
          isError: true,
        };
      }

      // Resolve working directory
      let cwd;
      if (!args.cwd || args.cwd === "flutter") {
        cwd = config.flutter_project;
      } else if (args.cwd === "android") {
        cwd = config.android_project;
      } else {
        cwd = args.cwd; // absolute path
      }

      if (!cwd) {
        return {
          content: [{ type: "text", text: "ERROR: Working directory not configured. Run detect_sdks first." }],
          isError: true,
        };
      }

      // Validate cwd exists
      if (!fs.existsSync(cwd)) {
        return {
          content: [{ type: "text", text: `ERROR: Directory does not exist: ${cwd}` }],
          isError: true,
        };
      }

      const timeoutMs = Math.min((args.timeout_seconds || 120) * 1000, 600000); // max 10 min
      const result = runCommand(cmd, cwd, timeoutMs);

      return {
        content: [{
          type: "text",
          text: `## Terminal: ${cmd}\n\nDirectory: ${cwd}\nExit code: ${result.exitCode || 0}\nSuccess: ${result.success}\n\n\`\`\`\n${result.output}\n\`\`\``,
        }],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
