export type ItemType = 'directory' | 'file';

export interface FindOpts {
  nameSubstring?: string;
  tagSubstring?: boolean;
  itemType?: ItemType;
}

export interface ItemDetail {
  itemName: string;
  itemType: ItemType;
}

export type TagUsage = {[tag:string]: ItemDetail[]};
