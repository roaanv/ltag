export type ItemType = 'directory' | 'file';

export interface FindOpts {
  nameSubstring?: string;
  tagSubstring?: boolean;
  itemType?: ItemType;
}
