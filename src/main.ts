import {App} from "./app";
import {Command} from "commander";

const app = new App();
const program = new Command('ltag');

function getArgs(firstArg: string, restArgs?:string[]) {
  const allArgs = [firstArg];
  if (restArgs) {
    allArgs.push(...restArgs);
  }

  return allArgs;
}

program.command('add <...tag>')
  .requiredOption('-i, --item <item>', 'The item to tag')
  .option('-v, --verbose')
  .action(async (firstTag, cmdObj, restTagList) => {
    app.setVerbose(cmdObj.verbose);

    await app.addTag(cmdObj.item, getArgs(firstTag, restTagList))
  });

program.command('list')
  .option('-v, --verbose')
  .option('-i, --item <item>', 'The item to list the tags for')
  .action(async (cmdObj) => {
    app.setVerbose(cmdObj.verbose);
    await app.listTags(cmdObj.item);
  });

program.command('find <...tag>')
  .option('-v, --verbose')
  .action(async (firstTag, cmdObj, restTagList) => {
    app.setVerbose(cmdObj.verbose);
    const tagsToFind = [firstTag];
    if (restTagList) {
      tagsToFind.push(...restTagList);
    }
    await app.findMatchingTags(tagsToFind);
  });

program.command('remove <...tag>')
  .option('-v, --verbose')
  .requiredOption('-i, --item <item>', 'The item to remove the tags from')
  .action(async (firstTag, cmdObj, restTagList) => {
    app.setVerbose(cmdObj.verbose);
    await app.removeTags(cmdObj.item, getArgs(firstTag, restTagList));
  });

program.parseAsync(process.argv).catch(e => console.log(e));
