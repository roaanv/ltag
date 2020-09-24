import path from "path";
import * as fs from "fs";
import {TagDb} from "./tagdb";

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

    const existingTags = this.tagDb.addTags(targetPath, ...tagList);
    console.log(`Tags on ${target}`);
    console.log(existingTags);
  }

  async listTagsForTarget(target: string): Promise<void> {
    const targetPath = getFullPath(target);
    const tagsForTarget = this.tagDb.getTags(targetPath);
    console.log(tagsForTarget);
  }

  async findMatchingTags(...tagList: string[]): Promise<void> {
    const foundTags = this.tagDb.findMatchingTargets(...tagList);
    if (!foundTags || foundTags.length == 0) {
      console.log(`No matches found for tags`);
    }

    console.log(`Found matches`);
    console.log(JSON.stringify(foundTags, null, 2));
  }
}

