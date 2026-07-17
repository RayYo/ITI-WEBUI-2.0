<template>
  <div class="main_body">
    <div id="basetitle">IPv6 Neighbor Settings</div>
    <div>
      <common-table
        header-title="IPv6 Neighbor Settings"
        :first-column="['Neighbor IPv6 Address','Link Layer MAC Address']"
      >
        <template #0>
          <base-input v-model="neighborIpv6" max-len="43" @check="inputCheck('ipv6')" />
          <span class="tipAfterInputBox"> *</span>
        </template>
        <template #1>
          <base-input v-model="macAddr" max-len="17" @check="inputCheck('mac')" />
          <span class="tipAfterInputBox"> * (XX:XX:XX:XX:XX:XX)</span>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Add" @click="add">
    </div>
    <div class="table_title"> IPv6 Neighbor Table
      <span class="tipInTableTitle">{{ '(Total Entries: '+totalEntry+')' }}</span>
    </div>
    <!-- 首行为过滤行(与原版一致):IPv6/MAC 输入 + Status 下拉 + Find/Delete -->
    <el-table
      v-loading="loading"
      :data="displayRows"
      empty-text="< < Table is empty > >"
      style="width: 100%"
      :stripe="true"
      :border="true"
      :header-cell-style="{
        'color': 'rgb(88, 95, 105)',
        'font-weight': '700',
        'text-align': 'center',
      }"
      :cell-style="{
        'text-align': 'center'
      }"
    >
      <el-table-column label="Neighbor IPv6 Address" min-width="33%">
        <template slot-scope="scope">
          <el-input v-if="scope.row._filter" v-model="fIpv6" class="filter-input" @input="inputCheck('fIpv6')" />
          <span v-else>{{ scope.row.ipv6 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Link Layer MAC Address" min-width="30%">
        <template slot-scope="scope">
          <el-input v-if="scope.row._filter" v-model="fMac" class="filter-input" @input="inputCheck('fMac')" />
          <span v-else>{{ scope.row.mac }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" min-width="15%">
        <template slot-scope="scope">
          <select v-if="scope.row._filter" v-model="fStatus" class="selectInTable">
            <option value="0">All</option>
            <option value="1">Static</option>
            <option value="2">Dynamic</option>
          </select>
          <span v-else>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Action" min-width="22%">
        <template slot-scope="scope">
          <template v-if="scope.row._filter">
            <input type="button" class="btnInTable" value="Find" @click="onFind">
            <input type="button" class="btnInTable" value="Delete" @click="onDeleteFiltered">
          </template>
          <input v-else type="button" class="btnInTable" value="Delete" @click="delRow(scope.row)">
        </template>
      </el-table-column>
    </el-table>

    <div>
      <emu-pagination :current-page.sync="currentPage" :page-size.sync="pageSize" :total="filtered.length" />
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import message from '@/utils/message'
import { applyCheck } from '@/utils'
import { cgiGet, cgiSet } from '@/api/cgi'

export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      neighborIpv6: '',
      macAddr: '',
      totalEntry: '',
      loading: false,
      tableData: [],
      // 过滤行输入:* = 不作为过滤条件(与原版一致),Find 后恢复 *
      fIpv6: '*',
      fMac: '*',
      fStatus: '0',
      applied: { ipv6: '', mac: '', status: '0' },
      currentPage: 1,
      pageSize: 5
    }
  },
  computed: {
    filtered() {
      const { ipv6, mac, status } = this.applied
      return this.tableData.filter(e => {
        if (ipv6 && !String(e.ipv6).toLowerCase().includes(ipv6.toLowerCase())) return false
        if (mac && !String(e.mac).toLowerCase().includes(mac.toLowerCase())) return false
        if (status === '1' && e.type !== 'Static') return false
        if (status === '2' && e.type !== 'Dynamic') return false
        return true
      })
    },
    // 首行恒为过滤行,数据行随过滤+翻页
    displayRows() {
      const paged = this.filtered.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
      return [{ _filter: true }].concat(paged)
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('l3_ipv6Neighbor').then(d => {
        this.tableData = d.entries || []
        this.totalEntry = this.tableData.length
        this.loading = false
      }, err => {
        this.loading = false
        console.log('l3_ipv6Neighbor get err:', err)
      })
    },
    filterVal(v) {
      const t = v.trim()
      return t === '*' ? '' : t
    },
    onFind() {
      this.applied = { ipv6: this.filterVal(this.fIpv6), mac: this.filterVal(this.fMac), status: this.fStatus }
      this.currentPage = 1
      this.fIpv6 = '*'
      this.fMac = '*'
    },
    // 首行 Delete:删除当前过滤条件命中的所有表项
    onDeleteFiltered() {
      this.applied = { ipv6: this.filterVal(this.fIpv6), mac: this.filterVal(this.fMac), status: this.fStatus }
      this.currentPage = 1
      this.fIpv6 = '*'
      this.fMac = '*'
      const hits = this.filtered
      if (!hits.length) { message.warnBox('No matched entry.'); return }
      message.confirmWarnBox(`Do you want to delete ${hits.length} matched ${hits.length > 1 ? 'entries' : 'entry'} ?`, 'Please confirm').then(async() => {
        await cgiSet('l3_ipv6NeighborDel', {
          ipv6: this.applied.ipv6,
          mac: this.applied.mac,
          status: this.applied.status
        }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    async add() {
      // check
      if (!applyCheck('ipv6', this.neighborIpv6)) {
        message.warnBox('Invalid IPv6 address.')
        return
      }
      if (!applyCheck('mac', this.macAddr)) {
        message.warnBox('Invalid MAC address.')
        return
      }
      await cgiSet('l3_ipv6NeighborAdd', { ipv6: this.neighborIpv6, mac: this.macAddr, type: 'Static' })
      this.neighborIpv6 = ''
      this.macAddr = ''
      this.load()
    },
    delRow(row) {
      message.confirmWarnBox(`Do you want to delete ${row.ipv6} ?`, 'Please confirm').then(async() => {
        await cgiSet('l3_ipv6NeighborDel', { ipv6: row.ipv6 }, { successMsg: false })
        this.load()
      }).catch(() => {})
    },
    inputCheck(type) {
      if (type === 'ipv6') {
        this.neighborIpv6 = this.neighborIpv6.replace(/[^a-fA-F0-9:]/g, '')
      } else if (type === 'fIpv6') {
        this.fIpv6 = this.fIpv6.replace(/[^a-fA-F0-9:*]/g, '')
      } else if (type === 'fMac') {
        this.fMac = this.fMac.replace(/[^a-fA-F0-9:*-]/g, '')
      } else {
        this.macAddr = this.macAddr.replace(/[^a-fA-F0-9:-]/g, '')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 过滤行输入框:照原版 computed(300px 定宽居中、26 高、无圆角、边框 #dbdee1)
.filter-input {
  width: 300px !important;
  max-width: 100%;
  ::v-deep .el-input__inner {
    height: 26px;
    line-height: 26px;
    padding: 0 7px;
    color: #606266;
    border: 1px solid #dbdee1;
    border-radius: 0;
  }
}
</style>
