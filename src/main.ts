#!/usr/bin/env node
import { App } from './app';
import { Command } from 'commander';

const app = new App();
const program = new Command('ltag');

program
  .command('add <tag...>')
  .description('add tags to an item')
  .requiredOption('-i, --item <item>', 'The item to tag')
  .option('-v, --verbose')
  .action(async (tagList, cmdObj) => {
    app.setVerbose(cmdObj.verbose);

    await app.addTag(cmdObj.item, tagList);
  });

program
  .command('show <item>')
  .description('show the tags for an item')
  .option('-v, --verbose')
  .action(async (item, cmdObj) => {
    app.setVerbose(cmdObj.verbose);
    await app.showTags(item);
  });

program
  .command('list')
  .description('list all the tags')
  .option('-v, --verbose')
  .option('-f, --filter <filter...>', 'Substring filter of tags')
  .action(async (cmdObj) => {
    app.setVerbose(cmdObj.verbose);
    await app.listTags(cmdObj.filter);
  });

program
  .command('find <tag...>')
  .description('find items that have all the specified tags')
  .option('-v, --verbose')
  .option('-t, --type <type>', 'Search for <file> or <dir>')
  .option('-d, --dir', 'Search for directories')
  .option('-i, --item-substring <text>', 'Item must have substring')
  .option('-p, --partial', 'Partial (substring) match on tags')
  .action(async (tagsToFind, cmdObj) => {
    if (cmdObj.type) {
      if (cmdObj.type !== 'file' && cmdObj.type !== 'dir') {
        console.error(`Invalid type "${cmdObj.type}". Type can either be "file" or "dir"`);
        process.exit(-3);
      }

      if (cmdObj.type === 'dir') {
        cmdObj.type = 'directory';
      }
    }
    app.setVerbose(cmdObj.verbose);
    await app.findMatchingTags(tagsToFind, {
      tagSubstring: cmdObj.partial,
      nameSubstring: cmdObj.itemSubstring,
      itemType: cmdObj.type,
    });
  });

program
  .command('remove <tag...>')
  .description('remove tags from item')
  .option('-v, --verbose')
  .requiredOption('-i, --item <item>', 'The item to remove the tags from')
  .action(async (tagList, cmdObj) => {
    app.setVerbose(cmdObj.verbose);
    await app.removeTags(cmdObj.item, tagList);
  });

program.parseAsync(process.argv).catch((e) => console.log(e));
