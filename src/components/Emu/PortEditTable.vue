<template>
  <div>
    <div v-if="title" class="table_title">{{ title }}</div>
    <div class="table-scroll">
      <el-table
        :data="rows"
        class="tableBox port-edit-table"
        stripe
        border
        :header-cell-style="headerCellStyle || darkTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop || col.label"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
        >
          <template slot-scope="scope">
            <!-- 行级 Apply(禁用时保持 #3398dc 仅降透明度:btnDisabled) -->
            <input
              v-if="col.type === 'action'"
              type="button"
              class="btnInTable"
              :class="{ btnDisabled: disabled }"
              value="Apply"
              :disabled="disabled"
              @click="$emit('apply', scope.row)"
            >
            <!-- 下拉:整格宽(selectInTable);禁用底色 #e3e3e3(disabledStyle) -->
            <select
              v-else-if="col.type === 'select'"
              v-model="scope.row[col.prop]"
              class="selectInTable"
              :class="{ disabledStyle: disabled }"
              :disabled="disabled || (col.readonlyAll && scope.row.port === 'All')"
            >
              <option
                v-if="scope.row.port === 'All' && col.allExtra"
                :value="col.allExtra.value"
              >{{ col.allExtra.label }}</option>
              <option v-for="o in col.options" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
            <!-- 文本输入:baseInput;禁用底色 #e3e3e3(disabledStyle) -->
            <input
              v-else-if="col.type === 'input'"
              v-model="scope.row[col.prop]"
              type="text"
              class="baseInput"
              :class="{ disabledStyle: disabled }"
              :maxlength="col.maxlength || 32"
              :disabled="disabled"
            >
            <!-- 纯展示;All 行无值时显示 '-' -->
            <span v-else>{{ displayText(scope.row, col) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { darkTableHeader, pageTableCell } from '@/utils/emu'

export default {
  name: 'PortEditTable',
  props: {
    // 列定义:{ prop, label, width, type: 'text'|'select'|'input'|'action',
    //          options:[{value,label}], allExtra:{value,label}, maxlength }
    columns: { type: Array, required: true, default: () => [] },
    // 行数据(第一行通常为 { port:'All', ... })
    rows: { type: Array, required: true, default: () => [] },
    minWidth: { type: String, default: '600px' },
    title: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    // 表头样式:默认深灰底白字(darkTableHeader);可传 pageTableHeader 等覆盖
    headerCellStyle: { type: Object, default: null }
  },
  data() {
    return { darkTableHeader, pageTableCell }
  },
  methods: {
    displayText(row, col) {
      const v = row[col.prop]
      return v === '' || v === undefined || v === null ? '-' : v
    }
  }
}
</script>

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
/* 原版 .tableBox td 无内边距,由控件自身 26px 高度决定行高 */
.port-edit-table ::v-deep td.el-table__cell {
  padding: 0 !important;
}
</style>
