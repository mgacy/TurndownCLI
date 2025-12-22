# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TurndownCLI is a command-line interface for Turndown, an HTML to Markdown converter. It's built with TypeScript and Node.js, and is designed primarily to support SwiftyTurndown, a Swift package for converting HTML to Markdown. The CLI uses `pkg` to create standalone executables for distribution.

## Build and Development Commands

### Building

```bash
npm run build
```
Compiles TypeScript from `src/` to JavaScript in `lib/`. A prebuild step automatically generates `src/version.ts` from package.json version.

### Packaging

```bash
npm run pkg
```

Creates standalone executables in `dist/` for:
- node18-linux-arm64
- node18-linux-x64
- node18-macos-x64
- node18-macos-arm64

### Full Build Process

```bash
npm run build && npm run pkg
```

### Testing

No test suite is currently configured.

## Architecture

### Core Components

**Entry Point (`src/index.ts`)**:
- Uses Commander.js with extra typings for CLI argument parsing
- Accepts HTML as a string or file path (checks `fs.existsSync()` to determine)
- Passes through all Turndown options as CLI flags (heading-style, hr, bullet-list-marker, code-block-style, em-delimiter, fence, strong-delimiter, link-style, link-reference-style)
- Automatically applies GFM (GitHub Flavored Markdown) plugin via turndown-plugin-gfm

**Conversion Function (`markdownify`)**:
- Creates TurndownService instance with provided options
- Always applies GFM plugin for GitHub Flavored Markdown support
- Returns converted markdown string

**CLI Execution (`bin/turndown-cli`)**:
- Node.js shebang script that requires compiled `lib/index.js`
- Bundled into standalone executables via pkg

### TypeScript Configuration

- Target: ES2016
- Modules: CommonJS
- Strict mode enabled
- Source in `src/`, output in `lib/`
- Requires DOM and ES6 libs (for domino/Turndown dependencies)

## Release Process

Releases are automated via GitHub Actions (`.github/workflows/release.yml`):

1. Triggered on version tags matching pattern `[0-9]+.[0-9]+.[0-9]+`
2. Runs on `macos-latest-xlarge`
3. Installs dependencies with `npm ci`
4. Builds with `npm run build`
5. Packages with `npm run pkg`
6. Code signs macOS executables using certificate secrets
7. Creates GitHub release with all platform binaries

Release notes are auto-generated using `.github/release.yml` configuration with categories:
- Breaking Changes (semver/major, breaking-change labels)
- New Features (semver/minor, enhancement labels)
- Bug Fixes (semver/patch, bug labels)

## Key Dependencies

- **turndown**: Core HTML to Markdown conversion library
- **turndown-plugin-gfm**: GitHub Flavored Markdown support (always enabled)
- **commander** / **@commander-js/extra-typings**: CLI framework with TypeScript support
- **pkg**: Bundles Node.js app into standalone executables
- **domino**: DOM implementation required by Turndown for server-side HTML parsing

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
