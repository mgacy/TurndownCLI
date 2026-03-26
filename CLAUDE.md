# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TurndownCLI is a command-line interface for Turndown, an HTML to Markdown converter. It's built with TypeScript and uses Bun as its runtime, package manager, bundler, and test runner. It is designed primarily to support SwiftyTurndown, a Swift package for converting HTML to Markdown. The CLI uses `bun build --compile` to create standalone executables for distribution.

## Build and Development Commands

### Installing Dependencies

```bash
bun install
```

Uses Bun's package manager. The lockfile (`bun.lock`) is in text format for PR reviewability.

### Building

```bash
bun run build
```

Compiles `src/index.ts` directly into a standalone executable at `dist/turndown-cli` using `bun build --compile`. A `prebuild` script automatically generates `src/version.ts` from `package.json` version. There is no intermediate JavaScript output step — Bun compiles TypeScript directly.

### Cross-Platform Builds

```bash
bun run build:macos    # Produces dist/turndown-cli-macos-{arm64,x64}
bun run build:linux    # Produces dist/turndown-cli-linux-{arm64,x64}
```

These scripts explicitly run `prebuild` first (Bun's `pre<script>` hooks only fire for the exact script name, not for `build:macos`/`build:linux`), then cross-compile using `bun build --compile --target`.

**Important:** Output filenames use `macos`/`linux` (not `darwin`). SwiftyTurndown's `ReleaseExecutor` matches assets by OS name, so using `darwin` would silently break asset resolution.

### Type Checking

```bash
bun run prebuild && bunx tsc --noEmit
```

TypeScript's `tsc` is used only for type checking (not compilation). The `prebuild` step must run first to generate `src/version.ts`.

### Testing

```bash
bun test
```

Runs the test suite using Bun's built-in test runner (`bun:test`). Tests are located in `tests/index.test.ts`.

## Architecture

### Core Components

**Entry Point (`src/index.ts`)**:
- Uses Commander.js with extra typings for CLI argument parsing
- Accepts HTML as a string or file path (checks `fs.existsSync()` to determine)
- Passes through all Turndown options as CLI flags (heading-style, hr, bullet-list-marker, code-block-style, em-delimiter, fence, strong-delimiter, link-style, link-reference-style)
- Automatically applies GFM (GitHub Flavored Markdown) plugin via turndown-plugin-gfm
- Compiled directly into a standalone executable by `bun build --compile`

**Conversion Function (`markdownify`)**:
- Creates TurndownService instance with provided options
- Always applies GFM plugin for GitHub Flavored Markdown support
- Returns converted markdown string

### TypeScript Configuration

- Target: ES2016
- Module: ESNext with bundler module resolution
- Strict mode enabled
- `noEmit: true` — TypeScript is used only for type checking, not compilation
- Source in `src/`; no JS output directory (Bun compiles directly)
- Requires DOM and ES6 libs (for domino/Turndown dependencies)

## Release Process

Releases are automated via GitHub Actions (`.github/workflows/release.yml`):

1. Triggered on version tags matching pattern `[0-9]+.[0-9]+.[0-9]+`
2. macOS build runs on `macos-latest-xlarge`, Linux build runs on `ubuntu-latest`
3. Both jobs use Bun (pinned version) with `bun install --frozen-lockfile`
4. macOS job runs `bun run build:macos` to produce arm64 and x64 binaries
5. Linux job runs `bun run build:linux` to produce arm64 and x64 binaries
6. macOS executables are code signed using certificate secrets
7. A release job collects artifacts, generates SHA256 checksums, and creates a GitHub release with all platform binaries

Release notes are auto-generated using `.github/release.yml` configuration with categories:
- Breaking Changes (semver/major, breaking-change labels)
- New Features (semver/minor, enhancement labels)
- Bug Fixes (semver/patch, bug labels)

## Key Dependencies

- **turndown**: Core HTML to Markdown conversion library
- **turndown-plugin-gfm**: GitHub Flavored Markdown support (always enabled)
- **commander** / **@commander-js/extra-typings**: CLI framework with TypeScript support
- **domino**: DOM implementation required by Turndown for server-side HTML parsing

Dev dependencies:
- **typescript**: Used for type checking via `tsc --noEmit` (Bun handles compilation)
- **@types/node**, **@types/turndown**: Type definitions for type checking

## File Input Support

The CLI accepts both HTML strings and file paths. When a file path is provided:
- `fs.existsSync()` checks if the argument is a valid file path
- If true, reads file content with `fs.readFileSync(path, "utf-8")`
- If false, treats argument as raw HTML string

This allows usage patterns like:
```bash
turndown-cli "<h1>Hello</h1>"
turndown-cli ./page.html
```
