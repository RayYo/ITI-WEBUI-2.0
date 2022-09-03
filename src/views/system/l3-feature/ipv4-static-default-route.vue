<template>
  <div class="main_body">
    <div id="basetitle">IPv4 Static/Default Route</div>
    <div>
      <common-table
        header-title="IPv4 Static/Default Route"
        :first-column="['IP Address', 'Mask', 'Next Hop IP Address', 'Backup Status']"
      >
        <template #0>
          <base-input v-model="ipAddr" :disabled="checkboxValue" :css="ipInputClass" max-len="15" @check="check('ip')" />
          <input v-model="checkboxValue" type="checkbox" class="tipAfterInputBox">
          <span class="tipAfterInputBox">Default Route</span>
        </template>
        <template #1>
          <base-input v-model="ipMask" :disabled="checkboxValue" :css="ipInputClass" max-len="15" @check="check('ipMask')" />
        </template>
        <template #2>
          <base-input v-model="nextHopIp" max-len="15" @check="check('nextHopIp')" />
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
      <el-table-column prop="ip" label="IP Address" min-width="18%" />
      <el-table-column prop="mask" label="Mask" min-width="21%" />
      <el-table-column prop="nextHop" label="Next Hop" min-width="21%" />
      <el-table-column prop="backup" label="Backup Status" min-width="13%" />
      <el-table-column prop="intfName" label="Interface Name" min-width="10%" />
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
export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      checkboxValue: true,
      ipAddr: '',
      ipMask: '',
      nextHopIp: '',
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
    const mockData = [
      {
        ip: '0.0.0.0',
        mask: '0.0.0.0',
        nextHop: '10.10.9.112',
        backup: 'P',
        intfName: 'vlan1'
      },
      {
        ip: '1.0.0.0',
        mask: '0.0.0.0',
        nextHop: '10.10.9.112',
        backup: 'B',
        intfName: 'vlan2'
      },
      {
        ip: '2.0.0.0',
        mask: '0.0.0.0',
        nextHop: '10.10.9.112',
        backup: 'P',
        intfName: 'vlan3'
      }
    ]

    for (const k in mockData) {
      if (Object.hasOwnProperty.call(mockData, k)) {
        const element = mockData[k]
        this.tableData.push(element)
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
      this.applyCheck()
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
    check(type) {
      switch (type) {
        case 'ip':
          this.ipAddr = this.ipAddr.replace(/[^0-9\.]/g, '')
          break
        case 'ipMask':
          this.ipMask = this.ipMask.replace(/[^0-9\.]/g, '')
          break
        case 'nextHopIp':
          this.nextHopIp = this.nextHopIp.replace(/[^0-9\.]/g, '')
          break

        default:
          break
      }
    },
    applyCheck() {
      const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if ((!this.checkboxValue && reg.test(this.ipAddr) === false) ||
          (!this.checkboxValue && reg.test(this.ipMask) === false) ||
          reg.test(this.nextHopIp) === false) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please input a valid value.'
        })
        return
      }
      if (this.backupSelect < 0) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please select Backup Status.'
        })
        return
      }
      // post
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
    }
  }
}
</script>
