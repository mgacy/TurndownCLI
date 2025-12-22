# TurndownCLI

A command-line interface for [Turndown](https://github.com/mixmark-io/turndown), an HTML to Markdown converter. TurndownCLI automatically applies GitHub Flavored Markdown (GFM) support via [turndown-plugin-gfm](https://github.com/mixmark-io/turndown-plugin-gfm).

This is intended primarily to support [SwiftyTurndown](https://github.com/mgacy/swifty-turndown), a Swift package for converting HTML to Markdown. [pkg](https://github.com/vercel/pkg) is used to create executables for SwiftyTurndown to download and for which it serves as an interface.

## Installation

Download the appropriate pre-built executable from the [releases page](https://github.com/mgacy/TurndownCLI/releases) for your platform:
- `turndown-cli-linux-arm64` - Linux ARM64
- `turndown-cli-macos-arm64` - macOS Apple Silicon (M1/M2/M3)
- `turndown-cli-macos-x64` - macOS Intel

Or build from source:

```bash
git clone https://github.com/mgacy/TurndownCLI.git
cd TurndownCLI
npm install
npm run build
npm run pkg
```

## Usage

TurndownCLI accepts HTML input in two ways:

1. **HTML string** - Pass HTML directly as an argument
2. **File path** - Provide a path to an HTML file

The CLI automatically detects whether the argument is a file path (using `fs.existsSync()`) or an HTML string.

### Basic Syntax

```bash
turndown-cli "<html>" [options]
turndown-cli <file.html> [options]
```

### Examples

**Convert HTML string:**

```bash
turndown-cli "<h1>Hello World</h1><p>This is a <strong>test</strong>.</p>"
```

Output:
```
Hello World
===========

This is a **test**.
```

**Convert HTML file:**

```bash
turndown-cli page.html
```

**Convert with specific options:**

```bash
# Use atx-style headings (# Heading)
turndown-cli "<h1>Title</h1>" --heading-style atx

# Use fenced code blocks
turndown-cli content.html --code-block-style fenced

# Customize emphasis delimiter
turndown-cli "<em>italic</em>" --em-delimiter "*"
```

## Options

TurndownCLI supports all standard [Turndown options](https://github.com/mixmark-io/turndown#options):

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `--heading-style` | `setext`, `atx` | `setext` | Heading style (`setext` uses underlines, `atx` uses `#`) |
| `--hr` | `***`, `---`, `___` | `***` | Horizontal rule marker |
| `--bullet-list-marker` | `-`, `+`, `*` | `*` | Bullet list marker |
| `--code-block-style` | `indented`, `fenced` | `indented` | Code block style |
| `--fence` | `` ``` ``, `~~~` | `` ``` `` | Fenced code block delimiter |
| `--em-delimiter` | `_`, `*` | `_` | Emphasis delimiter |
| `--strong-delimiter` | `__`, `**` | `**` | Strong delimiter |
| `--link-style` | `inlined`, `referenced` | `inlined` | Link style |
| `--link-reference-style` | `full`, `collapsed`, `shortcut` | `full` | Reference link style |

For detailed option descriptions, see the [Turndown documentation](https://github.com/mixmark-io/turndown#options).

## GitHub Flavored Markdown (GFM)

TurndownCLI automatically enables GFM support, providing additional features:

- **Tables** - Converts HTML tables to Markdown tables
- **Strikethrough** - Converts `<del>` and `<s>` tags to `~text~`
- **Task lists** - Converts checkboxes to `[ ]` and `[x]`

Example:

```bash
turndown-cli "<table><tr><th>Name</th><th>Age</th></tr><tr><td>John</td><td>30</td></tr></table>"
```

Output:
```
| Name | Age |
| ---- | --- |
| John | 30  |
```

## Auto-Detection Behavior

The CLI uses `fs.existsSync()` to determine input type:

- If the argument matches an existing file path → reads and converts the file
- If the argument does not match a file path → treats it as an HTML string

**Edge case:** If you have an HTML string that happens to match an existing file path, it will be treated as a file. In this rare case, you can work around it by piping input:

```bash
echo "<p>./existing-file.html</p>" | turndown-cli
```

## Error Handling

TurndownCLI provides clear error messages for common file operation issues:

```bash
# File not found
turndown-cli missing.html
# Error: File not found: missing.html

# Directory instead of file
turndown-cli ./directory
# Error: Expected a file but got a directory: ./directory

# Permission denied
turndown-cli protected.html
# Error: Permission denied: protected.html
```

## Development

### Build

```bash
npm run build  # Compiles TypeScript to JavaScript
```

### Package

```bash
npm run pkg  # Creates standalone executables in dist/
```

### Test

```bash
npm test        # Run tests in watch mode
npm run test:ui # Run tests with UI
npm run test:run # Run tests once
```

## License

MIT
