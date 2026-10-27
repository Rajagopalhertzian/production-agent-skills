#!/usr/bin/env node
"use strict";
/**
 * Production Agent Skills MCP Server
 *
 * Provides skills as MCP resources and tools for AI coding agents.
 * Supports both STDIO (local) and Streamable HTTP (remote) transports.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const http_1 = require("http");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const SKILLS_ROOT = path.resolve(process.env.SKILLS_PATH ||
    path.join(__dirname, "skills") ||
    path.join(__dirname, "..", "..", "skills"));
class SkillsMCPServer {
    server;
    skillsCache = new Map();
    referencesCache = new Map();
    constructor() {
        this.server = new index_js_1.Server({
            name: "production-agent-skills",
            version: "1.0.0",
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupHandlers();
    }
    async readDirRecursive(dir, ext = "") {
        const results = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    const subResults = await this.readDirRecursive(fullPath, ext);
                    for (const sub of subResults) {
                        results.push(path.join(entry.name, sub));
                    }
                }
                else if (!ext || entry.name.endsWith(ext)) {
                    results.push(entry.name);
                }
            }
        }
        catch {
            // Directory doesn't exist or other error
        }
        return results;
    }
    setupHandlers() {
        // List all skills as resources
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => {
            await this.loadAllSkills();
            const resources = [];
            for (const [skillName, skill] of this.skillsCache) {
                resources.push({
                    uri: `skill://${skillName}`,
                    name: skillName,
                    description: skill.metadata.description,
                    mimeType: "text/markdown",
                });
                const refs = this.referencesCache.get(skillName) || [];
                for (const ref of refs) {
                    const relPath = path.relative(path.join(SKILLS_ROOT, skillName), ref.path);
                    resources.push({
                        uri: `skill://${skillName}/references/${relPath}`,
                        name: `${skillName}/references/${relPath}`,
                        description: `Reference: ${ref.name}`,
                        mimeType: "text/markdown",
                    });
                }
                const examplesDir = path.join(SKILLS_ROOT, skillName, "examples");
                try {
                    const exampleFiles = await this.readDirRecursive(examplesDir, ".md");
                    for (const ex of exampleFiles) {
                        resources.push({
                            uri: `skill://${skillName}/examples/${ex}`,
                            name: `${skillName}/examples/${ex}`,
                            description: `Example: ${ex}`,
                            mimeType: "text/markdown",
                        });
                    }
                }
                catch {
                    // No examples dir
                }
            }
            return { resources };
        });
        // List resource templates for dynamic discovery
        this.server.setRequestHandler(types_js_1.ListResourceTemplatesRequestSchema, async () => {
            await this.loadAllSkills();
            const templates = [];
            for (const skillName of this.skillsCache.keys()) {
                templates.push({
                    uriTemplate: `skill://${skillName}`,
                    name: `Skill: ${skillName}`,
                    description: `Main skill file for ${skillName}`,
                    mimeType: "text/markdown",
                });
                templates.push({
                    uriTemplate: `skill://${skillName}/references/{path}`,
                    name: `References for ${skillName}`,
                    description: `Reference files for ${skillName}`,
                    mimeType: "text/markdown",
                });
                templates.push({
                    uriTemplate: `skill://${skillName}/examples/{path}`,
                    name: `Examples for ${skillName}`,
                    description: `Example files for ${skillName}`,
                    mimeType: "text/markdown",
                });
            }
            return { resourceTemplates: templates };
        });
        // Read a specific resource
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;
            if (!uri.startsWith("skill://")) {
                throw new Error(`Unknown URI scheme: ${uri}`);
            }
            const pathPart = uri.slice(8);
            const parts = pathPart.split("/");
            const skillName = parts[0];
            await this.loadAllSkills();
            if (parts.length === 1) {
                const skill = this.skillsCache.get(skillName);
                if (!skill)
                    throw new Error(`Skill not found: ${skillName}`);
                return {
                    contents: [{
                            uri,
                            mimeType: "text/markdown",
                            text: skill.content,
                        }],
                };
            }
            const subType = parts[1];
            const subPath = parts.slice(2).join("/");
            if (subType === "references") {
                const refs = this.referencesCache.get(skillName) || [];
                const ref = refs.find(r => {
                    const rel = path.relative(path.join(SKILLS_ROOT, skillName), r.path);
                    return rel === subPath;
                });
                if (!ref)
                    throw new Error(`Reference not found: ${subPath}`);
                return {
                    contents: [{
                            uri,
                            mimeType: "text/markdown",
                            text: ref.content,
                        }],
                };
            }
            if (subType === "examples") {
                const filePath = path.join(SKILLS_ROOT, skillName, "examples", subPath);
                const content = await fs.readFile(filePath, "utf-8");
                return {
                    contents: [{
                            uri,
                            mimeType: "text/markdown",
                            text: content,
                        }],
                };
            }
            throw new Error(`Unknown resource path: ${uri}`);
        });
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            await this.loadAllSkills();
            const tools = [];
            tools.push({
                name: "get_skill_guidance",
                description: "Get the full skill guidance for a specific skill to execute its workflow",
                inputSchema: {
                    type: "object",
                    properties: {
                        skill: {
                            type: "string",
                            description: "Skill name (e.g., 'verify-before-finish', 'repository-onboarding')",
                            enum: Array.from(this.skillsCache.keys()),
                        },
                        context: {
                            type: "object",
                            description: "Optional context for the skill execution",
                            properties: {
                                repository_path: { type: "string" },
                                task_description: { type: "string" },
                                target_files: { type: "array", items: { type: "string" } },
                            },
                        },
                    },
                    required: ["skill"],
                },
            });
            tools.push({
                name: "validate_skill",
                description: "Validate a skill's structure and completeness",
                inputSchema: {
                    type: "object",
                    properties: {
                        skill: {
                            type: "string",
                            description: "Skill name to validate",
                            enum: Array.from(this.skillsCache.keys()),
                        },
                    },
                    required: ["skill"],
                },
            });
            tools.push({
                name: "list_skills",
                description: "List all available skills with their descriptions and metadata",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            });
            tools.push({
                name: "search_skills",
                description: "Search skills by keyword in name or description",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query",
                        },
                    },
                    required: ["query"],
                },
            });
            return { tools };
        });
        // Handle tool calls
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case "list_skills":
                    return await this.handleListSkills();
                case "search_skills":
                    return await this.handleSearchSkills(args?.query);
                case "get_skill_guidance":
                    return await this.handleGetSkillGuidance(args?.skill, args?.context);
                case "validate_skill":
                    return await this.handleValidateSkill(args?.skill);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    async loadAllSkills() {
        if (this.skillsCache.size > 0)
            return;
        try {
            const skillDirs = await fs.readdir(SKILLS_ROOT, { withFileTypes: true });
            for (const dirent of skillDirs) {
                if (!dirent.isDirectory())
                    continue;
                const skillName = dirent.name;
                const skillDir = path.join(SKILLS_ROOT, skillName);
                const skillFile = path.join(skillDir, "SKILL.md");
                try {
                    const content = await fs.readFile(skillFile, "utf-8");
                    const metadata = this.parseFrontmatter(content);
                    if (!metadata) {
                        console.error(`Skill ${skillName} has invalid frontmatter`);
                        continue;
                    }
                    this.skillsCache.set(skillName, {
                        name: skillName,
                        path: skillFile,
                        content,
                        metadata,
                    });
                    // Load references
                    const refsDir = path.join(skillDir, "references");
                    const refs = [];
                    try {
                        const refFiles = await this.readDirRecursive(refsDir, ".md");
                        for (const refFile of refFiles) {
                            const refPath = path.join(refsDir, refFile);
                            const refContent = await fs.readFile(refPath, "utf-8");
                            const refMetadata = this.parseFrontmatter(refContent);
                            refs.push({
                                name: refFile,
                                path: refPath,
                                content: refContent,
                                metadata: refMetadata || { name: refFile, description: "", license: "", "allowed-tools": [], compatibility: [] },
                            });
                        }
                    }
                    catch {
                        // No references dir
                    }
                    this.referencesCache.set(skillName, refs);
                }
                catch (err) {
                    console.error(`Failed to load skill ${skillName}:`, err);
                }
            }
        }
        catch (err) {
            console.error("Failed to load skills:", err);
        }
    }
    parseFrontmatter(content) {
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (!match)
            return null;
        try {
            return yaml.parse(match[1]);
        }
        catch {
            return null;
        }
    }
    async handleListSkills() {
        await this.loadAllSkills();
        const skills = Array.from(this.skillsCache.values()).map(s => ({
            name: s.name,
            description: s.metadata.description,
            license: s.metadata.license,
            compatibility: s.metadata.compatibility,
            allowedTools: s.metadata["allowed-tools"],
            hasReferences: (this.referencesCache.get(s.name)?.length || 0) > 0,
        }));
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ skills }, null, 2),
                }],
        };
    }
    async handleSearchSkills(query) {
        await this.loadAllSkills();
        const lowerQuery = query.toLowerCase();
        const results = Array.from(this.skillsCache.values())
            .filter(s => s.name.toLowerCase().includes(lowerQuery) ||
            s.metadata.description.toLowerCase().includes(lowerQuery))
            .map(s => ({
            name: s.name,
            description: s.metadata.description,
            relevance: s.name.toLowerCase().includes(lowerQuery) ? "high" : "medium",
        }));
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ query, results, count: results.length }, null, 2),
                }],
        };
    }
    async handleGetSkillGuidance(skillName, context) {
        await this.loadAllSkills();
        const skill = this.skillsCache.get(skillName);
        if (!skill) {
            throw new Error(`Skill not found: ${skillName}. Available: ${Array.from(this.skillsCache.keys()).join(", ")}`);
        }
        let guidance = `# Skill: ${skillName}\n\n`;
        guidance += `## Description\n${skill.metadata.description}\n\n`;
        guidance += `## Full Skill Content\n\n${skill.content}\n\n`;
        const refs = this.referencesCache.get(skillName);
        if (refs && refs.length > 0) {
            guidance += `## Supporting References\n\n`;
            for (const ref of refs) {
                guidance += `### ${ref.name}\n\n${ref.content}\n\n`;
            }
        }
        if (context) {
            guidance += `## Execution Context\n\n`;
            guidance += `\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\`\n\n`;
            guidance += `Apply the skill workflow to this context.\n`;
        }
        return {
            content: [{
                    type: "text",
                    text: guidance,
                }],
        };
    }
    async handleValidateSkill(skillName) {
        await this.loadAllSkills();
        const skill = this.skillsCache.get(skillName);
        if (!skill) {
            throw new Error(`Skill not found: ${skillName}`);
        }
        const errors = [];
        const warnings = [];
        const fm = skill.metadata;
        if (!fm.name)
            errors.push("Missing name in frontmatter");
        if (!fm.description)
            errors.push("Missing description in frontmatter");
        if (!fm.description.includes("Use when") && !fm.description.includes("use when")) {
            warnings.push("Description should include 'Use when' trigger conditions");
        }
        if (fm.license !== "MIT")
            warnings.push(`License is ${fm.license}, expected MIT`);
        const requiredSections = [
            "Overview", "Scope", "When to Use", "Prerequisites", "Workflow",
            "Safety Constraints", "Error Handling", "Verification",
            "Reporting Format", "Common Rationalizations", "Red Flags",
            "Known Limitations", "References"
        ];
        for (const section of requiredSections) {
            const pattern = new RegExp(`^#+\\s+${section.replace(/\s+/g, "\\s+")}\\b`, "im");
            if (!pattern.test(skill.content)) {
                errors.push(`Missing required section: ${section}`);
            }
        }
        const refs = this.referencesCache.get(skillName) || [];
        const linkMatches = Array.from(skill.content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));
        for (const match of linkMatches) {
            const [, text, link] = match;
            if (link.startsWith("http") || link.startsWith("#"))
                continue;
            const refExists = refs.some(r => r.name === path.basename(link) || r.path.endsWith(link));
            if (!refExists) {
                warnings.push(`Potentially broken reference: ${link} (from '${text}')`);
            }
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        skill: skillName,
                        valid: errors.length === 0,
                        errors,
                        warnings,
                        metadata: fm,
                        referenceCount: refs.length,
                    }, null, 2),
                }],
        };
    }
    async run() {
        const transportType = process.env.MCP_TRANSPORT || "stdio";
        if (transportType === "http") {
            await this.runHttp();
        }
        else {
            await this.runStdio();
        }
    }
    async runStdio() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error("Production Agent Skills MCP Server running on stdio");
    }
    async runHttp() {
        const httpTransport = new streamableHttp_js_1.StreamableHTTPServerTransport({
            sessionIdGenerator: () => crypto.randomUUID(),
        });
        const httpServer = (0, http_1.createServer)(async (req, res) => {
            // CORS headers for browser clients
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                res.end();
                return;
            }
            await httpTransport.handleRequest(req, res);
        });
        const PORT = process.env.PORT || 3000;
        await this.server.connect(httpTransport);
        httpServer.listen(PORT, () => {
            console.error(`Production Agent Skills MCP Server running on HTTP port ${PORT}`);
        });
        // Graceful shutdown
        process.on("SIGTERM", async () => {
            console.error("Shutting down...");
            await httpTransport.close();
            httpServer.close();
            process.exit(0);
        });
    }
}
const server = new SkillsMCPServer();
server.run().catch((err) => {
    console.error("Server error:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map