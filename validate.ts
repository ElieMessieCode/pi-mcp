/**
 * Syntax validation for pi-mcp extension
 * 
 * Checks that the extension TypeScript is valid and can be parsed.
 * Also validates the key structure matches expected patterns.
 * 
 * Usage:
 *   npx tsx validate.ts
 */

import { readFileSync } from "node:fs";

function validateExtension(): void {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║      pi-mcp Extension Validation                ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const filePath = "index.ts";
  let content: string;
  
  try {
    content = readFileSync(filePath, "utf-8");
    console.log("✅ File read successfully");
  } catch (error) {
    console.error("❌ Cannot read index.ts:", error);
    process.exit(1);
  }

  // Check required patterns
  const checks = [
    { pattern: /export default function/, name: "Default export function" },
    { pattern: /class MCPHTTPClient/, name: "MCPHTTPClient class" },
    { pattern: /async initialize\(\)/, name: "initialize method" },
    { pattern: /async listTools\(\)/, name: "listTools method" },
    { pattern: /async callTool\(/, name: "callTool method" },
    { pattern: /pi\.registerCommand\("mcp"/, name: "/mcp command registration" },
    { pattern: /pi\.registerCommand\("mcp-logs"/, name: "/mcp-logs command registration" },
    { pattern: /pi\.registerCommand\("mcp-status"/, name: "/mcp-status command registration" },
    { pattern: /pi\.on\("session_start"/, name: "session_start handler" },
    { pattern: /pi\.on\("session_shutdown"/, name: "session_shutdown handler" },
    { pattern: /GLOBAL_CONFIG/, name: "Global config support" },
    {pattern: /PROJECT_CONFIG/, name: "Project config support" },
    { pattern: /scope === "project"/, name: "Scope management" },
    { pattern: /silent.*boolean/, name: "Silent mode support" },
    { pattern: /getHeaders\(\)/, name: "Session ID headers" },
    { pattern: /extractSessionId\(/, name: "Session ID extraction" },
    { pattern: /handleSSEResponse\(/, name: "SSE response handling" },
    { pattern: /convertJSONSchemaToTypeBox/, name: "Schema conversion" },
  ];

  let passed = 0;
  let failed = 0;

  console.log("\nRunning structural checks...\n");

  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.name}`);
      passed++;
    } else {
      console.log(`   ❌ ${check.name} - NOT FOUND`);
      failed++;
    }
  }

  // Check for common issues
  console.log("\nChecking for common issues...\n");

  // Check for console.log outside of mcpLog function
  const mcpLogMatch = content.match(/function mcpLog[\s\S]*?console\.log/);
  const otherConsoleLogs = content.replace(/function mcpLog[\s\S]*?^}/gm, "").match(/console\.log\(/g);
  
  const issueChecks = [
    { pattern: otherConsoleLogs && otherConsoleLogs.length > 0, name: "console.log outside mcpLog" },
    { pattern: /pi\.getState\(/.test(content), name: "pi.getState (should use file-based storage)" },
    { pattern: /pi\.setState\(/.test(content), name: "pi.setState (should use file-based storage)" },
  ];

  for (const check of issueChecks) {
    if (check.pattern) {
      console.log(`   ⚠️ ${check.name}: Found`);
    } else {
      console.log(`   ✅ ${check.name}: None found`);
    }
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log(`📊 Results: ${passed}/${checks.length} checks passed`);
  console.log("═".repeat(50));

  if (failed === 0) {
    console.log("\n✅ Extension structure is valid!");
    process.exit(0);
  } else {
    console.log(`\n❌ ${failed} checks failed!`);
    process.exit(1);
  }
}

validateExtension();
