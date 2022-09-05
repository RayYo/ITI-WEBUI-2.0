<template>
  <div class="main_body">
    <div id="basetitle"> IPv6 Interface Configuration </div>
    <div>
      <common-table header-title="Status Settings" :first-column="['Interface', 'State']">
        <template #0>{{ intf }}</template>
        <template #1>
          <select v-model="stateSelected" style="width: 23%;">
            <option :value="1">Enabled</option>
            <option :value="2">Disabled</option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="stateApply">
    </div>

    <div>
      <common-table header-title="IP Settings" :first-column="['DHCPv6 Client State', 'IPv6 Address']">
        <template #0>
          <select v-model="dhcpV6State" style="width: 23%;">
            <option :value="1">Enabled</option>
            <option :value="2">Disabled</option>
          </select> <input v-model="rapidCommit" type="checkbox" :disabled="dhcpV6State===2">
          <span class="tipAfterInputBox">Rapid Commit</span>
        </template>
        <template #1>
          <base-input
            v-model="ipv6Addr"
            max-len="43"
            :disabled="dhcpV6State===1"
            :css="dhcpV6State===1?'baseInput disabledStyle':'baseInput'"
            @check="inputCheck('ipv6')"
          />
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="ipApply">
    </div>
    <div>
      <common-table header-title="NS Retransmit Time" :first-column="['NS Interval']">
        <template #0>
          <base-input v-model="nsTime" max-len="4" @check="inputCheck('time')" />
          <span class="tipAfterInputBox"> Sec&nbsp;(1-3600)</span>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="timeApply">
      <input type="button" class="btnOutTable" value="Back" @click="back">
    </div>

    <div class="table_title"> IPv6 Interface Table
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
      <el-table-column prop="addrType" label="Address Type" min-width="18%" />
      <el-table-column prop="ipv6Addr" label="IPv6 Address" min-width="21%" />
      <el-table-column label="Action" min-width="15%">
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
import { applyCheck } from '@/utils'

export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      intf: '',
      stateSelected: '',
      dhcpV6State: '',
      rapidCommit: '',
      ipv6Addr: '',
      nsTime: '',
      totalEntry: '',
      loading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 5
    }
  },
  created() {
    const queryObj = this.$route.query
    this.intf = queryObj.intf
    this.stateSelected = (queryObj.state === 'Enabled') ? 1 : 2
    this.dhcpV6State = 2
    // get data
    this.nsTime = '999'
    const mockData = [
      { addrType: '1', ipv6: '2001::3/32', mode: 'manual' },
      { addrType: '1', ipv6: '2002::3/32', mode: 'manual' },
      { addrType: '1', ipv6: '2003::3/32', mode: 'manual' },
      { addrType: '1', ipv6: '2004::3/62', mode: 'auto' },
      { addrType: '1', ipv6: '2005::3/32', mode: 'manual' },
      { addrType: '2', ipv6: '2006::3/128', mode: 'auto' }
    ]
    for (const k in mockData) {
      if (Object.hasOwnProperty.call(mockData, k)) {
        const element = mockData[k]
        this.tableData.push({
          addrType: element.addrType === '1' ? 'Global Unicast Address' : 'Other??',
          ipv6: element.ipv6,
          ipv6Addr: element.mode === 'manual' ? element.ipv6 + '(Manual)' : element.ipv6 + '(Auto??)'
        })
      }
      this.totalEntry = this.tableData.length
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    stateApply() {
      // todo: post
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
    },
    ipApply() {
      // check ipv6 CIDR
      if (this.dhcpV6State === 2) {
        if (applyCheck('ipv6CIDR', this.ipv6Addr) === false) {
          this.$msgbox({
            type: 'warning',
            title: 'Warning',
            message: 'Please input ipv6 address/prefix.'
          })
          return
        }
        this.ipv6Addr = ''
      }
      // todo: post
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
    },
    timeApply() {
      // check
      if (this.nsTime < 1 || this.nsTime > 3600) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please enter an integer between 1 ~ 3600'
        })
        this.nsTime = ''
        return
      }
      // todo: post
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
    },
    delRow(row) {
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
      // this.$http.post('url_set_xxx', data).then(resp => {
      //   this.$message.success({
      //     showClose: true,
      //     message: 'Success.'
      //   })
      // },
      // err => {
      //   console.log('xxx-post error: ', err)
      // })
    },
    back() {
      this.$router.go(-1)
    },
    inputCheck(type) {
      if (type === 'ipv6') {
        this.ipv6Addr = this.ipv6Addr.replace(/[^a-fA-F0-9:/]/g, '')
      } else {
        this.nsTime = this.nsTime.replace(/[^0-9]/g, '')
      }
    }
  }
}
</script>
