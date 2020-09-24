import {App} from "./app";
import {Command} from "commander";

const app = new App();
const program = new Command('ltag');

program.command('add <target>')
  .requiredOption('-t, --tag <tag...>', 'The tag')
  .option('-v, --verbose')
  .action(async (target, cmdObj) => {
    app.setVerbose(cmdObj.verbose);
    await app.addTag(target, cmdObj.tag)
  });

program.command('list <target>')
  .option('-v, --verbose')
  .action(async (target, cmdObj) => {
    app.setVerbose(cmdObj.verbose);
    await app.listTagsForTarget(target);
  });

program.parseAsync(process.argv).catch(e => console.log(e));
