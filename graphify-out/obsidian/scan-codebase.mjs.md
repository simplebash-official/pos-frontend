---
source_file: ".agents/skills/vercel-optimize/scripts/scan-codebase.mjs"
type: "code"
community: "workspace-resolver.mjs"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/workspace-resolvermjs
---

# scan-codebase.mjs

## Connections
- [[SKIP_DIRS]] - `contains` [EXTRACTED]
- [[SKIP_FILE_PATTERNS]] - `contains` [EXTRACTED]
- [[buildResolver()]] - `imports` [EXTRACTED]
- [[collectFiles()]] - `contains` [EXTRACTED]
- [[detectMonorepoRoot()]] - `imports` [EXTRACTED]
- [[detectStack()]] - `imports` [EXTRACTED]
- [[enrichRoutesWithWorkspaceImports()]] - `contains` [EXTRACTED]
- [[enumerateRoutes()]] - `contains` [EXTRACTED]
- [[filterApplicable()]] - `contains` [EXTRACTED]
- [[globMatch()]] - `contains` [EXTRACTED]
- [[listWorkspacePackages()]] - `imports` [EXTRACTED]
- [[main()_4]] - `contains` [EXTRACTED]
- [[mapFileToRoute()]] - `contains` [EXTRACTED]
- [[normalizeRouteFileStem()]] - `contains` [EXTRACTED]
- [[resolveWorkspaceImports()]] - `imports` [EXTRACTED]
- [[routeEntryType()]] - `contains` [EXTRACTED]
- [[routeTypeOrder()]] - `contains` [EXTRACTED]
- [[scanners]] - `imports` [EXTRACTED]
- [[scannersindex.mjs]] - `imports_from` [EXTRACTED]
- [[vercel.mjs]] - `imports_from` [EXTRACTED]
- [[workspace-resolver.mjs]] - `imports_from` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/workspace-resolvermjs