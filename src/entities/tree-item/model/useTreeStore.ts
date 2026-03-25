import { shallowRef } from 'vue'
import { TreeStore } from './TreeStore'
import type { ITreeItem, ItemId } from '@shared/types'

const initialItems: ITreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

const store = new TreeStore(initialItems)
const items = shallowRef<ITreeItem[]>([...store.getAll()])

function refresh() {
  items.value = [...store.getAll()]
}

export function useTreeStore() {
  function addItem(item: ITreeItem) {
    store.addItem(item)
    refresh()
  }

  function removeItem(id: ItemId) {
    store.removeItem(id)
    refresh()
  }

  function updateItem(item: ITreeItem) {
    store.updateItem(item)
    refresh()
  }

  function hasChildren(id: ItemId): boolean {
    return store.getChildren(id).length > 0
  }

  return {
    store,
    items,
    addItem,
    removeItem,
    updateItem,
    hasChildren,
  }
}
