/**
 * Standalone test script for MCP HTTP Client
 * 
 * Usage:
 *   npx tsx test-client.ts <url>
 *   npx tsx test-client.ts http://localhost:53559
 * 
 * Tests the MCP connection, initialization, and tool discovery
 * without requiring Pi agent.
 */

// Minimal MCP HTTP Client for testing
class MCPHTTPClient {
  private requestId = 0;
  private url: string;
  private headers: Record<string, string>;
  private pendingRequests: Map<string | number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = new Map();
  private sessionId: string | null = null;

  constructor(url: string, headers: Record<string, string> = {}) {
    this.url = url.replace(/\/$/, "");
    this.headers = {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      ...headers,
    };
  }

  private generateId(): number {
    return ++this.requestId;
  }

  private getHeaders(): Record<string, string> {
    const h = { ...this.headers };
    if (this.sessionId) {
      h["Mcp-Session-Id"] = this.sessionId;
    }
    return h;
  }

  private extractSessionId(response: Response): void {
    const sessionId = response.headers.get("mcp-session-id") 
      ?? response.headers.get("Mcp-Session-Id")
      ?? response.headers.get("MCP-SESSION-ID");
    if (sessionId) {
      this.sessionId = sessionId;
      console.log(`📝 Session ID captured: ${sessionId}`);
    }
  }

