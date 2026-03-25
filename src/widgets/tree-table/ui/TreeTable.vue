<script setup lang="ts">
import { ref, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import {
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GetRowIdParams,
  type ValueGetterParams,
  type SelectionChangedEvent,
  type GridReadyEvent,
  type GridApi,
} from 'ag-grid-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'

import { useTreeStore } from '@entities/tree-item'
import type { ITreeItem } from '@shared/types'

ModuleRegistry.registerModules([AllEnterpriseModule])

const theme = themeQuartz

const emit = defineEmits<{
  select: [item: ITreeItem | null]
}>()

const { items, store } = useTreeStore()
const gridApi = ref<GridApi | null>(null)

function toGridRows(data: ITreeItem[]) {
  return data.map((item) => ({
    ...item,
    _gridParentId: item.parent != null ? String(item.parent) : null,
  }))
}

const columnDefs = ref<ColDef[]>([
  {
    headerName: '№ п/п',
    valueGetter: (params: ValueGetterParams) => (params.node?.rowIndex != null ? params.node.rowIndex + 1 : ''),
    width: 90,
    suppressSizeToFit: true,
  },
  {
    headerName: 'ID',
    valueGetter: (params: ValueGetterParams) => (params.data ? String(params.data.id) : ''),
    width: 140,
  },
  {
    headerName: 'Категория',
    valueGetter: (params: ValueGetterParams) => {
      if (!params.data) return ''
      return store.getChildren(params.data.id).length > 0 ? 'Группа' : 'Элемент'
    },
    width: 120,
  },
])

const autoGroupColumnDef = ref<ColDef>({
  headerName: 'Label',
  field: 'label',
  minWidth: 250,
  flex: 1,
  cellRendererParams: {
    suppressCount: true,
  },
})

const defaultColDef = ref<ColDef>({
  sortable: false,
  filter: false,
})

const getRowId = (params: GetRowIdParams) => String(params.data.id)

const initialRowData = toGridRows(items.value)

watch(items, (newItems) => {
  if (gridApi.value) {
    gridApi.value.setGridOption('rowData', toGridRows(newItems))
  }
})

function onGridReady(params: GridReadyEvent) {
  gridApi.value = params.api
  params.api.sizeColumnsToFit()
}

function onSelectionChanged(event: SelectionChangedEvent) {
  const selected = event.api.getSelectedRows()
  emit('select', selected.length > 0 ? (selected[0] as ITreeItem) : null)
}

defineExpose({ gridApi })
</script>

<template>
  <div class="tree-table">
    <AgGridVue
      style="height: 100%"
      :theme="theme"
      :row-data="initialRowData"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :auto-group-column-def="autoGroupColumnDef"
      :tree-data="true"
      tree-data-parent-id-field="_gridParentId"
      :get-row-id="getRowId"
      :group-default-expanded="-1"
      :animate-rows="true"
      :row-selection="{ mode: 'singleRow', checkboxes: false }"
      @grid-ready="onGridReady"
      @selection-changed="onSelectionChanged"
    />
  </div>
</template>

<style lang="scss">
.tree-table {
  width: 100%;
  height: 500px;
}
</style>
