import {App} from "./app";
import {Command} from "commander";

const app = new App();
const program = new Command('ltag');

program
  .command('add <target>')
    .requiredOption('-t, --tag <tag...>', 'The tag')
    .option('-v, --verbose')
    .action((target, cmdObj) => app.addTag(target, cmdObj.tag, cmdObj.verbose));

program.parseAsync(process.argv).catch(e => console.log(e));
