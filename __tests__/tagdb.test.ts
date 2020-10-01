import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import {TagDb} from "../src/tagdb";

const TEST_DATA_STR = `
 {
  "version": 1,
  "taggedItems": {
    "/another-place/item-2019": {
      "name": "/another-place/item-2019",
      "itemType": "directory",
      "tagList": [
        "presentation",
        "cloudwarrior"
      ]
    },
    "/another-place/item-2020": {
      "name": "/another-place/item-2020",
      "itemType": "directory",
      "tagList": [
        "presentation"
      ]
    }
  }
}
`;

const TEST_DB_FILE = 'test-ltag.json';
const TEST_DB_DIR = os.tmpdir();
const TEST_DB_PATH = path.join(TEST_DB_DIR, TEST_DB_FILE);
let db:TagDb;

function readDataFromDbFile(): any {
  return JSON.parse(fs.readFileSync(TEST_DB_PATH, 'utf-8'));
}

beforeEach(()=>{
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  fs.writeFileSync(TEST_DB_PATH, TEST_DATA_STR);

  db = new TagDb(TEST_DB_DIR, TEST_DB_FILE);
});

afterEach(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

describe("add", () => {
  test ("Adding tag to new item creates new item with tag", () => {
    const itemToTest = 'some-test-item';
    const tagToTest = 'new-tag';
    db.addTags(itemToTest, "directory", tagToTest);

    const dbRaw = readDataFromDbFile();
    const taggedItem = dbRaw.taggedItems[itemToTest]
    expect(taggedItem).toBeDefined();

    const tagList = taggedItem.tagList;
    expect(tagList.length).toEqual(1);
    expect(tagList).toContain(tagToTest);
  });

  test ("Adding tag to existing item adds to the items tags", () => {
    const itemToTest = '/another-place/item-2020';
    const tagToTest = 'new-tag';
    const existingTag = 'presentation';
    db.addTags(itemToTest, "directory", tagToTest);

    const dbRaw = readDataFromDbFile();
    const taggedItem = dbRaw.taggedItems[itemToTest]
    expect(taggedItem).toBeDefined();

    const tagList = taggedItem.tagList;
    expect(tagList.length).toEqual(2);
    expect(tagList).toContain(tagToTest);
    expect(tagList).toContain(existingTag);
  });
});

describe("remove", () => {
  test ("Removing a tag from an item with only 1 tag, removes the item", () => {
    const itemToTest = '/another-place/item-2020';
    const tagToTest = 'presentation';
    db.removeTags(itemToTest, [tagToTest]);

    const dbRaw = readDataFromDbFile();
    const taggedItem = dbRaw.taggedItems[itemToTest]
    expect(taggedItem).toBeUndefined()
  });

  test ("Removing a tag from an item with multiple tags, removes the tag", () => {
    const itemToTest = '/another-place/item-2019';
    const tagToTest = 'cloudwarrior';
    const tagToRemain = 'presentation';
    db.removeTags(itemToTest, [tagToTest]);

    const dbRaw = readDataFromDbFile();
    const taggedItem = dbRaw.taggedItems[itemToTest]
    expect(taggedItem).toBeDefined();

    const tagList = taggedItem.tagList;
    expect(tagList.length).toEqual(1);
    expect(tagList).toContain(tagToRemain);
  });
});

describe("show", () => {
  test("Show tags on items", () => {
    const itemToTest = "/another-place/item-2019";
    const tagList = db.getTagsForItem(itemToTest);
    const expectedTags = ["presentation", "cloudwarrior"];

    expect(tagList.length).toEqual(2);
    expect(tagList).toEqual(expect.arrayContaining(expectedTags))
  });
});

describe("list", () => {
  test("All tags", () => {
    const tagUsage = db.getTags([]);
    const tagList = Object.keys(tagUsage);
    const expectedTags = [
      "presentation",
      "cloudwarrior"
    ];

    expect(tagList.length).toEqual(expectedTags.length);
    expect(tagList).toEqual(expect.arrayContaining(expectedTags))
    let expectedItemsForTag = tagUsage["presentation"];
    expect(expectedItemsForTag.length).toEqual(2);

    expectedItemsForTag = tagUsage["cloudwarrior"];
    expect(expectedItemsForTag.length).toEqual(1);
  });

  test("Tags with filter", () => {
    const tagUsage = db.getTags(['war']);
    const tagList = Object.keys(tagUsage);
    const expectedTags = [
      "cloudwarrior"
    ];

    expect(tagList.length).toEqual(expectedTags.length);
    expect(tagList).toEqual(expect.arrayContaining(expectedTags))
    let expectedItemsForTag = tagUsage["cloudwarrior"];
    expect(expectedItemsForTag.length).toEqual(1);
  });
});
