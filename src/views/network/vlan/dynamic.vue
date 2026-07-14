<template>
  <div class="main_body">
    <div id="basetitle">Dynamic Forwarding Table</div>
    <div>
      <common-table header-title="Dynamic Forwarding Table Settings" :first-column="['Port']">
        <template #0>
          <select v-model="port">
            <option value="0">All</option>
            <option v-for="p in portList" :key="p" :value="p">{{ p }}</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Refresh" @click="load">
      </div>
      <div class="form">
        <div class="table_title">Dynamic Forwarding Table</div>
        <el-table
          v-loading="loading"
          :data="pageRows"
          class="tableBox"
          stripe
          border
          empty-text="< < Table is empty > >"
          :header-cell-style="pageTableHeader"
          :cell-style="pageTableCell"
        >
          <el-table-column prop="index" label="Index" min-width="100" />
          <el-table-column prop="vid" label="VID" min-width="60" />
          <el-table-column prop="port" label="Port" min-width="60" />
          <el-table-column prop="mac" label="MAC Address" min-width="140" />
          <el-table-column prop="type" label="Type" min-width="80" />
        </el-table>
        <el-pagination
          :current-page.sync="curPage"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 40]"
          :total="rows.length"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'

export default {
  components: { commonTable },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      port: '0',
      allRows: [],
      curPage: 1,
      pageSize: 20
    }
  },
  computed: {
    portList() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
    },
    // 端口过滤在前端做(cgi 返回全量,mock/real 响应形状一致)
    rows() {
      const p = Number(this.port) || 0
      return p ? this.allRows.filter(r => r.port === p) : this.allRows
    },
    pageRows() {
      const start = (this.curPage - 1) * this.pageSize
      return this.rows.slice(start, start + this.pageSize)
    }
  },
  watch: {
    port() { this.curPage = 1 }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_vlanDynamic').then(d => {
        this.allRows = d.list || []
        this.curPage = 1
      }).finally(() => { this.loading = false })
    }
  }
}
</script>
