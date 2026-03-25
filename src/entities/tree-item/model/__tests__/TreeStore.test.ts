import { describe, it, expect, beforeEach } from 'vitest'
import { TreeStore } from '../TreeStore'
import type { ITreeItem } from '@shared/types'

const createItems = (): ITreeItem[] => [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

describe('TreeStore', () => {
  let store: TreeStore

  beforeEach(() => {
    store = new TreeStore(createItems())
  })

  describe('getAll', () => {
    it('returns all items', () => {
      const all = store.getAll()
      expect(all).toHaveLength(8)
    })

    it('returns items with correct structure', () => {
      const all = store.getAll()
      expect(all[0]).toHaveProperty('id')
      expect(all[0]).toHaveProperty('parent')
    })

    it('does not mutate original data when source array changes', () => {
      const source = createItems()
      const s = new TreeStore(source)
      source.push({ id: 999, parent: null, label: 'Extra' })
      expect(s.getAll()).toHaveLength(8)
    })
  })

  describe('getItem', () => {
    it('returns item by numeric id', () => {
      const item = store.getItem(1)
      expect(item).toBeDefined()
      expect(item!.id).toBe(1)
      expect(item!.label).toBe('Айтем 1')
    })

    it('returns item by string id', () => {
      const item = store.getItem('91064cee')
      expect(item).toBeDefined()
      expect(item!.id).toBe('91064cee')
      expect(item!.label).toBe('Айтем 2')
    })

    it('returns undefined for non-existent id', () => {
      expect(store.getItem(999)).toBeUndefined()
      expect(store.getItem('nonexistent')).toBeUndefined()
    })
  })

  describe('getChildren', () => {
    it('returns direct children of root item', () => {
      const children = store.getChildren(1)
      expect(children).toHaveLength(2)
      const ids = children.map((c) => c.id)
      expect(ids).toContain('91064cee')
      expect(ids).toContain(3)
    })

    it('returns direct children of string-id item', () => {
      const children = store.getChildren('91064cee')
      expect(children).toHaveLength(3)
      const ids = children.map((c) => c.id)
      expect(ids).toContain(4)
      expect(ids).toContain(5)
      expect(ids).toContain(6)
    })

    it('returns empty array for leaf node', () => {
      expect(store.getChildren(7)).toEqual([])
      expect(store.getChildren(3)).toEqual([])
    })

    it('returns empty array for non-existent id', () => {
      expect(store.getChildren(999)).toEqual([])
    })
  })

  describe('getAllChildren', () => {
    it('returns all descendants of root', () => {
      const all = store.getAllChildren(1)
      expect(all).toHaveLength(7)
    })

    it('returns all descendants of mid-level node', () => {
      const all = store.getAllChildren('91064cee')
      expect(all).toHaveLength(5)
      const ids = all.map((c) => c.id)
      expect(ids).toContain(4)
      expect(ids).toContain(5)
      expect(ids).toContain(6)
      expect(ids).toContain(7)
      expect(ids).toContain(8)
    })

    it('returns direct children and their nested children', () => {
      const all = store.getAllChildren(4)
      expect(all).toHaveLength(2)
      const ids = all.map((c) => c.id)
      expect(ids).toContain(7)
      expect(ids).toContain(8)
    })

    it('returns empty array for leaf node', () => {
      expect(store.getAllChildren(7)).toEqual([])
    })

    it('returns empty array for non-existent id', () => {
      expect(store.getAllChildren(999)).toEqual([])
    })
  })

  describe('getAllParents', () => {
    it('returns chain from item to root for deep node', () => {
      const parents = store.getAllParents(7)
      expect(parents).toHaveLength(4)
      expect(parents[0].id).toBe(7)
      expect(parents[1].id).toBe(4)
      expect(parents[2].id).toBe('91064cee')
      expect(parents[3].id).toBe(1)
    })

    it('returns chain from mid-level to root', () => {
      const parents = store.getAllParents(4)
      expect(parents).toHaveLength(3)
      expect(parents[0].id).toBe(4)
      expect(parents[1].id).toBe('91064cee')
      expect(parents[2].id).toBe(1)
    })

    it('returns only the item itself for root', () => {
      const parents = store.getAllParents(1)
      expect(parents).toHaveLength(1)
      expect(parents[0].id).toBe(1)
    })

    it('preserves order: first is the item, last is root', () => {
      const parents = store.getAllParents(8)
      expect(parents[0].id).toBe(8)
      expect(parents[parents.length - 1].id).toBe(1)
    })

    it('returns empty array for non-existent id', () => {
      expect(store.getAllParents(999)).toEqual([])
    })
  })

  describe('addItem', () => {
    it('adds item and makes it accessible via getItem', () => {
      const newItem: ITreeItem = { id: 9, parent: 3, label: 'Айтем 9' }
      store.addItem(newItem)
      expect(store.getItem(9)).toBe(newItem)
    })

    it('adds item to parent children list', () => {
      const newItem: ITreeItem = { id: 9, parent: 3, label: 'Айтем 9' }
      store.addItem(newItem)
      const children = store.getChildren(3)
      expect(children).toHaveLength(1)
      expect(children[0].id).toBe(9)
    })

    it('increases total item count', () => {
      store.addItem({ id: 9, parent: null, label: 'Корневой' })
      expect(store.getAll()).toHaveLength(9)
    })

    it('adds item with string id', () => {
      const newItem: ITreeItem = { id: 'abc', parent: 1, label: 'String ID' }
      store.addItem(newItem)
      expect(store.getItem('abc')).toBeDefined()
      expect(store.getChildren(1)).toContainEqual(newItem)
    })

    it('adds root item (parent: null)', () => {
      const root: ITreeItem = { id: 10, parent: null, label: 'Root 2' }
      store.addItem(root)
      expect(store.getItem(10)).toBe(root)
      expect(store.getAllParents(10)).toHaveLength(1)
    })
  })

  describe('removeItem', () => {
    it('removes a leaf item', () => {
      store.removeItem(7)
      expect(store.getItem(7)).toBeUndefined()
      expect(store.getAll()).toHaveLength(7)
    })

    it('removes item from parent children list', () => {
      store.removeItem(7)
      const children = store.getChildren(4)
      expect(children).toHaveLength(1)
      expect(children[0].id).toBe(8)
    })

    it('removes item and all its descendants', () => {
      store.removeItem('91064cee')
      expect(store.getItem('91064cee')).toBeUndefined()
      expect(store.getItem(4)).toBeUndefined()
      expect(store.getItem(5)).toBeUndefined()
      expect(store.getItem(6)).toBeUndefined()
      expect(store.getItem(7)).toBeUndefined()
      expect(store.getItem(8)).toBeUndefined()
      expect(store.getAll()).toHaveLength(2)
    })

    it('removes root and all descendants', () => {
      store.removeItem(1)
      expect(store.getAll()).toHaveLength(0)
    })

    it('does nothing for non-existent id', () => {
      store.removeItem(999)
      expect(store.getAll()).toHaveLength(8)
    })

    it('cleans up childrenMap for removed items', () => {
      store.removeItem(4)
      expect(store.getChildren(4)).toEqual([])
    })
  })

  describe('updateItem', () => {
    it('updates item label', () => {
      store.updateItem({ id: 1, parent: null, label: 'Updated' })
      expect(store.getItem(1)!.label).toBe('Updated')
    })

    it('updates item in the items array', () => {
      store.updateItem({ id: 3, parent: 1, label: 'New Label' })
      const all = store.getAll()
      const item = all.find((i) => i.id === 3)
      expect(item!.label).toBe('New Label')
    })

    it('moves item to new parent', () => {
      store.updateItem({ id: 3, parent: '91064cee', label: 'Moved' })

      const oldParentChildren = store.getChildren(1)
      expect(oldParentChildren.map((c) => c.id)).not.toContain(3)

      const newParentChildren = store.getChildren('91064cee')
      expect(newParentChildren.map((c) => c.id)).toContain(3)
    })

    it('preserves children when moving item', () => {
      store.addItem({ id: 9, parent: 3, label: 'Child of 3' })
      store.updateItem({ id: 3, parent: '91064cee', label: 'Moved' })
      expect(store.getChildren(3)).toHaveLength(1)
      expect(store.getChildren(3)[0].id).toBe(9)
    })

    it('does nothing for non-existent item', () => {
      store.updateItem({ id: 999, parent: null, label: 'Ghost' })
      expect(store.getItem(999)).toBeUndefined()
      expect(store.getAll()).toHaveLength(8)
    })

    it('handles moving to root (parent: null)', () => {
      store.updateItem({ id: 4, parent: null, label: 'Now root' })
      expect(store.getItem(4)!.parent).toBeNull()
      const rootChildren = store.getChildren('91064cee')
      expect(rootChildren.map((c) => c.id)).not.toContain(4)
    })
  })

  describe('performance: large dataset', () => {
    it('handles 10000 items efficiently', () => {
      const largeItems: ITreeItem[] = [{ id: 0, parent: null, label: 'Root' }]
      for (let i = 1; i < 10000; i++) {
        largeItems.push({
          id: i,
          parent: Math.floor(Math.random() * i),
          label: `Item ${i}`,
        })
      }

      const largeStore = new TreeStore(largeItems)

      expect(largeStore.getAll()).toHaveLength(10000)
      expect(largeStore.getItem(5000)).toBeDefined()
      expect(largeStore.getChildren(0).length).toBeGreaterThan(0)

      const parents = largeStore.getAllParents(9999)
      expect(parents.length).toBeGreaterThan(0)
      expect(parents[0].id).toBe(9999)
      expect(parents[parents.length - 1].id).toBe(0)
    })
  })
})
