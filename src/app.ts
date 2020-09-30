import path from "path";
import * as fs from "fs";
import {TagDb} from "./tagdb";
import {FindOpts, ItemType} from "./model";
import * as os from "os";

function getFullPath(item: string): string {
  return path.resolve(item);
}

function getDbPath() {
  return path.join(os.homedir(), ".config", "ltag");
}

function getDbFile() {
  return "ltag.dat";
}

function jsonToString(obj: any) {
  return JSON.stringify(obj, null, 2);
}

export class App {
  private tagDb: TagDb;
  private verbose: boolean = false;
  constructor() {
    this.tagDb = new TagDb(getDbPath(), getDbFile());
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

  async showTags(item: string): Promise<void> {
    const tagList = this.tagDb.getTagsForItem(getFullPath(item));
    if (this.verbose) {
      console.log(jsonToString(tagList));
    } else {
      tagList.forEach(i => console.log(i));
    }


  }

  async listTags(filterList: string[]): Promise<void> {
    const tagList = this.tagDb.getTags(filterList);
    if (this.verbose) {
      console.log(jsonToString(tagList));
    } else {
      Object.keys(tagList).forEach(t => console.log(t));
    }
  }

  async findMatchingTags(tagList: string[], findOpts: FindOpts): Promise<void> {
    const foundTags = this.tagDb.findMatchingItems(tagList, findOpts);
    if (!foundTags || foundTags.length == 0) {
      console.log(`No matches found for tags`);
    }

    if (this.verbose) {
      console.log(`Found matches`);
      console.log(jsonToString(foundTags));
    } else {
      foundTags.forEach(i => console.log(`${i.name}` + (i.itemType == 'file' ? '' : '/')));
    }
  }

  async removeTags(item: string, tagList: string[]) {
    const remainingTags = this.tagDb.removeTags(getFullPath(item), ...tagList);
    console.log(`Remaining tags: ${remainingTags}`);
  }
}

