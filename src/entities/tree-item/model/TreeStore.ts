import type { ITreeItem, ItemId } from '@shared/types'

export class TreeStore {
  private items: ITreeItem[]
  private readonly itemMap = new Map<ItemId, ITreeItem>()
  private readonly childrenMap = new Map<ItemId | null, ITreeItem[]>()

  constructor(items: ITreeItem[]) {
    this.items = [...items]
    this.buildIndexes()
  }

  private buildIndexes(): void {
    this.itemMap.clear()
    this.childrenMap.clear()

    for (const item of this.items) {
      this.itemMap.set(item.id, item)

      const children = this.childrenMap.get(item.parent)
      if (children) {
        children.push(item)
      } else {
        this.childrenMap.set(item.parent, [item])
      }
    }
  }

  getAll(): ITreeItem[] {
    return this.items
  }

  getItem(id: ItemId): ITreeItem | undefined {
    return this.itemMap.get(id)
  }

  getChildren(id: ItemId): ITreeItem[] {
    return this.childrenMap.get(id) ?? []
  }

  getAllChildren(id: ItemId): ITreeItem[] {
    const result: ITreeItem[] = []
    const queue = this.getChildren(id).slice()
    let i = 0

    while (i < queue.length) {
      const child = queue[i++]
      result.push(child)
      const grandChildren = this.childrenMap.get(child.id)
      if (grandChildren) {
        for (const gc of grandChildren) {
          queue.push(gc)
        }
      }
    }

    return result
  }

  getAllParents(id: ItemId): ITreeItem[] {
    const result: ITreeItem[] = []
    let current = this.itemMap.get(id)

    while (current) {
      result.push(current)
      if (current.parent === null) break
      current = this.itemMap.get(current.parent)
    }

    return result
  }

  addItem(item: ITreeItem): void {
    this.items.push(item)
    this.itemMap.set(item.id, item)

    const children = this.childrenMap.get(item.parent)
    if (children) {
      children.push(item)
    } else {
      this.childrenMap.set(item.parent, [item])
    }
  }

  removeItem(id: ItemId): void {
    const item = this.itemMap.get(id)
    if (!item) return

    const allChildren = this.getAllChildren(id)
    const idsToRemove = new Set<ItemId>([id])
    for (const child of allChildren) {
      idsToRemove.add(child.id)
    }

    this.items = this.items.filter((it) => !idsToRemove.has(it.id))

    const siblings = this.childrenMap.get(item.parent)
    if (siblings) {
      const idx = siblings.indexOf(item)
      if (idx !== -1) siblings.splice(idx, 1)
    }

    for (const removeId of idsToRemove) {
      this.itemMap.delete(removeId)
      this.childrenMap.delete(removeId)
    }
  }

  updateItem(updatedItem: ITreeItem): void {
    const existing = this.itemMap.get(updatedItem.id)
    if (!existing) return

    const oldParent = existing.parent
    const newParent = updatedItem.parent

    const idx = this.items.indexOf(existing)
    if (idx !== -1) {
      this.items[idx] = updatedItem
    }

    this.itemMap.set(updatedItem.id, updatedItem)

    if (oldParent !== newParent) {
      const oldSiblings = this.childrenMap.get(oldParent)
      if (oldSiblings) {
        const oldIdx = oldSiblings.indexOf(existing)
        if (oldIdx !== -1) oldSiblings.splice(oldIdx, 1)
      }

      const newSiblings = this.childrenMap.get(newParent)
      if (newSiblings) {
        newSiblings.push(updatedItem)
      } else {
        this.childrenMap.set(newParent, [updatedItem])
      }
    } else {
      const siblings = this.childrenMap.get(oldParent)
      if (siblings) {
        const sibIdx = siblings.indexOf(existing)
        if (sibIdx !== -1) siblings[sibIdx] = updatedItem
      }
    }
  }
}
