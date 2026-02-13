#!/usr/bin/env node

/**
 * Autlify MCP Server
 * 
 * Model Context Protocol server providing AI-assisted development tools:
 * - Component discovery across multiple registries
 * - Installation guidance  
 * - Usage examples and documentation
 * - Smart component suggestions
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { registries, getAllComponents, searchComponents, type RegistryName } from "./registries/index.js"
import type { ComponentRegistry } from "./types.js"

const server = new Server(
  { name: "autlify-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
)

const tools = [
  {
    name: "list_registries",
    description: "List all available component registries",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_components",
    description: "List components with optional filtering by registry, category, or search term",
    inputSchema: {
      type: "object",
      properties: {
        registry: { type: "string", description: "Filter by registry (e.g., 'billing-sdk')" },
        category: { type: "string", description: "Filter by category" },
        search: { type: "string", description: "Search by name or description" },
      },
    },
  },
  {
    name: "get_component",
    description: "Get detailed info about a specific component",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name" },
        registry: { type: "string", description: "Registry name (optional)" },
      },
      required: ["name"],
    },
  },
  {
    name: "suggest_components",
    description: "Get component suggestions based on use case",
    inputSchema: {
      type: "object",
      properties: {
        useCase: { type: "string", description: "What you're building" },
        features: { type: "array", items: { type: "string" } },
        registry: { type: "string", description: "Limit to specific registry" },
      },
      required: ["useCase"],
    },
  },
  {
    name: "get_installation_guide",
    description: "Get installation steps for components",
    inputSchema: {
      type: "object",
      properties: {
        components: { type:"array", items: { type: "string" } },
        packageManager: { type: "string", enum: ["npm", "bun", "yarn", "pnpm"], default: "bun" },
      },
      required: ["components"],
    },
  },
  {
    name: "search_all",
    description: "Search across all registries",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
]

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }))

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params

  try {
    if (name === "list_registries") {
      const list = Object.entries(registries).map(([key, reg]) => ({
        name: key,
        version: reg.version,
        description: reg.description,
        componentCount: Object.keys(reg.components).length,
        categories: reg.categories,
      }))
      return { content: [{ type: "text", text: JSON.stringify({ registries: list }, null, 2) }] }
    }

    if (name === "list_components") {
      const { registry, category, search } = args
      let components: any[] = registry && registry in registries
        ? Object.values(registries[registry as RegistryName].components)
        : getAllComponents().map((i) => i.component)

      if (category) components = components.filter((c: any) => c.category === category)
      if (search) {
        const s = search.toLowerCase()
        components = components.filter((c: any) =>
          c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s)
        )
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify(components.map((c: any) => ({
            name: c.name,
            description: c.description,
            category: c.category,
          })), null, 2),
        }],
      }
    }

    if (name === "get_component") {
      const { name: cName, registry } = args
      let component: any

      if (registry && registry in registries) {
        component = registries[registry as RegistryName].components[cName]
      } else {
        for (const reg of Object.values(registries)) {
          if (cName in reg.components) {
            component = reg.components[cName]
            break
          }
        }
      }

      if (!component) {
        return {
          content: [{ type: "text", text: `Component "${cName}" not found` }],
          isError: true,
        }
      }

      return { content: [{ type: "text", text: JSON.stringify(component, null, 2) }] }
    }

    if (name === "search_all") {
      const { query } = args
      const results = searchComponents(query)
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            query,
            results: results.map((r) => ({
              registry: r.registry,
              name: r.component.name,
              description: r.component.description,
            })),
          }, null, 2),
        }],
      }
    }

    return {
      content: [{ type: "text", text: `Tool "${name}" not fully implemented yet` }],
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("Autlify MCP server running")
}

main().catch(console.error)
