import * as fs from 'fs';
import { FindOpts, ItemType, TagUsage } from './model';
import path from 'path';

interface TaggedItem {
  name: string;
  itemType: ItemType;
  tagList: string[];
}

interface DbSchema {
  version: number;
  taggedItems: { [name: string]: TaggedItem };
}

const SCHEMA_VERSION = 1;

export class TagDb {
  private data: DbSchema = { version: SCHEMA_VERSION, taggedItems: {} };
  private dbFullPath: string;

  constructor(dbPath: string, dbFile: string) {
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    this.dbFullPath = path.join(dbPath, dbFile);
    this.load();
  }

  addTags(item: string, itemType: ItemType, newTagList: string[]) {
    let tagsForItem = this.data.taggedItems[item];
    if (!tagsForItem) {
      tagsForItem = { name: item, itemType, tagList: [] };
      this.data.taggedItems[item] = tagsForItem;
    }

    tagsForItem.tagList = [...new Set([...tagsForItem.tagList, ...newTagList])];
    this.save();

    return tagsForItem.tagList;
  }

  getTagsForItem(item: string): string[] {
    const tagsForItem = this.data.taggedItems[item];
    if (!tagsForItem) {
      return [];
    }

    return tagsForItem.tagList;
  }

  getTags(filterList: string[]): TagUsage {
    const tagList: TagUsage = {};

    for (const [itemName, taggedItem] of Object.entries(this.data.taggedItems)) {
      for (const tag of taggedItem.tagList) {
        if (filterList && filterList.length > 0) {
          const tagUpper = tag.toUpperCase();
          if (filterList.filter((f) => tagUpper.includes(f.toUpperCase())).length === 0) {
            continue;
          }
        }
        let tagUsage = tagList[tag];
        if (!tagUsage) {
          tagUsage = [];
          tagList[tag] = tagUsage;
        }

        tagUsage.push({ itemName: taggedItem.name, itemType: taggedItem.itemType });
      }
    }

    return tagList;
  }

  findMatchingItems(tagsToFind: string[], { itemType, nameSubstring, tagSubstring }: FindOpts): TaggedItem[] {
    const matchingItems: TaggedItem[] = [];

    for (const [itemName, taggedItem] of Object.entries(this.data.taggedItems)) {
      let allTagsMatched = true;
      for (const tagToFind of tagsToFind) {
        if (!taggedItem.tagList.includes(tagToFind)) {
          if (tagSubstring) {
            if (!taggedItem.tagList.find((i) => i.includes(tagToFind))) {
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
      if (itemType && itemType !== taggedItem.itemType) {
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

  removeTags(item: string, tagsToDelete: string[]): string[] {
    const tagsForItem = this.data.taggedItems[item];
    if (!tagsForItem) {
      return [];
    }

    tagsForItem.tagList = tagsForItem.tagList.filter((i) => !tagsToDelete.includes(i));
    if (tagsForItem.tagList.length === 0) {
      delete this.data.taggedItems[item];
    }

    this.save();
    return tagsForItem.tagList;
  }

  private save() {
    fs.writeFileSync(this.dbFullPath, JSON.stringify(this.data, null, 2));
  }

  private load() {
    if (!fs.existsSync(this.dbFullPath)) {
      this.data = { version: SCHEMA_VERSION, taggedItems: {} };
      return;
    }
    const loadedData: DbSchema = JSON.parse(fs.readFileSync(this.dbFullPath, 'utf8'));
    if (!loadedData.version || loadedData.version !== SCHEMA_VERSION) {
      throw new Error(`Cannot handle data file of version ${loadedData.version}`);
    }

    // Ensure tags are unique as someone might have
    // edited the physical file
    const items = loadedData.taggedItems;
    for (const item of Object.keys(items)) {
      const taggedItem = items[item];
      const uniqueTags: Set<string> = new Set([...taggedItem.tagList]);
      taggedItem.tagList = [...uniqueTags];
    }

    this.data = loadedData;
  }
}
