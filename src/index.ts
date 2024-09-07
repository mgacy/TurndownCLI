import TurndownService from "turndown";
import { Command, Option } from "@commander-js/extra-typings";
import { type } from "os";
import { LIB_VERSION } from "./version";
var turndownPluginGfm = require("turndown-plugin-gfm");

// Option Choices
const BulletListMarkers = ["-", "+", "*"] as const;
const CodeBlockStyles = ["indented", "fenced"] as const;
const EmDelimiters = ["_", "*"] as const;
const Fences = ["```", "~~~"] as const;
const HeadingStyles = ["setext", "atx"] as const;
const LinkReferenceStyles = ["full", "collapsed", "shortcut"] as const;
const LinkStyles = ["inlined", "referenced"] as const;
const StrongDelimiters = ["__", "**"] as const;
const ThematicBreaks = ["***", "---", "___"] as const;

const program = new Command()
  .name("turndown-cli")
  .description("Convert HTML to Markdown")
  .version(LIB_VERSION)
  .argument("<html>", "HTML string or file path")
  .addOption(
    new Option("--heading-style <heading-style>", "heading style").choices(
      HeadingStyles
    )
  )
  .addOption(
    new Option("--hr <hr>", "thematic break marker").choices(ThematicBreaks)
  )
  .addOption(
    new Option(
      "--bullet-list-marker <bullet-list-marker>",
      "bullet list marker"
    ).choices(BulletListMarkers)
  )
  .addOption(
    new Option(
      "--code-block-style <code-block-style>",
      "code block style"
    ).choices(CodeBlockStyles)
  )
  .addOption(
    new Option("--em-delimiter <em-delimiter>", "emphasis delimiter").choices(
      EmDelimiters
    )
  )
  .addOption(
    new Option("--fence <fence>", "fenced code block delimiter").choices(Fences)
  )
  .addOption(
    new Option(
      "--strong-delimiter <strong-delimiter>",
      "strong delimiter"
    ).choices(StrongDelimiters)
  )
  .addOption(
    new Option("--link-style <link-style>", "link style").choices(LinkStyles)
  )
  .addOption(
    new Option(
      "--link-reference-style <link-reference-style>",
      "reference link style"
    ).choices(LinkReferenceStyles)
  )
  .action((html: string, options) => {
    const markdown = markdownify(html, options);

    console.log(markdown);
  });

function markdownify(html: string, options?: TurndownService.Options): string {
  const turndownService = new TurndownService(options);

  // GFM
  var gfm = turndownPluginGfm.gfm;
  turndownService.use(gfm);

  return turndownService.turndown(html);
}

program.parse(process.argv);
