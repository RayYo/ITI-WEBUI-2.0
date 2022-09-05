<template>
  <div class="main_body">
    <div id="basetitle">IP Access List</div>
    <div>
      <common-table
        header-title="IP Access List"
        :first-column="['IP Restriction Status']"
      >
        <template #0>
          <select v-model="select">
            <option value="1"><span>Enabled</span></option>
            <option value="2"><span>Disabled</span></option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Apply" @click="apply">
    </div>
    <div class="table_title">IP Address Settings</div>

    <table border="" cellspacing="0" class="from_table">
      <tbody>
        <tr>
          <td rowspan="2">IP Address</td>
          <td>
            <div>
              <base-input
                v-model="ipv4Addr"
                type="text"
                max-len="15"
                :disabled="racal==='2'"
                :css="racal==='1'?'baseInput':'baseInput disabledStyle'"
                @check="check('ipv4')"
              />
              <input v-model="racal" value="1" type="radio" class="tipAfterInputBox">
              <label for="IPv4"> IPv4</label>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div>
              <base-input
                v-model="ipv6Addr"
                type="text"
                max-len="43"
                :disabled="racal==='1'"
                :css="racal==='2'?'baseInput':'baseInput disabledStyle'"
                @check="check('ipv6')"
              />
              <input id="IPv6" v-model="racal" value="2" type="radio" class="tipAfterInputBox">
              <label for="IPv6"> IPv6</label>
            </div></td>
        </tr>
      </tbody>
    </table>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Add" @click="add">
    </div>

    <div class="table_title">
      <span>IP Access List Table</span>
      <div style="display: inline; float: right;">
        <input id="deleteAll" type="button" value="Delete All" class="btnInTitle" @click="delAll()">
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
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
      <el-table-column prop="index" label="Index" min-width="6%" />
      <el-table-column prop="accessibleIp" label="Accessible IP" min-width="70%" />
      <el-table-column label="Action" min-width="23%">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Delete" @click="delRow(scope.row)">
        </template>
      </el-table-column>
    </el-table>
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
      btnClass: 'btnOutTable',
      select: '',
      racal: '1',
      ipv4Addr: '',
      ipv6Addr: '',
      loading: false,
      tableData: []
    }
  },
  created() {
    this.select = 2
    // get tableData
    const mockData = [
      { accessibleIp: '1.1.1.1' },
      { accessibleIp: '2.1.1.1' },
      { accessibleIp: '3.1.1.1' },
      { accessibleIp: '2002::3' },
      { accessibleIp: '5.1.1.1' },
      { accessibleIp: '6.1.1.1' }
    ]
    for (let i = 0; i < mockData.length; i++) {
      const element = mockData[i]
      this.tableData.push({
        index: i + 1,
        accessibleIp: element.accessibleIp
      })
    }
  },
  methods: {
    apply() {
      // post
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
    },
    add() {
      let flag = false
      // check
      if (this.racal === '1' && applyCheck('ipv4', this.ipv4Addr) === false) {
        flag = true
      }
      if (this.racal === '2' && applyCheck('ipv6', this.ipv6Addr) === false) {
        flag = true
      }
      if (flag) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please input a valid value.'
        })
        return
      }
      // post
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
    },
    delRow(row) {
      this.$confirm(`Do you want to delete the IP address ${row.accessibleIp} ?`, 'Please confirm', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        // post
        // console.log('post')
      }).catch(() => {
        // console.log('cancel')
      })
    },
    delAll() {
      if (this.tableData.length < 1) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please input a valid value.'
        })
        return
      }
      this.$confirm('Do you want to delete all the IP address ?', 'Please confirm', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        // post
      }).catch(() => {
      })
    },
    check(type) {
      if (type === 'ipv4') {
        this.ipv4Addr = this.ipv4Addr.replace(/[^0-9\.]/g, '')
      } else {
        this.ipv6Addr = this.ipv6Addr.replace(/[^\a-f\0-9\:]/g, '')
      }
    }
  }
}
</script>
