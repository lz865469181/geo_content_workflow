# GEO Content Factory — Project Memory

## Overview
Automated GEO (Generative Engine Optimization) content pipeline.
Fetches data from web sources, uses Claude API to generate structured content,
outputs static Markdown/HTML files for publishing.

## Architecture
- **CLI tool** built with commander.js + TypeScript
- **Pipeline**: topic-miner → cluster-builder → content-generator → optimizer → publisher
- **Data sources**: web-search, zhihu (Phase 1), xiaohongshu (Phase 2), user-import (Phase 3)
- **AI**: Claude API via @anthropic-ai/sdk
- **Output**: Markdown files with YAML frontmatter

## Tech Stack
- TypeScript + Node.js
- @anthropic-ai/sdk for Claude API
- commander.js for CLI
- handlebars for templates

## Key Decisions
- CommonJS module system (for compatibility)
- Secrets via environment variables only (ANTHROPIC_API_KEY)
- Config supports ${ENV_VAR} expansion
- All AI prompts in src/ai/prompts.ts for easy iteration

## Phase Status
- [x] Phase 1: Zhihu + Web → Search + Summary (implementing)
- [ ] Phase 2: + Xiaohongshu, Hot Topics, Reviews
- [ ] Phase 3: User Data + Knowledge Graph

## Runtime Notes
- API proxy at ANTHROPIC_BASE_URL uses model name `ppio/pa/claude-opus-4-6`
- Config auto-reads ANTHROPIC_DEFAULT_SONNET_MODEL env var for model name
- Claude client has exponential backoff retry for 429/529 errors (3 retries, 5s base)
- Rate limiter set to 1 req/5sec to avoid proxy rate limits

## Changes Log
- 2026-03-20: Added retry logic for rate limits, proxy model name support
- 2026-03-19: Initial project setup and Phase 1 implementation