  private async sendRequest(method: string, params: unknown): Promise<any> {
    const id = this.generateId();
    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      this.doPost(request).catch((error) => {
        this.pendingRequests.delete(id);
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private async sendNotification(method: string, params: unknown): Promise<void> {
    const notification = {
      jsonrpc: "2.0",
      method,
      params,
    };
    await this.doPost(notification);
  }

  private async doPost(body: any): Promise<void> {
    const headers = this.getHeaders();
    const bodyStr = JSON.stringify(body);
    
    console.log(`\n📤 POST ${this.url}`);
    console.log(`   Method: ${body.method}`);
    if (body.id) console.log(`   ID: ${body.id}`);
    
    const response = await fetch(this.url, {
      method: "POST",
      headers,
      body: bodyStr,
    });

    this.extractSessionId(response);

    const contentType = response.headers.get("content-type") ?? "";
    
    if (contentType.includes("text/event-stream")) {
      await this.handleSSEResponse(response);
      return;
    }

    if (response.ok && contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      console.log(`📥 Response status: ${response.status}`);
      
      if ("id" in jsonResponse && this.pendingRequests.has(jsonResponse.id)) {
        this.pendingRequests.get(jsonResponse.id)?.resolve(jsonResponse);
        this.pendingRequests.delete(jsonResponse.id);
      }
    } else if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {}
      throw new Error(`HTTP error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`);
    }
  }

  private async handleSSEResponse(response: Response): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";
    let fullData = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data.trim()) {
              fullData += data;
              try {
                const parsed = JSON.parse(data);
                
                if ("id" in parsed && this.pendingRequests.has(parsed.id)) {
                  console.log(`📥 SSE Response received`);
                  this.pendingRequests.get(parsed.id)?.resolve(parsed);
                  this.pendingRequests.delete(parsed.id);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async initialize(): Promise<any> {
    console.log("\n🔌 Initializing MCP session...");
    const response = await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0",
      },
    });

    if (response.error) {
      throw new Error(`Initialize failed: ${response.error.message}`);
    }

    console.log("📨 Sending notifications/initialized...");
    await this.sendNotification("notifications/initialized", {});

    return response.result;
  }

  async listTools(): Promise<any[]> {
    console.log("\n🔧 Requesting tools/list...");
    const response = await this.sendRequest("tools/list", {});
    
    if (response.error) {
      throw new Error(`ListTools failed: ${response.error.message}`);
    }
    
    return response.result?.tools ?? [];
  }

  async listResources(): Promise<any[]> {
    console.log("\n📦 Requesting resources/list...");
    const response = await this.sendRequest("resources/list", {});
    
    if (response.error) {
      // Resources might not be supported
      console.log("   ⚠️ Resources not supported or error:", response.error.message);
      return [];
    }
    
    return response.result?.resources ?? [];
  }

  async listPrompts(): Promise<any[]> {
    console.log("\n💬 Requesting prompts/list...");
    const response = await this.sendRequest("prompts/list", {});
    
    if (response.error) {
      // Prompts might not be supported
      console.log("   ⚠️ Prompts not supported or error:", response.error.message);
      return [];
    }
    
    return response.result?.prompts ?? [];
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  async close(): Promise<void> {
    this.pendingRequests.forEach((pending) => {
      pending.reject(new Error("Client closed"));
    });
    this.pendingRequests.clear();
  }
}

// Test function
async function testMCPServer(url: string, headers: Record<string, string> = {}) {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║         MCP Server Test Client                  ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log(`\n🎯 Target: ${url}`);

  const client = new MCPHTTPClient(url, headers);

  try {
    // Step 1: Initialize
    console.log("\n" + "─".repeat(50));
    console.log("Step 1: Initialize");
    console.log("─".repeat(50));
    
    const initResult = await client.initialize();
    console.log("\n✅ Initialize successful!");
    console.log(`   Server: ${initResult.serverInfo.name}`);
    console.log(`   Version: ${initResult.serverInfo.version}`);
    console.log(`   Protocol: ${initResult.protocolVersion}`);
    console.log(`   Capabilities: ${Object.keys(initResult.capabilities).join(", ")}`);

    // Step 2: List Tools
    console.log("\n" + "─".repeat(50));
    console.log("Step 2: List Tools");
    console.log("─".repeat(50));
    
    const tools = await client.listTools();
    console.log(`\n✅ Found ${tools.length} tool(s)`);
    
    if (tools.length > 0) {
      console.log("\nAvailable tools:");
      for (const tool of tools) {
        console.log(`   🔧 ${tool.name}`);
        if (tool.description) {
          console.log(`      └─ ${tool.description}`);
        }
        if (tool.inputSchema?.properties) {
          const params = Object.keys(tool.inputSchema.properties);
          if (params.length > 0) {
            console.log(`      └─ Params: ${params.join(", ")}`);
          }
        }
      }
    }

    // Step 3: List Resources (optional)
    console.log("\n" + "─".repeat(50));
    console.log("Step 3: List Resources (optional)");
    console.log("─".repeat(50));
    
    const resources = await client.listResources();
    if (resources.length > 0) {
      console.log(`\n✅ Found ${resources.length} resource(s)`);
      for (const resource of resources) {
        console.log(`   📦 ${resource.name} (${resource.uri})`);
      }
    } else {
      console.log("\n   No resources available");
    }

    // Step 4: List Prompts (optional)
    console.log("\n" + "─".repeat(50));
    console.log("Step 4: List Prompts (optional)");
    console.log("─".repeat(50));
    
    const prompts = await client.listPrompts();
    if (prompts.length > 0) {
      console.log(`\n✅ Found ${prompts.length} prompt(s)`);
      for (const prompt of prompts) {
        console.log(`   💬 ${prompt.name}`);
        if (prompt.description) {
          console.log(`      └─ ${prompt.description}`);
        }
      }
    } else {
      console.log("\n   No prompts available");
    }

    // Summary
    console.log("\n" + "═".repeat(50));
    console.log("📊 SUMMARY");
    console.log("═".repeat(50));
    console.log(`   ✅ Server: ${initResult.serverInfo.name} v${initResult.serverInfo.version}`);
    console.log(`   ✅ Session: ${client.getSessionId()?.slice(0, 12)}...`);
    console.log(`   ✅ Tools: ${tools.length}`);
    console.log(`   📦 Resources: ${resources.length}`);
    console.log(`   💬 Prompts: ${prompts.length}`);
    console.log("\n🎉 All tests passed!");

    return { initResult, tools, resources, prompts };

  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    await client.close();
  }
}

// CLI
const args = process.argv.slice(2);
const url = args[0] || "http://localhost:53559";

// Parse optional headers (format: key=value)
const headers: Record<string, string> = {};
for (const arg of args.slice(1)) {
  if (arg.includes("=")) {
    const [key, ...valueParts] = arg.split("=");
    headers[key] = valueParts.join("=");
  }
}

testMCPServer(url, headers)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
