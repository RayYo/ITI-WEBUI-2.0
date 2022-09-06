<template>
  <div class="main_body">
    <div id="basetitle">IPv6 Static/Default Route</div>
    <div>
      <common-table
        header-title="IPv6 Static/Default Route"
        :first-column="['IPv6 Address/Prefix Length', 'Interface VLAN', 'Next Hop IPv6 Address', 'Backup Status']"
      >
        <template #0>
          <base-input v-model="ipv6Addr" :disabled="checkboxValue" :css="ipInputClass" max-len="43" placeholder="2023::1/64" @check="inputCheck('ipv6')" />
          <input v-model="checkboxValue" type="checkbox" class="tipAfterInputBox">
          <span class="tipAfterInputBox">Default Route</span>
        </template>
        <template #1>
          <base-input v-model="vlan" max-len="4" @check="inputCheck('vlan')" />
          <span class="tipAfterInputBox">(1-4094)</span>
        </template>
        <template #2>
          <base-input v-model="nextHopIpv6" max-len="39" placeholder="2022::1" @check="inputCheck('nextHopIpv6')" />
        </template>
        <template #3>
          <select v-model="backupSelect">
            <option title="Please Select" value="-1"><span>Please Select</span></option>
            <option title="Primary" value="1"><span>Primary</span></option>
            <option title="Backup" value="2"><span>Backup</span></option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Apply" @click="apply">
    </div>

    <div class="table_title"> Route Table
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
      <el-table-column prop="ipv6" label="IPv6 Address/Prefix Length" min-width="38%" />
      <el-table-column prop="nextHop" label="Next Hop" min-width="20%" />
      <el-table-column prop="backup" label="Backup Status" min-width="16%" />
      <el-table-column prop="intfName" label="Interface Name" min-width="14%" />
      <el-table-column label="Action" min-width="12%">
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
      ipv6Addr: '',
      checkboxValue: true,
      vlan: '',
      nextHopIpv6: '',
      backupSelect: '-1',
      totalEntry: '',
      loading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 5
    }
  },
  computed: {
    ipInputClass() {
      return this.checkboxValue ? 'baseInput disabledStyle' : 'baseInput'
    }
  },
  created() {
    // get data
    const mockData = [
      {
        ipv6: '2022::3/64',
        nextHop: '2::1',
        backup: 'P',
        vid: '1'
      },
      {
        ipv6: '2021::3/64',
        nextHop: '3::1',
        backup: 'P',
        vid: '2'
      },
      {
        ipv6: '2020::3/64',
        nextHop: '4::1',
        backup: 'B',
        vid: '3'
      }
    ]
    for (const k in mockData) {
      if (Object.hasOwnProperty.call(mockData, k)) {
        const element = mockData[k]
        this.tableData.push({
          ipv6: element.ipv6,
          nextHop: element.nextHop,
          backup: element.backup,
          intfName: 'vlan' + element.vid
        })
      }
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
    apply() {
      // check
      if (!this.checkboxValue && applyCheck('ipv6CIDR', this.ipv6Addr) === false) {
        message.warnBox('Please input ipv6 address/prefix.')
        return
      }
      if (this.vlan < 1 || this.vlan > 4094) {
        message.warnBox('Please enter an integer between 1 ~ 4094')
        return
      }
      if (applyCheck('ipv6', this.nextHopIpv6) === false) {
        message.warnBox('Invalid IPv6 address.')
        return
      }
      if (this.backupSelect < 0) {
        message.warnBox('Please select Backup Status.')
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
    inputCheck(t) {
      switch (t) {
        case 'vlan':
          this.vlan = this.vlan.replace(/[^0-9]/g, '')
          break
        case 'ipv6':
          this.ipv6Addr = this.ipv6Addr.replace(/[^a-fA-F0-9:/]/g, '')
          break
        case 'nextHopIpv6':
          this.nextHopIpv6 = this.nextHopIpv6.replace(/[^a-fA-F0-9:]/g, '')
          break

        default:
          break
      }
    }
  }
}
</script>
