<template>
  <div class="main_body">
    <div id="basetitle">DSCP Class Mapping</div>
    <div>
      <common-table header-title="DSCP Priority Mapping Settings" :first-column="['DSCP Mapping Status']">
        <template #0>
          <select v-model="status">
            <option value="1">Enabled</option>
            <option value="2">Disabled</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApplyStatus">
      </div>

      <div class="table_title">DSCP Priority Mapping Table</div>
      <div class="table-scroll">
        <el-table
          v-loading="loading"
          :data="rows"
          class="tableBox"
          stripe
          border
          style="min-width: 900px"
          :header-cell-style="pageTableHeader"
          :cell-style="pageTableCell"
        >
          <template v-for="k in 4">
            <el-table-column :key="'d' + k" label="DSCP In" min-width="90" align="center">
              <template slot-scope="scope"><span>{{ scope.row.labels[k - 1] }}</span></template>
            </el-table-column>
            <el-table-column :key="'p' + k" label="Priority" min-width="90" align="center">
              <template slot-scope="scope">
                <select
                  v-model="scope.row.vals[k - 1]"
                  class="selectInTable"
                  :class="{ disabledStyle: off }"
                  :disabled="off"
                  @change="scope.row.isAll && onAllChange(k - 1, scope.row.vals[k - 1])"
                >
                  <option v-if="scope.row.isAll" value="-1">Ignore</option>
                  <option v-for="n in 8" :key="n - 1" :value="String(n - 1)">{{ n - 1 }}</option>
                </select>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
      <div class="margin1015">
        <input type="button" class="btnOutTable" :class="{ btnDisabled: off }" :disabled="off" value="Apply" @click="onApply">
        <input type="button" class="btnOutTable" :class="{ btnDisabled: off }" :disabled="off" value="Reset to Default" @click="onReset">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'

export default {
  components: { commonTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      status: '2',
      // 可编辑性由加载到的 status 决定(同 LLDP)
      dscpOn: false,
      rows: []
    }
  },
  computed: {
    off() {
      return !this.dscpOn
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_qosDscp').then(d => {
        this.status = d.status ? '1' : '2'
        this.dscpOn = !!d.status
        const map = d.map || Array.from({ length: 64 }, () => 0)
        // All 区间行:0-15 / 16-31 / 32-47 / 48-63,默认 Ignore(-1)
        const rows = [{ isAll: true, labels: ['0-15', '16-31', '32-47', '48-63'], vals: ['-1', '-1', '-1', '-1'] }]
        // 16 数据行:第 i 行 = DSCP i / i+16 / i+32 / i+48
        for (let i = 0; i < 16; i++) {
          rows.push({
            isAll: false,
            labels: [i, i + 16, i + 32, i + 48].map(String),
            vals: [i, i + 16, i + 32, i + 48].map(x => String(map[x] != null ? map[x] : 0))
          })
        }
        this.rows = rows
      }).finally(() => { this.loading = false })
    },
    // All 区间选择变化时,把该列整段 16 个 DSCP 的优先级都设为该值
    onAllChange(col, val) {
      if (val === '-1') return
      for (let i = 1; i < this.rows.length; i++) {
        this.$set(this.rows[i].vals, col, val)
      }
    },
    onApplyStatus() {
      cgiSet('net_qosDscpStatusEdit', { status: this.status === '1' ? 1 : 0 }).then(() => this.load())
    },
    onApply() {
      // 由 16 数据行汇总回 64 项 map(第 i 行的 4 列 = DSCP i, i+16, i+32, i+48)
      const map = Array.from({ length: 64 }, () => 0)
      for (let i = 1; i < this.rows.length; i++) {
        const di = i - 1
        this.rows[i].vals.forEach((v, col) => { map[di + col * 16] = Number(v) })
      }
      cgiSet('net_qosDscpEdit', { map: map.join(',') }).then(() => this.load())
    },
    onReset() {
      cgiSet('net_qosDscpReset', { reset: 1 }).then(() => this.load())
    }
  }
}
</script>

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
</style>
