<script setup lang="ts">
import { ref } from 'vue'
import { TreeTable } from '@widgets/tree-table'
import { ItemForm } from '@features/manage-items'
import { useTreeStore } from '@entities/tree-item'
import type { ITreeItem, ItemId } from '@shared/types'

const { items, addItem, removeItem, updateItem } = useTreeStore()

const selectedItem = ref<ITreeItem | null>(null)

function onSelect(item: ITreeItem | null) {
  selectedItem.value = item
}

function onAdd(item: ITreeItem) {
  addItem(item)
  selectedItem.value = null
}

function onUpdate(item: ITreeItem) {
  updateItem(item)
  selectedItem.value = null
}

function onRemove(id: ItemId) {
  removeItem(id)
  selectedItem.value = null
}

function onCancel() {
  selectedItem.value = null
}
</script>

<template>
  <div class="home-page">
    <header class="home-page__header">
      <h1 class="home-page__title">MStroy TreeStore</h1>
    </header>

    <section class="home-page__form">
      <ItemForm
        :edit-item="selectedItem"
        :all-items="items"
        @add="onAdd"
        @update="onUpdate"
        @remove="onRemove"
        @cancel="onCancel"
      />
    </section>

    <section class="home-page__table">
      <TreeTable @select="onSelect" />
    </section>
  </div>
</template>

<style lang="scss">
.home-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__header {
    text-align: center;
  }

  &__title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: $color-text;
  }

  &__form,
  &__table {
    width: 100%;
  }
}
</style>
