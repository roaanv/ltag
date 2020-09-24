import path from "path";
import * as fs from "fs";
import {TargetDoesNotExistError} from "./error";

function getFullPath(target: string): string {
  return path.resolve(target);
}

export class App {
  async addTag(target: string, tagList: string[], verbose:boolean = false): Promise<void> {
    const targetPath = getFullPath(target);
    if (!fs.existsSync(targetPath)) {
      console.error(`${target} does not exist`);
      process.exit(-1);
    }
  }
}

