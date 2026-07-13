<template>
  <div>
    <div v-if="title" class="table_title">{{ title }}</div>
    <div class="table-scroll">
      <el-table
        :data="rows"
        class="tableBox port-edit-table"
        :style="{ minWidth: minWidth }"
        stripe
        border
        :header-cell-style="darkTableHeader"
        :cell-style="pageTableCell"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop || col.label"
          :label="col.label"
          :width="col.width"
        >
          <template slot-scope="scope">
            <!-- 行级 Apply -->
            <input
              v-if="col.type === 'action'"
              type="button"
              class="btnInTable"
              value="Apply"
              :disabled="disabled"
              @click="$emit('apply', scope.row)"
            >
            <!-- 下拉:All 行可带额外的 Ignore 项 -->
            <select
              v-else-if="col.type === 'select'"
              v-model="scope.row[col.prop]"
              :disabled="disabled || (col.readonlyAll && scope.row.port === 'All')"
            >
              <option
                v-if="scope.row.port === 'All' && col.allExtra"
                :value="col.allExtra.value"
              >{{ col.allExtra.label }}</option>
              <option v-for="o in col.options" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
            <!-- 文本输入 -->
            <input
              v-else-if="col.type === 'input'"
              v-model="scope.row[col.prop]"
              type="text"
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
    disabled: { type: Boolean, default: false }
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
/* 表格单元格内的原生控件撑满(与原版一致:整格宽的下拉/输入) */
.port-edit-table ::v-deep td select,
.port-edit-table ::v-deep td input[type='text'] {
  width: 90%;
  max-width: 260px;
  height: 26px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 0;
  color: #606266;
  background-color: #fff;
  font-size: 14px;
}
.port-edit-table ::v-deep td select:disabled,
.port-edit-table ::v-deep td input[type='text']:disabled {
  background-color: #f5f7fa;
  color: #c0c4cc;
}
</style>
