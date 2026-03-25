<script setup lang="ts">
import { ref, watch, computed, useTemplateRef } from 'vue'
import type { ITreeItem, ItemId } from '@shared/types'

const props = defineProps<{
  editItem?: ITreeItem | null
  allItems: ITreeItem[]
}>()

const emit = defineEmits<{
  add: [item: ITreeItem]
  update: [item: ITreeItem]
  remove: [id: ItemId]
  cancel: []
}>()

const isEditing = computed(() => !!props.editItem)

const formId = ref<string>('')
const formParent = ref<string>('')
const formLabel = ref<string>('')

const parentRef = useTemplateRef<HTMLSelectElement>('parentRef')

const ROOT_VALUE = '__root__'

watch(
  () => props.editItem,
  (item) => {
    if (item) {
      formId.value = String(item.id)
      formParent.value = item.parent !== null ? String(item.parent) : ROOT_VALUE
      formLabel.value = String(item.label ?? '')
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function resetForm() {
  formId.value = ''
  formParent.value = ''
  formLabel.value = ''
}

function parseId(value: string): ItemId {
  const num = Number(value)
  return Number.isFinite(num) && String(num) === value ? num : value
}

function handleSubmit() {
  if (!formId.value.trim() || !formLabel.value.trim() || !formParent.value) return

  const parentValue = formParent.value === ROOT_VALUE ? null : parseId(formParent.value.trim())

  const item: ITreeItem = {
    id: parseId(formId.value.trim()),
    parent: parentValue,
    label: formLabel.value.trim(),
  }

  if (isEditing.value) {
    emit('update', item)
  } else {
    emit('add', item)
  }

  resetForm()
}

function handleDelete() {
  if (props.editItem) {
    emit('remove', props.editItem.id)
    resetForm()
  }
}

function handleCancel() {
  emit('cancel')
  resetForm()
}

function focusParent() {
  parentRef.value?.focus()
}
</script>

<template>
  <form class="item-form" @submit.prevent="handleSubmit">
    <h3 class="item-form__title">
      {{ isEditing ? 'Редактировать элемент' : 'Добавить элемент' }}
    </h3>

    <div class="item-form__fields">
      <div class="item-form__field">
        <label class="item-form__label" for="form-id">ID</label>
        <input
          id="form-id"
          v-model="formId"
          class="item-form__input"
          type="text"
          placeholder="Введите ID"
          :disabled="isEditing"
          required
          @keydown.enter.prevent="focusParent"
        />
      </div>

      <div class="item-form__field">
        <label class="item-form__label" for="form-parent">Parent</label>
        <select id="form-parent" ref="parentRef" v-model="formParent" class="item-form__input" required>
          <option value="" disabled>Выберите родителя</option>
          <option value="__root__">Нет (корневой)</option>
          <option v-for="item in allItems" :key="String(item.id)" :value="String(item.id)">
            {{ item.label || item.id }}
          </option>
        </select>
      </div>

      <div class="item-form__field">
        <label class="item-form__label" for="form-label">Label</label>
        <input
          id="form-label"
          v-model="formLabel"
          class="item-form__input"
          type="text"
          placeholder="Введите label"
          required
        />
      </div>
    </div>

    <div class="item-form__actions">
      <button type="submit" class="item-form__btn item-form__btn--primary">
        {{ isEditing ? 'Сохранить' : 'Добавить' }}
      </button>
      <button v-if="isEditing" type="button" class="item-form__btn item-form__btn--danger" @click="handleDelete">
        Удалить
      </button>
      <button v-if="isEditing" type="button" class="item-form__btn item-form__btn--secondary" @click="handleCancel">
        Отмена
      </button>
    </div>
  </form>
</template>

<style lang="scss">
.item-form {
  background: $color-bg-white;
  border: 1px solid $color-border;
  border-radius: $border-radius-lg;
  padding: 20px;

  &__title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: $color-text;
  }

  &__fields {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 150px;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: $color-text-secondary;
  }

  &__input {
    padding: 8px 12px;
    border: 1px solid $color-border;
    border-radius: $border-radius;
    font-size: 14px;
    color: $color-text;
    background: $color-bg-white;
    transition: border-color $transition-fast;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px $color-primary-focus-shadow;
    }

    &:disabled {
      background: $color-bg;
      color: $color-text-disabled;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__btn {
    padding: 8px 16px;
    border: none;
    border-radius: $border-radius;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color $transition-fast;

    &--primary {
      background: $color-primary;
      color: $color-bg-white;

      &:hover {
        background: $color-primary-hover;
      }
    }

    &--danger {
      background: $color-danger;
      color: $color-bg-white;

      &:hover {
        background: $color-danger-hover;
      }
    }

    &--secondary {
      background: $color-secondary;
      color: $color-text-secondary;

      &:hover {
        background: $color-secondary-hover;
      }
    }
  }
}
</style>
