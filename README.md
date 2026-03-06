# claude-hud

A custom status line for [Claude Code](https://claude.ai/claude-code) that shows model, git info, context usage, cost, and time until rate limit reset.

```
🤖 Opus 4.6   🌿 main +12/-3   ████████░░░░░░░░░░░░ 40%
💰 $1.08 spent   ⏱️  2h 30m until reset
```

## Install

```bash
npx claude-hud
```

Restart Claude Code after installing.

## What it does

- Copies the statusline script to `~/.claude/statusline-command.sh`
- Adds the `statusLine` config to `~/.claude/settings.json`
- Installs [ccusage](https://github.com/ryoppippi/ccusage) globally (for cost tracking)

## Requirements

- [jq](https://jqlang.org/) — `brew install jq` (macOS) or `sudo apt install jq` (Linux)
- Node.js 18+

## Features

| Element | Description |
|---------|-------------|
| 🤖 Model | Current Claude model |
| 🌿 Git | Branch name + insertions/deletions |
| Context bar | Color-coded usage (green/yellow/red) |
| 💰 Cost | Spending in current 5-hour block (via ccusage) |
| ⏱️ Timer | Time until rate limit resets |

Cost data is cached and refreshed every 5 minutes to minimize overhead.

## Uninstall

```bash
npx claude-hud --uninstall
```

## License

MIT
