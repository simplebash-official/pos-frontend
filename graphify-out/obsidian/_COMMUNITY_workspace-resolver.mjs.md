---
type: community
cohesion: 0.07
members: 57
---

# workspace-resolver.mjs

**Cohesion:** 0.07 - loosely connected
**Members:** 57 nodes

## Members
- [[DEFAULT_RESOLVE_OPTIONS]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[EXTENSIONS]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[INDEX_FILES]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[SKIP_DIRS]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[SKIP_FILE_PATTERNS]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[SOURCE_EXTENSIONS]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[buildPackageLookup()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[buildResolver()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[collectFiles()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[detectMonorepoRoot()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[enrichRoutesWithWorkspaceImports()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[enumerateRoutes()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[escapeRegExp()_1]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[expandParts()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[expandPureBarrel()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[expandResolvedSpecifier()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[expandSuffixFanout()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[expandWorkspaceGlob()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[extractDynamicImportReferences()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[extractExportForwardRefs()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[extractImportReferences()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[extractImportSpecifiers()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[extractModuleReferences()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[fileExists()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[fileExportsAnyName()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[filterApplicable()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[forwardRelevanceScore()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[globMatch()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[isFile()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[isPureBarrel()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[isSourcePath()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[isSuffixFanoutFile()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[joinPackagePath()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[listWorkspacePackages()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[main()_4]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[mapFileToRoute()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[normalizeName()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[normalizeRouteFileStem()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[parseExportNames()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[parseImportNames()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[parsePnpmWorkspaceYaml()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[pickConditionalTarget()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[readWorkspaceGlobs()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[requestedNamesForForward()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[resolveExistingPath()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[resolveModuleSpecifier()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[resolveWorkspaceImports()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[routeEntryType()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[routeTypeOrder()]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[scan-codebase.mjs]] - code - .agents/skills/vercel-optimize/scripts/scan-codebase.mjs
- [[selectRelevantForwards()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[specifierMatchesNames()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[splitImportList()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[textExportsName()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[tryReadJson()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[tryReadText()]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs
- [[workspace-resolver.mjs]] - code - .agents/skills/vercel-optimize/lib/workspace-resolver.mjs

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/workspace-resolvermjs
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_vercel.mjs]]
- 2 edges to [[_COMMUNITY_scannersindex.mjs]]

## Top bridge nodes
- [[scan-codebase.mjs]] - degree 21, connects to 2 communities
- [[main()_4]] - degree 10, connects to 1 community