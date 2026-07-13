<template>
  <div class="main_body">
    <div id="basetitle">IPv6 Interface</div>
    <div>
      <common-table
        header-title="IPv6 Interface"
        :first-column="['Interface VLAN']"
      >
        <template #0>
          <base-input v-model="vid" max-len="4" @check="check()" />
          <span class="tipAfterInputBox"> (1-4094)</span>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Add" @click="add">
      <input type="button" :class="btnClass" value="Find" @click="find">
    </div>

    <div class="table_title"> Interface Table
      <span class="tipInTableTitle">{{ '(Total Entries: '+totalEntry+')' }}</span>
    </div>
    <el-table
      v-loading="loading"
      :data="tableData.slice(findBegin, findEnd)"
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
      <el-table-column label="Interface" prop="intf" min-width="26%" />
      <el-table-column label="State" prop="state" min-width="25%" />
      <el-table-column label="Link Status" prop="linkStatus" min-width="25%" />
      <el-table-column label="Action" min-width="23%">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Detail" @click="detail(scope.row)">
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import message from '@/utils/message'
import { cgiGet, cgiSet } from '@/api/cgi'

export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      vid: '',
      totalEntry: 0,
      loading: false,
      tableData: [],
      findBegin: 0,
      findEnd: 0
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('l3_ipv6Intf').then(d => {
        this.tableData = (d.entries || []).map(e => ({
          intf: e.intf,
          state: e.state ? 'Enabled' : 'Disabled',
          linkStatus: e.linkStatus ? 'Up' : 'Down'
        }))
        this.totalEntry = this.tableData.length
        this.findBegin = 0
        this.findEnd = this.tableData.length
        this.loading = false
      }, err => {
        this.loading = false
        console.log('l3_ipv6Intf get err:', err)
      })
    },
    add() {
      if (this.vid < 1 || this.vid > 4094) {
        message.warnBox('Please enter an integer between 1 ~ 4094')
        return
      }
      cgiSet('l3_ipv6IntfAdd', { intf: 'vlan' + this.vid, state: 1 }).then(() => {
        this.vid = ''
        this.load()
      })
    },
    find() {
      let isFind = false
      for (let i = 0; i < this.tableData.length; i++) {
        const element = this.tableData[i]
        if (element.intf.indexOf(this.vid) !== -1) {
          this.findBegin = i
          this.findEnd = i + 1
          this.totalEntry = 1
          isFind = true
          break
        }
      }
      if (!isFind || !this.vid) {
        this.findBegin = 0
        this.findEnd = 0
        this.totalEntry = 0
      }
      this.vid = ''
    },
    detail(rowData) {
      this.$router.push({
        path: 'ipv6-intf-detail',
        query: rowData
      })
    },
    check() {
      this.vid = this.vid.replace(/[^0-9]/g, '')
    }
  }
}
</script>
