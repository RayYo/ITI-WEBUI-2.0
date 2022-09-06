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
    // get data
    const mockData = [
      { ipv6: '2003::1', mac: '00:23:79:00:11:31', type: 'Static' },
      { ipv6: '2003::2', mac: '00:23:79:00:11:32', type: 'Static' },
      { ipv6: '2003::3', mac: '00:23:79:00:11:33', type: 'Static' },
      { ipv6: '2003::4', mac: '00:23:79:00:11:34', type: 'Dynamic' },
      { ipv6: '2003::5', mac: '00:23:79:00:11:35', type: 'Static' },
      { ipv6: '2003::6', mac: '00:23:79:00:11:36', type: 'Static' }
    ]
    for (let i = 0; i < mockData.length; i++) {
      const element = mockData[i]
      this.tableData.push(element)
    }
    this.totalEntry = this.tableData.length
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    filter(value, row) {
      return row.type === value
    },
    add() {
      // check
      if (!applyCheck('ipv6', this.neighborIpv6)) {
        message.warnBox('Invalid IPv6 address.')
        return
      }
      if (!applyCheck('mac', this.macAddr)) {
        message.warnBox('Invalid MAC address.')
        return
      }
      // post
      message.success()
    },
    delRow(row) {
      message.success()
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
