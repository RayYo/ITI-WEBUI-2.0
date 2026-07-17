<template>
  <div class="main_body">
    <div id="basetitle">Protocol VLAN Profile Interface</div>
    <div>
      <common-table header-title="Add New Protocol VLAN Interface" :first-column="['Port', 'Profile ID', 'VID', 'Priority']">
        <template #0>
          <select v-model="port">
            <option v-for="p in portList" :key="p" :value="String(p)">{{ p }}</option>
          </select>
        </template>
        <template #1>
          <select v-model="profileId">
            <option v-for="id in profileOptions" :key="id" :value="String(id)">{{ id }}</option>
          </select>
        </template>
        <template #2>
          <base-input v-model="vid" max-len="4" @check="onlyNum" />
          <span class="tipAfterInputBox">(1-4094)</span>
        </template>
        <template #3>
          <select v-model="priority">
            <option v-for="n in 8" :key="n - 1" :value="String(n - 1)">{{ n - 1 }}</option>
          </select>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>

      <div class="table_title">
        Interface Table
        <span class="tipInTableTitle">( Total Entries: {{ rows.length }} )</span>
      </div>
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
        <el-table-column prop="port" label="Port" min-width="150" />
        <el-table-column prop="profileId" label="Profile ID" min-width="165" />
        <el-table-column prop="vid" label="VID" min-width="165" />
        <el-table-column prop="priority" label="Priority" min-width="165" />
        <el-table-column label="Action" min-width="165">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <emu-pagination :current-page.sync="page" :page-size.sync="pageSize" :total="rows.length" />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      port: '1',
      profileId: '',
      vid: '',
      priority: '0',
      profileOptions: [],
      rows: [],
      page: 1,
      pageSize: 5
    }
  },
  computed: {
    portList() {
      const n = this.$store.getters.modelInfo('portNum') || 0
      return Array.from({ length: n }, (_, i) => i + 1)
    },
    pageRows() {
      const start = (this.page - 1) * this.pageSize
      return this.rows.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('net_protoVlanInterface').then(d => {
        this.profileOptions = d.profiles || []
        if (!this.profileId && this.profileOptions.length) this.profileId = String(this.profileOptions[0])
        this.rows = (d.list || []).map(e => ({ port: e.port, profileId: e.profileId, vid: e.vid, priority: e.priority }))
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.vid = this.vid.replace(/[^0-9]/g, '')
    },
    async onApply() {
      if (!this.profileId) { message.warnBox('Please create a Protocol VLAN Profile first.'); return }
      const v = Number(this.vid)
      if (!v || v < 1 || v > 4094) { message.warnBox('VID must be within 1-4094.'); return }
      await cgiSet('net_protoVlanInterfaceAdd', { port: this.port, profileId: this.profileId, vid: v, priority: this.priority })
      this.vid = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete Port ${row.port} / Profile ${row.profileId} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_protoVlanInterfaceDel', { port: row.port, profileId: row.profileId }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>
