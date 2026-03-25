import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ItemForm from '../ItemForm.vue'
import type { ITreeItem } from '@shared/types'

const allItems: ITreeItem[] = [
  { id: 1, parent: null, label: 'Элемент 1' },
  { id: 2, parent: 1, label: 'Элемент 2' },
]

const ROOT_VALUE = '__root__'

async function fillForm(wrapper: ReturnType<typeof mount>, fields: { id?: string; parent?: string; label?: string }) {
  if (fields.id != null) await wrapper.find('#form-id').setValue(fields.id)
  if (fields.parent != null) await wrapper.find('#form-parent').setValue(fields.parent)
  if (fields.label != null) await wrapper.find('#form-label').setValue(fields.label)
}

describe('ItemForm', () => {
  it('renders in add mode by default', () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })
    expect(wrapper.find('.item-form__title').text()).toBe('Добавить элемент')
    expect(wrapper.find('.item-form__btn--primary').text()).toBe('Добавить')
  })

  it('renders in edit mode when editItem is provided', () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: allItems[0] },
    })
    expect(wrapper.find('.item-form__title').text()).toBe('Редактировать элемент')
    expect(wrapper.find('.item-form__btn--primary').text()).toBe('Сохранить')
  })

  it('shows delete and cancel buttons only in edit mode', () => {
    const addWrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })
    expect(addWrapper.find('.item-form__btn--danger').exists()).toBe(false)
    expect(addWrapper.find('.item-form__btn--secondary').exists()).toBe(false)

    const editWrapper = mount(ItemForm, {
      props: { allItems, editItem: allItems[0] },
    })
    expect(editWrapper.find('.item-form__btn--danger').exists()).toBe(true)
    expect(editWrapper.find('.item-form__btn--secondary').exists()).toBe(true)
  })

  it('disables ID field in edit mode', () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: allItems[0] },
    })
    const idInput = wrapper.find('#form-id')
    expect((idInput.element as HTMLInputElement).disabled).toBe(true)
  })

  it('emits add event on submit in add mode', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })

    await fillForm(wrapper, { id: '10', parent: ROOT_VALUE, label: 'New Item' })
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('add')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual({
      id: 10,
      parent: null,
      label: 'New Item',
    })
  })

  it('emits update event on submit in edit mode', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: allItems[0] },
    })

    await wrapper.find('#form-label').setValue('Updated Label')
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('update')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({
      id: 1,
      label: 'Updated Label',
    })
  })

  it('emits remove event when delete button clicked', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: allItems[0] },
    })

    await wrapper.find('.item-form__btn--danger').trigger('click')

    const emitted = wrapper.emitted('remove')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toBe(1)
  })

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: allItems[0] },
    })

    await wrapper.find('.item-form__btn--secondary').trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('populates parent select with all items plus root and placeholder', () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })

    const options = wrapper.findAll('#form-parent option')
    expect(options).toHaveLength(4) // placeholder + "Нет (корневой)" + 2 items
  })

  it('parses numeric ID correctly', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })

    await fillForm(wrapper, { id: '42', parent: ROOT_VALUE, label: 'Test' })
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('add')
    expect(emitted![0][0]).toMatchObject({ id: 42 })
  })

  it('preserves string ID when not a number', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })

    await fillForm(wrapper, { id: 'abc-123', parent: ROOT_VALUE, label: 'Test' })
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('add')
    expect(emitted![0][0]).toMatchObject({ id: 'abc-123' })
  })

  it('does not emit add when label is empty', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })

    await fillForm(wrapper, { id: '10', parent: ROOT_VALUE, label: '' })
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add')).toBeFalsy()
  })

  it('does not emit add when parent is not selected', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })

    await fillForm(wrapper, { id: '10', label: 'Test' })
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add')).toBeFalsy()
  })

  it('moves focus from ID to Parent on Enter', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
      attachTo: document.body,
    })

    const idInput = wrapper.find('#form-id')
    await idInput.trigger('keydown.enter')

    expect(document.activeElement).toBe(wrapper.find('#form-parent').element)
    wrapper.unmount()
  })

  it('sets parent to specific item when selected', async () => {
    const wrapper = mount(ItemForm, {
      props: { allItems, editItem: null },
    })

    await fillForm(wrapper, { id: '10', parent: '1', label: 'Child' })
    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('add')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({
      id: 10,
      parent: 1,
      label: 'Child',
    })
  })
})
