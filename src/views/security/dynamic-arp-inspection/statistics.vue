<template>
  <div class="main_body">
    <div id="basetitle">ARP Inspection Statistics</div>
    <div>
      <common-table header-title="ARP Inspection Statistics" :first-column="['VID List']">
        <template #0>
          <base-input v-model="vidList" max-len="1024" placeholder="1,4-6" />
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Clear by VLAN" @click="onClearVlan">
        <input type="button" class="btnOutTable" value="Clear All" @click="onClearAll">
      </div>

      <div class="table_title">
        ARP Inspection Statistics Table
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
        <el-table-column prop="vlan" label="VLAN" min-width="84" />
        <el-table-column prop="forwarded" label="Forwarded" min-width="135" />
        <el-table-column prop="dropped" label="Dropped" min-width="135" />
        <el-table-column prop="dhcpDrops" label="DHCP Drops" min-width="163" />
        <el-table-column prop="aclDrops" label="ACL Drops" min-width="163" />
        <el-table-column prop="dhcpPermits" label="DHCP Permits" min-width="163" />
        <el-table-column prop="aclPermits" label="ACL Permits" min-width="163" />
        <el-table-column prop="srcMacFail" label="Source MAC Failure" min-width="217" />
        <el-table-column prop="dstMacFail" label="Dest MAC Failure" min-width="190" />
        <el-table-column prop="ipValFail" label="IP Validation Failure" min-width="217" />
      </el-table>
      <emu-pagination :current-page.sync="page" :page-size.sync="pageSize" :total="rows.length" />
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      loading: false,
      pageTableHeader,
      pageTableCell,
      vidList: '',
      rows: [],
      page: 1,
      pageSize: 5
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
      cgiGet('sec_arpInspectionStats').then(d => {
        this.rows = (d.list || []).map(e => ({
          vlan: e.vlan, forwarded: e.forwarded, dropped: e.dropped, dhcpDrops: e.dhcpDrops, aclDrops: e.aclDrops,
          dhcpPermits: e.dhcpPermits, aclPermits: e.aclPermits, srcMacFail: e.srcMacFail, dstMacFail: e.dstMacFail, ipValFail: e.ipValFail
        }))
      }).finally(() => { this.loading = false })
    },
    onClearVlan() {
      cgiSet('sec_arpInspectionStatsClear', { vidList: this.vidList }).then(() => this.load())
    },
    onClearAll() {
      cgiSet('sec_arpInspectionStatsClearAll', {}).then(() => this.load())
    }
  }
}
</script>
