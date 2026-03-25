export type ItemId = number | string

export interface ITreeItem {
  id: ItemId
  parent: ItemId | null
  label?: string
  [key: string]: unknown
}
