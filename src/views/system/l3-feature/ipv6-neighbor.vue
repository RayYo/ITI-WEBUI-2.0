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
    <el-table
      v-loading="loading"
      :data="tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
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
      <el-table-column prop="ipv6" label="Neighbor IPv6 Address" min-width="33%" />
      <el-table-column prop="mac" label="Link Layer MAC Address" min-width="30%" />
      <el-table-column
        prop="type"
        label="Status"
        min-width="15%"
        :filters="[{ text: 'Static', value: 'Static' }, { text: 'Dynamic', value: 'Dynamic' }]"
        :filter-method="filter"
      />
      <el-table-column label="Action" min-width="22%">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Delete" @click="delRow(scope.row)">
        </template>
      </el-table-column>
    </el-table>

    <div>
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="pageSize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
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
      multiplexTableData: [],
      currentPage: 1,
      pageSize: 5
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
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    filter(value, row) {
      return row.type === value
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
      } else {
        this.macAddr = this.macAddr.replace(/[^a-fA-F0-9:-]/g, '')
      }
    }
  }
}
</script>
