import { defineConfig } from "tsup"

export default defineConfig([
    // Library build
    {
        entry: {
            index: "src/index.ts",
            registry: "src/registry.ts",
            "core/index": "src/core/index.ts",
            "types/index": "src/types/index.ts",
            "gateway/index": "src/gateway/index.ts",
            "components/index": "src/components/index.ts",
            "utils/index": "src/utils/index.ts",
        },
        format: ["cjs", "esm"],
        dts: true,
        splitting: false,
        sourcemap: true,
        clean: true,
        treeshake: true,
        minify: false,
        external: [
            "react",
            "react-dom",
            "next",
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@stripe/react-stripe-js",
            "@stripe/stripe-js",
        ],
        esbuildOptions(options) {
            options.banner = {
                js: "/**\n * Autlify Billing SDK\n * PROPRIETARY SOFTWARE - Copyright © 2026 Autlify. All rights reserved.\n */",
            }
        },
    },
    // CLI build
    {
        entry: {
            cli: "bin/cli.ts",
        },
        format: ["cjs"],
        dts: false,
        splitting: false,
        sourcemap: false,
        clean: false,
        treeshake: true,
        minify: true,
        banner: {
            js: "#!/usr/bin/env node",
        },
        platform: "node",
        target: "node18",
        external: ["commander"],
    },
])
