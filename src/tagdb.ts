import * as fs from "fs";

export type TargetType = 'directory' | 'file';

interface TaggedItem {
  name: string;
  itemType: TargetType;
  tagList: string[];
}

interface DbSchema {
  version: number;
  taggedItems: {[name: string]: TaggedItem};
}

const SCHEMA_VERSION = 1;

export class TagDb {
  private data: DbSchema = {version: SCHEMA_VERSION, taggedItems:{}};

  constructor(private dbPath: string) {
    this.load();
  }

  addTags(target: string, targetType: TargetType, ...newTagList:string[]) {
    let tagsForTarget = this.data.taggedItems[target];
    if (!tagsForTarget) {
      tagsForTarget = {name: target, itemType: targetType, tagList:[]};
      this.data.taggedItems[target] = tagsForTarget;
    }

    tagsForTarget.tagList = [...new Set([...tagsForTarget.tagList, ...newTagList])]
    this.save();

    return tagsForTarget.tagList;
  }

  getTags(target: string): string[] {
    let tagsForTarget = this.data.taggedItems[target];
    if (!tagsForTarget) {
      return [];
    }

    return tagsForTarget.tagList;
  }

  findMatchingTargets(...tagsToFind: string[]): TaggedItem[] {
    const matchingItems: TaggedItem[] = [];

    for (let [itemName, taggedItem] of Object.entries(this.data.taggedItems)) {
      let allMatched = true;
      for (let tagToFind of tagsToFind) {
        if (!taggedItem.tagList.includes(tagToFind)) {
          console.log(`Did not find "${tagToFind}" in "${JSON.stringify(taggedItem.tagList)}"`);
          allMatched = false;
          break;
        }
      }

      if (allMatched) {
        matchingItems.push(taggedItem);
      }
    }

    return matchingItems;
  }

  removeTags(target: string, ...tagsToDelete: string[]): string[] {
    let tagsForTarget = this.data.taggedItems[target];
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
      this.data = {version: SCHEMA_VERSION, taggedItems:{}};
      return;
    }
    const loadedData:DbSchema = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
    if (!loadedData.version || loadedData.version != SCHEMA_VERSION) {
      throw new Error(`Cannot handle data file of version ${loadedData.version}`);
    }

    // Ensure tags are unique as someone might have
    // edited the physical file
    const items = loadedData.taggedItems;
    for (let target of Object.keys(items)) {
      const taggedItem = items[target];
      const uniqueTags:Set<string> = new Set([...taggedItem.tagList]);
      taggedItem.tagList = [...uniqueTags];
    }

    this.data = loadedData;
  }
}
