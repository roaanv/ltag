import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import {TagDb} from "../src/tagdb";

const TEST_DATA_STR = `
 {
  "version": 1,
  "taggedItems": {
    "/somedir/content-radar": {
      "name": "/somedir/content-radar",
      "itemType": "directory",
      "tagList": [
        "forge-app"
      ]
    },
    "/someplace/connect-service": {
      "name": "/someplace/connect-service",
      "itemType": "directory",
      "tagList": [
        "code",
        "ecosystem"
      ]
    },
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
        "presenetation"
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
    const existingTag = 'presenetation';
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
    const tagToTest = 'presenetation';
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
