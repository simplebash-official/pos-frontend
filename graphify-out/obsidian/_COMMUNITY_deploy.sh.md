---
type: community
cohesion: 0.33
members: 6
---

# deploy.sh

**Cohesion:** 0.33 - loosely connected
**Members:** 6 nodes

## Members
- [[cleanup()]] - code - .agents/skills/deploy-to-vercel/resources/deploy.sh
- [[deploy.sh]] - code - .agents/skills/deploy-to-vercel/resources/deploy.sh
- [[deploy.sh script]] - code - .agents/skills/deploy-to-vercel/resources/deploy.sh
- [[detect_framework()]] - code - .agents/skills/deploy-to-vercel/resources/deploy.sh
- [[has_dep_exact()]] - code - .agents/skills/deploy-to-vercel/resources/deploy.sh
- [[has_dep_prefix()]] - code - .agents/skills/deploy-to-vercel/resources/deploy.sh

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/deploysh
SORT file.name ASC
```
