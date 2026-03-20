# GEO Content Factory

Automated **GEO (Generative Engine Optimization)** content pipeline. Generates AI-citation-optimized articles that rank well in AI search engines (ChatGPT, Perplexity, Claude).

## What It Does

```
Topic → Mine Questions → Build Clusters → Generate Articles → Publish Markdown
```

1. **Mine** — Discovers high-value questions from web + Zhihu sources
2. **Cluster** — Organizes topics into pillar + supporting article structures
3. **Generate** — Produces 1500-2500 word GEO-optimized articles via Claude API
4. **Publish** — Outputs Markdown files with YAML frontmatter

## Prerequisites

- **Node.js** >= 18.0 ([download](https://nodejs.org/))
- **npm** >= 9.0 (comes with Node.js)
- **Anthropic API Key** — get one at [console.anthropic.com](https://console.anthropic.com/)

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/lz865469181/geo_content_workflow.git
cd geo_content_workflow

# 2. Install dependencies
npm install

# 3. Set your Anthropic API key (pick one method)

# Option A: Export in terminal (temporary, current session only)
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# Option B: Set as persistent system environment variable (recommended)
# Windows (PowerShell, persists across reboots):
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-xxxxx', 'User')
# macOS/Linux:
echo 'export ANTHROPIC_API_KEY=sk-ant-xxxxx' >> ~/.bashrc && source ~/.bashrc

# 4. (Optional) If using an API proxy, also set:
export ANTHROPIC_BASE_URL=http://your-proxy-url
export CLAUDE_MODEL=your-model-id
```

## Usage

### Full Pipeline (Step by Step)

```bash
# Step 1: Discover topics — outputs ranked question list
npx tsx src/index.ts mine "AI note-taking tools"

# Step 2: Build clusters — creates cluster JSON in output/clusters/
npx tsx src/index.ts cluster "AI note-taking tools"

# Step 3: Generate articles — writes Markdown files to output/articles/
npx tsx src/index.ts generate output/clusters/ai-note-taking-tools.json
```

### One-Shot Batch Mode

```bash
# Generate everything from a config file
npx tsx src/index.ts batch examples/batch-config.json
```

### Analyze Existing Article

```bash
npx tsx src/index.ts optimize output/articles/your-article.md
```

### Quick Start (Copy & Paste)

```bash
git clone https://github.com/lz865469181/geo_content_workflow.git
cd geo_content_workflow
npm install
export ANTHROPIC_API_KEY=your-key-here
npx tsx src/index.ts mine "AI note-taking tools"
npx tsx src/index.ts cluster "AI note-taking tools"
npx tsx src/index.ts generate output/clusters/ai-note-taking-tools.json
```

> **Note:** A full `generate` run for ~20 articles takes approximately 30-40 minutes due to API rate limiting. Results are cached — re-running skips already-generated articles.

## Commands

| Command | Description |
|---------|-------------|
| `mine <topic>` | Discover questions and topics from web + Zhihu |
| `cluster <topic>` | Organize topics into content clusters (pillar + supporting) |
| `generate <cluster-file>` | Generate GEO-optimized articles from a cluster JSON |
| `optimize <article-file>` | Analyze an article and get GEO optimization suggestions |
| `batch <config-file>` | Batch generate from a config (see `examples/batch-config.json`) |

## Configuration

Environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key |
| `CLAUDE_MODEL` | No | Auto-detected | Claude model ID |
| `ANTHROPIC_BASE_URL` | No | — | Custom API proxy URL |
| `GEO_OUTPUT_DIR` | No | `./output` | Output directory |
| `GEO_CACHE_DIR` | No | `./data` | Cache directory |
| `LOG_LEVEL` | No | `info` | Log level (debug/info/warn/error) |

## Project Structure

```
src/
├── index.ts                  # CLI entry point (commander.js)
├── config.ts                 # Config loader with ${ENV_VAR} expansion
├── ai/
│   ├── claude-client.ts      # Anthropic SDK wrapper (retry + rate limiting)
│   ├── prompts.ts            # GEO prompt templates for each pipeline step
│   └── structured-output.ts  # Response parsing & validation
├── pipeline/
│   ├── orchestrator.ts       # Main pipeline coordinator
│   ├── topic-miner.ts        # Question/topic discovery
│   ├── cluster-builder.ts    # Topic cluster design
│   ├── content-generator.ts  # AI content generation
│   ├── optimizer.ts          # GEO optimization analysis
│   └── publisher.ts          # Markdown file output
├── sources/
│   ├── source.interface.ts   # Common DataSource interface
│   ├── web-search.ts         # Web search source (Phase 1)
│   ├── zhihu.ts              # Zhihu Q&A source (Phase 1)
│   ├── xiaohongshu.ts        # Xiaohongshu via CDP CLI (Phase 2)
│   └── user-import.ts        # User data import (Phase 3)
├── knowledge/                # Knowledge graph (Phase 3 stubs)
├── templates/                # Handlebars templates
└── utils/
    ├── logger.ts             # Structured logging (secrets redacted)
    ├── cache.ts              # File-based response caching
    └── rate-limiter.ts       # Token-bucket rate limiter
```

## Output Example

A full run on "AI note-taking tools" produces:

- **20 articles** (~42,000 words total)
- **3 content clusters** with pillar + supporting structure
- **3 cluster index files** with cross-links

Each article includes:
- YAML frontmatter (title, date, tags, cluster, type)
- Direct answer in the first paragraph (AI extraction optimized)
- Structured H2/H3 headings matching search queries
- Comparison tables where applicable
- FAQ section (3-5 Q&A pairs)

## Batch Mode

Create a config file:

```json
{
  "topics": [
    "AI note-taking tools",
    "best project management software 2025"
  ]
}
```

```bash
npx tsx src/index.ts batch examples/batch-config.json
```

## Roadmap

- [x] **Phase 1**: Web + Zhihu sources, full content pipeline
- [ ] **Phase 2**: Xiaohongshu integration, hot topic analysis, review aggregation
- [ ] **Phase 3**: User data import, personal knowledge graph (SQLite)

## Tech Stack

- TypeScript + Node.js
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) — Claude API
- [commander.js](https://www.npmjs.com/package/commander) — CLI framework
- [handlebars](https://www.npmjs.com/package/handlebars) — Templates

## Security

- API keys stored as environment variables only
- Config supports `${VAR}` placeholder expansion
- Secrets automatically redacted in logs
- No `.env` files committed (in `.gitignore`)
