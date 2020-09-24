import * as fs from "fs";

export interface ItemRow {
  tagList: string[];
}

export type ItemList = {[target:string]: ItemRow};

export class TagDb {
  private data: ItemList = {};

  constructor(private dbPath: string) {
    this.load();
  }

  addTags(target: string, ...newTagList:string[]) {
    let tagsForTarget = this.data[target];
    if (!tagsForTarget) {
      tagsForTarget = {tagList:[]};
      this.data[target] = tagsForTarget;
    }

    tagsForTarget.tagList = [...new Set([...tagsForTarget.tagList, ...newTagList])]
    this.save();

    return tagsForTarget.tagList;
  }

  getTags(target: string): string[] {
    let tagsForTarget = this.data[target];
    if (!tagsForTarget) {
      return [];
    }

    return tagsForTarget.tagList;
  }

  findMatchingTargets(...tagsToFind: string[]): string[] {
    const matchingTargets: string[] = [];

    for (let [target, targetTags] of Object.entries(this.data)) {
      let allMatched = true;
      for (let tagToFind of tagsToFind) {
        if (!targetTags.tagList.includes(tagToFind)) {
          console.log(`Did not find "${tagToFind}" in "${JSON.stringify(targetTags.tagList)}"`);
          allMatched = false;
          break;
        }
      }

      if (allMatched) {
        matchingTargets.push(target);
      }
    }

    return matchingTargets;
  }

  removeTags(target: string, ...tagsToDelete: string[]): string[] {
    let tagsForTarget = this.data[target];
    if (!tagsForTarget) {
      return [];
    }

    tagsForTarget.tagList = tagsForTarget.tagList.filter((i) => !tagsToDelete.includes(i));

    this.save();
    return tagsForTarget.tagList;
  }

  private save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  private load() {
    if (!fs.existsSync(this.dbPath)) {
      this.data = {};
      return;
    }
    const loadedData:ItemList = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));

    // Ensure tags are unique as someone might have
    // edited the physical file
    for (let target of Object.keys(loadedData)) {
      const tags = loadedData[target];
      const uniqueTags:Set<string> = new Set([...tags.tagList]);
      this.data[target] = {
        tagList: [...uniqueTags]
      }
    }
  }
}
