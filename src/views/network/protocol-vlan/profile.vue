<template>
  <div class="main_body">
    <div id="basetitle">Protocol VLAN Profile</div>
    <div>
      <common-table header-title="Add Protocol VLAN Profile" :first-column="['Profile ID', 'Frame Type', 'Ether Type']">
        <template #0>
          <base-input v-model="profileId" max-len="2" @check="onlyNum" />
          <span class="tipAfterInputBox">(1-8)</span>
        </template>
        <template #1>
          <select v-model="frameType">
            <option v-for="o in FRAME_TYPE" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </template>
        <template #2>
          <base-input v-model="etherType" max-len="4" />
          <span class="tipAfterInputBox">(0000-FFFF)</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>

      <div class="table_title">
        Profile Table
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
        <el-table-column prop="id" label="Profile ID" min-width="180" />
        <el-table-column prop="frameTypeLabel" label="Frame Type" min-width="180" />
        <el-table-column prop="etherType" label="Ether Type" min-width="195" />
        <el-table-column label="Action" min-width="180">
          <template slot-scope="scope">
            <input type="button" class="btnInTable" value="Delete" @click="onDelete(scope.row)">
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="page"
        :page-size.sync="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 20, 40]"
        :total="rows.length"
      />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import message from '@/utils/message'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'

const FRAME_TYPE = [
  { value: '1', label: 'Ethernet2' },
  { value: '2', label: 'SNAP' },
  { value: '3', label: 'LLC' }
]

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      FRAME_TYPE,
      profileId: '',
      frameType: '1',
      etherType: '',
      rows: [],
      page: 1,
      pageSize: 20
    }
  },
  computed: {
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
      cgiGet('net_protoVlanProfile').then(d => {
        this.rows = (d.list || []).map(e => {
          const ft = FRAME_TYPE.find(o => o.value === String(e.frameType))
          return { id: e.id, frameType: String(e.frameType), frameTypeLabel: ft ? ft.label : e.frameType, etherType: e.etherType }
        })
      }).finally(() => { this.loading = false })
    },
    onlyNum() {
      this.profileId = this.profileId.replace(/[^0-9]/g, '')
    },
    async onApply() {
      const id = Number(this.profileId)
      if (!id || id < 1 || id > 8) { message.warnBox('Profile ID must be within 1-8.'); return }
      if (!/^[0-9a-fA-F]{4}$/.test(this.etherType)) { message.warnBox('Ether Type must be 4 hex digits (0000-FFFF).'); return }
      await cgiSet('net_protoVlanProfileAdd', { id, frameType: this.frameType, etherType: this.etherType })
      this.profileId = ''; this.frameType = '1'; this.etherType = ''
      this.load()
    },
    onDelete(row) {
      message.confirmWarnBox(`Do you want to delete Profile ${row.id} ?`, 'Please confirm').then(async() => {
        await cgiSet('net_protoVlanProfileDel', { id: row.id }, { successMsg: false })
        this.load()
      }).catch(() => {})
    }
  }
}
</script>
