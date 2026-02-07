/**
 * Naropo Billing SDK CLI
 * 
 * Install and manage billing SDK components
 * Usage: bunx @naropo/billing-sdk add [component-name]
 */

import { Command } from "commander"
import {
    billingSDKRegistry,
    componentNames,
    type ComponentRegistry,
    type ComponentCategory
} from "../src/registry"
import { promises as fs } from "fs"
import path from "path"
import { execSync } from "child_process"

interface InstallOptions {
    path: string
    skipDeps?: boolean
}

interface ListOptions {
    category?: ComponentCategory
}

const program = new Command()

program
    .name("@naropo/billing-sdk")
    .description("Naropo Billing SDK CLI - Install billing components")
    .version("0.1.0")

program
    .command("add")
    .description("Add a billing SDK component to your project")
    .argument("<component>", "Component name to install")
    .option("-p, --path <path>", "Custom installation path", "src/components/billing-sdk")
    .option("--skip-deps", "Skip installing dependencies")
    .action(async (componentName: string, options: InstallOptions) => {
        try {
            const component = billingSDKRegistry[componentName]

            if (!component) {
                console.error(`❌ Component "${componentName}" not found`)
                console.log("\nAvailable components:")
                componentNames.forEach((name: string) => console.log(`  - ${name}`))
                process.exit(1)
            }

            console.log(`\n📦 Installing ${component.name}...`)
            console.log(`   ${component.description}`)

            // Install dependencies
            if (!options.skipDeps) {
                if (component.dependencies.length > 0) {
                    console.log("\n📥 Installing dependencies...")
                    const deps = component.dependencies.join(" ")
                    execSync(`bun add ${deps}`, { stdio: "inherit" })
                }

                if (component.registryDependencies.length > 0) {
                    console.log("\n🔧 Installing UI dependencies...")
                    for (const dep of component.registryDependencies) {
                        console.log(`   - ${dep}`)
                        try {
                            execSync(`bunx shadcn@latest add ${dep} --yes`, { stdio: "inherit" })
                        } catch (error) {
                            console.warn(`   ⚠️  Could not install ${dep} (may already exist)`)
                        }
                    }
                }
            }

            // Create directory
            const targetPath = path.join(process.cwd(), options.path)
            await fs.mkdir(targetPath, { recursive: true })

            // Download component file
            console.log(`\n📝 Creating component files...`)
            for (const file of component.files) {
                const filePath = path.join(targetPath, file.name)
                const sourceUrl = `https://raw.githubusercontent.com/naropo/billing-sdk/main/src/components/billing-sdk/${file.name}`

                console.log(`   - ${file.name}`)

                try {
                    const response = await fetch(sourceUrl)
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                    const content = await response.text()
                    await fs.writeFile(filePath, content, "utf-8")
                } catch (error) {
                    console.warn(`   ⚠️  Could not download ${file.name} from registry`)
                    console.log(`   💡 Please copy manually from: ${component.meta.source}`)
                }
            }

            console.log(`\n✅ Successfully installed ${component.name}!`)
            console.log(`\n📚 Documentation: https://naropo.com${component.meta.docs}`)
            if (component.meta.examples) {
                console.log(`🎨 Live examples: https://naropo.com${component.meta.examples[0]}`)
            }
            console.log(`\n💡 Import with:`)
            console.log(`   import { ${componentName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")} } from "@/components/billing-sdk"`)

        } catch (error) {
            console.error("\n❌ Installation failed:", error)
            process.exit(1)
        }
    })

program
    .command("list")
    .description("List all available components")
    .option("-c, --category <category>", "Filter by category")
    .action((options: ListOptions) => {
        console.log("\n📦 Naropo Billing SDK Components\n")

        const components = Object.values(billingSDKRegistry)
        const filtered = options.category
            ? components.filter((c) => c.category === options.category)
            : components

        const categories = [...new Set(filtered.map((c) => c.category))]

        categories.forEach((category) => {
            const categoryComponents = filtered.filter((c) => c.category === category)
            console.log(`\n${category.toUpperCase()}:`)
            categoryComponents.forEach((c) => {
                console.log(`  ${c.name.padEnd(30)} - ${c.description}`)
            })
        })

        console.log(`\n💡 Install with: bunx @naropo/billing-sdk add <component-name>\n`)
    })

program
    .command("init")
    .description("Initialize billing SDK in your project")
    .option("-p, --path <path>", "Installation path", "src/components/billing-sdk")
    .action(async (options) => {
        try {
            console.log("\n🚀 Initializing Naropo Billing SDK...\n")

            // Create directory
            const targetPath = path.join(process.cwd(), options.path)
            await fs.mkdir(targetPath, { recursive: true })

            // Create index file
            const indexContent = `// Naropo Billing SDK Components
// Auto-generated exports

export * from "./subscription-card"
export * from "./plan-selector-dialog"
export * from "./cancel-subscription-dialog"
export * from "./payment-methods-list"
export * from "./payment-card"
export * from "./payment-form"
export * from "./billing-form"
export * from "./invoice-list"
export * from "./usage-display"
export * from "./usage-table"
export * from "./credit-balance-card"
export * from "./credit-history"
export * from "./trial-banner"
export * from "./dunning-alerts"
export * from "./payment-success-dialog"
export * from "./payment-failure"
export * from "./billing-overview"
export * from "./types"
`
            await fs.writeFile(path.join(targetPath, "index.ts"), indexContent, "utf-8")

            // Create types file
            const typesContent = `// Billing SDK Type Definitions
export * from "@naropo/billing-sdk/types"
`
            await fs.writeFile(path.join(targetPath, "types.ts"), typesContent, "utf-8")

            console.log("✅ Billing SDK initialized!")
            console.log(`   📁 Location: ${options.path}`)
            console.log(`   📝 index.ts created`)
            console.log(`   📝 types.ts created`)
            console.log(`\n💡 Next steps:`)
            console.log(`   1. bunx @naropo/billing-sdk add <component-name>`)
            console.log(`   2. Import: import { SubscriptionCard } from "@/components/billing-sdk"`)
            console.log(`   3. Read docs: https://naropo.com/site/docs/billing-sdk\n`)

        } catch (error) {
            console.error("\n❌ Initialization failed:", error)
            process.exit(1)
        }
    })

program.parse()
