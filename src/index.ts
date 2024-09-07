import TurndownService from "turndown";
import { Command, Option } from "@commander-js/extra-typings";
import { type } from "os";
import { LIB_VERSION } from "./version";
var turndownPluginGfm = require("turndown-plugin-gfm");

const program = new Command()
  .name("turndown-cli")
  .description("Convert HTML to Markdown")
  .version(LIB_VERSION)
  .argument("<html>", "HTML string or file path")
  .action((html: string, options) => {
    const markdown = markdownify(html);

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
