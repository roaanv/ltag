import path from "path";
import * as fs from "fs";
import {TagDb, TargetType} from "./tagdb";

function getFullPath(target: string): string {
  return path.resolve(target);
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

  async addTag(target: string, tagList: string[]): Promise<void> {
    const targetPath = getFullPath(target);
    if (!fs.existsSync(targetPath)) {
      console.error(`${target} does not exist`);
      process.exit(-1);
    }

    const targetInfo = fs.lstatSync(targetPath);
    if (!targetInfo.isDirectory() && !targetInfo.isFile()) {
      console.error(`Cannot handle this type of item`);
      process.exit(-2);

    }
    let targetType:TargetType = 'file';
    if (targetInfo.isDirectory()) {
      targetType = 'directory';
    }

    const existingTags = this.tagDb.addTags(targetPath, targetType, ...tagList);
    console.log(`Tags on ${target}`);
    console.log(existingTags);
  }

  async listTags(target?: string): Promise<void> {
    if (target) {
      const targetPath = getFullPath(target);
      const tagsForTarget = this.tagDb.getTagsForItem(targetPath);
      console.log(tagsForTarget);
    } else {
      console.log(this.tagDb.getTags());
    }
  }

  async findMatchingTags(tagList: string[]): Promise<void> {
    const foundTags = this.tagDb.findMatchingItems(...tagList);
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

