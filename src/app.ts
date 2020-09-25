import path from "path";
import * as fs from "fs";
import {TagDb, ItemType} from "./tagdb";

function getFullPath(item: string): string {
  return path.resolve(item);
}

function getDbPath() {
  return "/var/tmp/ltag.json";
}

export class App {
  private tagDb: TagDb;
  private verbose: boolean = false;
  constructor() {
    this.tagDb = new TagDb(getDbPath());
  }

  setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  async addTag(item: string, tagList: string[]): Promise<void> {
    const itemPath = getFullPath(item);
    if (!fs.existsSync(itemPath)) {
      console.error(`${item} does not exist`);
      process.exit(-1);
    }

    const itemInfo = fs.lstatSync(itemPath);
    if (!itemInfo.isDirectory() && !itemInfo.isFile()) {
      console.error(`Cannot handle this type of item`);
      process.exit(-2);

    }
    let itemType:ItemType = 'file';
    if (itemInfo.isDirectory()) {
      itemType = 'directory';
    }

    const existingTags = this.tagDb.addTags(itemPath, itemType, ...tagList);
    console.log(`Tags on ${item}`);
    console.log(existingTags);
  }

  async listTags(item?: string): Promise<void> {
    if (item) {
      const itemPath = getFullPath(item);
      const tagsForItem = this.tagDb.getTagsForItem(itemPath);
      console.log(tagsForItem);
    } else {
      console.log(this.tagDb.getTags());
    }
  }

  async findMatchingTags(tagList: string[], itemType?: ItemType, searchSubString?: string): Promise<void> {
    const foundTags = this.tagDb.findMatchingItems(tagList, itemType, searchSubString);
    if (!foundTags || foundTags.length == 0) {
      console.log(`No matches found for tags`);
    }

    console.log(`Found matches`);
    console.log(JSON.stringify(foundTags, null, 2));
  }

  async removeTags(item: string, tagList: string[]) {
    const remainingTags = this.tagDb.removeTags(getFullPath(item), ...tagList);
    console.log(`Remaining tags: ${remainingTags}`);
  }
}

