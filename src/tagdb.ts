import * as fs from "fs";
import {FindOpts, ItemType, TagUsage} from "./model";

interface TaggedItem {
  name: string;
  itemType: ItemType;
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

  addTags(item: string, itemType: ItemType, ...newTagList:string[]) {
    let tagsForItem = this.data.taggedItems[item];
    if (!tagsForItem) {
      tagsForItem = {name: item, itemType: itemType, tagList:[]};
      this.data.taggedItems[item] = tagsForItem;
    }

    tagsForItem.tagList = [...new Set([...tagsForItem.tagList, ...newTagList])]
    this.save();

    return tagsForItem.tagList;
  }

  getTagsForItem(item: string): string[] {
    let tagsForItem = this.data.taggedItems[item];
    if (!tagsForItem) {
      return [];
    }

    return tagsForItem.tagList;
  }

  getTags(): TagUsage {
    const tagList: TagUsage = {};

    for (let [itemName, taggedItem] of Object.entries(this.data.taggedItems)) {
      for (let tag of taggedItem.tagList) {
        let tagUsage = tagList[tag];
        if (!tagUsage) {
          tagUsage = [];
          tagList[tag] = tagUsage;
        }

        tagUsage.push({itemName: taggedItem.name, itemType: taggedItem.itemType});
      }
    }

    return tagList;
  }

  findMatchingItems(tagsToFind: string[], {itemType, nameSubstring, tagSubstring}: FindOpts): TaggedItem[] {
    const matchingItems: TaggedItem[] = [];

    for (let [itemName, taggedItem] of Object.entries(this.data.taggedItems)) {
      let allTagsMatched = true;
      for (let tagToFind of tagsToFind) {
        if (!taggedItem.tagList.includes(tagToFind)) {
          if (tagSubstring) {
            if (!taggedItem.tagList.find(i => i.includes(tagToFind))) {
              allTagsMatched = false;
              break;
            }
          } else {
            allTagsMatched = false;
            break;
          }
        }
      }

      let isMatch = allTagsMatched;
      if (itemType && itemType != taggedItem.itemType) {
        isMatch = false;
      }

      if (nameSubstring) {
        if (!taggedItem.name.toUpperCase().includes(nameSubstring.toUpperCase())) {
          isMatch = false;
        }
      }

      if (isMatch) {
        matchingItems.push(taggedItem);
      }
    }

    return matchingItems;
  }

  removeTags(item: string, ...tagsToDelete: string[]): string[] {
    let tagsForItem = this.data.taggedItems[item];
    if (!tagsForItem) {
      return [];
    }

    tagsForItem.tagList = tagsForItem.tagList.filter((i) => !tagsToDelete.includes(i));

    this.save();
    return tagsForItem.tagList;
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
    for (let item of Object.keys(items)) {
      const taggedItem = items[item];
      const uniqueTags:Set<string> = new Set([...taggedItem.tagList]);
      taggedItem.tagList = [...uniqueTags];
    }

    this.data = loadedData;
  }
}
