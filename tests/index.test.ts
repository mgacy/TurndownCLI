import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

// Path to the CLI executable
const CLI_PATH = path.join(__dirname, '..', 'bin', 'turndown-cli');

// Helper function to run CLI and capture output
function runCLI(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node "${CLI_PATH}" ${args.map(arg => `"${arg}"`).join(' ')}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || '',
      exitCode: error.status || 1,
    };
  }
}

describe('TurndownCLI', () => {
  let tempDir: string;
  let tempFiles: string[] = [];

  beforeEach(() => {
    // Create a unique temp directory for this test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'turndown-test-'));
  });

  afterEach(() => {
    // Clean up temp files and directory
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (err) {
        // Ignore cleanup errors
      }
    });
    tempFiles = [];

    try {
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir);
      }
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('HTML string input', () => {
    it('converts basic HTML to Markdown', () => {
      const result = runCLI(['<h1>Hello World</h1>']);
      // Default heading style is setext (underline style)
      expect(result.stdout).toContain('Hello World');
      expect(result.stdout).toContain('===========');
      expect(result.exitCode).toBe(0);
    });

    it('converts paragraph tags', () => {
      const result = runCLI(['<p>This is a paragraph.</p>']);
      expect(result.stdout.trim()).toBe('This is a paragraph.');
      expect(result.exitCode).toBe(0);
    });

    it('converts links', () => {
      const result = runCLI(['<a href="https://example.com">Link</a>']);
      expect(result.stdout.trim()).toBe('[Link](https://example.com)');
      expect(result.exitCode).toBe(0);
    });

    it('applies GFM plugin for tables', () => {
      const html = '<table><tr><th>Header</th></tr><tr><td>Cell</td></tr></table>';
      const result = runCLI([html]);
      expect(result.stdout).toContain('|');
      expect(result.stdout).toContain('Header');
      expect(result.stdout).toContain('Cell');
      expect(result.exitCode).toBe(0);
    });

    it('applies GFM plugin for strikethrough', () => {
      const result = runCLI(['<del>strikethrough</del>']);
      // Note: <del> converts to single ~ with turndown-plugin-gfm
      expect(result.stdout.trim()).toBe('~strikethrough~');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('File path input', () => {
    it('reads and converts HTML file', () => {
      const htmlFile = path.join(tempDir, 'test.html');
      tempFiles.push(htmlFile);
      fs.writeFileSync(htmlFile, '<h1>From File</h1>', 'utf-8');

      const result = runCLI([htmlFile]);
      // Default heading style is setext
      expect(result.stdout).toContain('From File');
      expect(result.stdout).toContain('=========');
      expect(result.exitCode).toBe(0);
    });

    it('handles file not found (non-existent path treated as HTML)', () => {
      // A non-existent path is treated as HTML string, not an error
      const result = runCLI(['/nonexistent/file.html']);
      expect(result.exitCode).toBe(0);
      // The HTML string itself is returned (no tags to convert)
      expect(result.stdout.trim()).toBe('/nonexistent/file.html');
    });

    it('handles directory instead of file', () => {
      const result = runCLI([tempDir]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Error:');
      expect(result.stderr).toContain('directory');
    });

    it('converts complex HTML from file', () => {
      const htmlFile = path.join(tempDir, 'complex.html');
      tempFiles.push(htmlFile);
      const complexHtml = `
        <h1>Title</h1>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;
      fs.writeFileSync(htmlFile, complexHtml, 'utf-8');

      const result = runCLI([htmlFile]);
      expect(result.stdout).toContain('Title');
      expect(result.stdout).toContain('=====');
      expect(result.stdout).toContain('**bold**');
      expect(result.stdout).toContain('_italic_');
      expect(result.stdout).toContain('*   Item 1');
      expect(result.stdout).toContain('*   Item 2');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Options pass-through', () => {
    it('applies heading-style option (setext)', () => {
      const result = runCLI(['<h1>Heading</h1>', '--heading-style', 'setext']);
      expect(result.stdout).toContain('Heading');
      expect(result.stdout).toContain('=======');
      expect(result.exitCode).toBe(0);
    });

    it('applies heading-style option (atx)', () => {
      const result = runCLI(['<h1>Heading</h1>', '--heading-style', 'atx']);
      expect(result.stdout.trim()).toBe('# Heading');
      expect(result.exitCode).toBe(0);
    });

    it('applies code-block-style option (indented)', () => {
      const result = runCLI(['<pre><code>code</code></pre>', '--code-block-style', 'indented']);
      expect(result.stdout).toContain('    code');
      expect(result.exitCode).toBe(0);
    });

    it('applies code-block-style option (fenced)', () => {
      const result = runCLI(['<pre><code>code</code></pre>', '--code-block-style', 'fenced']);
      expect(result.stdout).toContain('```');
      expect(result.stdout).toContain('code');
      expect(result.exitCode).toBe(0);
    });

    it('applies em-delimiter option', () => {
      const result = runCLI(['<em>emphasis</em>', '--em-delimiter', '_']);
      expect(result.stdout.trim()).toBe('_emphasis_');
      expect(result.exitCode).toBe(0);
    });

    it('applies strong-delimiter option', () => {
      const result = runCLI(['<strong>bold</strong>', '--strong-delimiter', '__']);
      expect(result.stdout.trim()).toBe('__bold__');
      expect(result.exitCode).toBe(0);
    });

    it('applies bullet-list-marker option', () => {
      const result = runCLI(['<ul><li>Item</li></ul>', '--bullet-list-marker', '+']);
      expect(result.stdout).toContain('+   Item');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('handles empty file', () => {
      const emptyFile = path.join(tempDir, 'empty.html');
      tempFiles.push(emptyFile);
      fs.writeFileSync(emptyFile, '', 'utf-8');

      const result = runCLI([emptyFile]);
      expect(result.stdout.trim()).toBe('');
      expect(result.exitCode).toBe(0);
    });
  });
});
