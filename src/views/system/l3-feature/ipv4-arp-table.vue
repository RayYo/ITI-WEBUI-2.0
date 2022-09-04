<template>
  <div class="main_body">
    <div id="basetitle">Static ARP</div>
    <div>
      <common-table
        header-title="Static ARP"
        :first-column="['IP Address','Hardware Address']"
      >
        <template #0>
          <base-input v-model="ipAddr" max-len="15" @check="check('ip')" />
        </template>
        <template #1>
          <base-input v-model="macAddr" max-len="17" placeholder="00-4E-00-11-00-00" @check="check('mac')" />
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Apply" @click="apply">
    </div>
    <div class="table_title"> Static ARP Table
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
      <el-table-column prop="intfName" label="Interface Name" min-width="18%" />
      <el-table-column prop="ip" label="IP Address" min-width="21%" />
      <el-table-column prop="mac" label="Hardware Address" min-width="21%" />
      <el-table-column prop="agingTime" label="Aging Time" min-width="13%" />
      <el-table-column prop="ipType" label="Type" min-width="10%" />
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
      btnClass: 'btnOutTable',
      ipAddr: '',
      macAddr: '',
      totalEntry: '',
      loading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 5
    }
  },
  created() {
    this.loading = true
    this.$http.get('url_get_ipv4ArpTable').then(resp => {
      for (const k in resp.data.table) {
        if (Object.hasOwnProperty.call(resp.data.table, k)) {
          const element = resp.data.table[k]
          this.tableData.push(element)
        }
      }
      this.loading = false
      this.totalEntry = this.tableData.length
    },
    err => {
      console.log('url_get_ipv4ArpTable error!', err)
    })
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    check(type) {
      if (type === 'ip') {
        this.ipAddr = this.ipAddr.replace(/[^0-9\.]/g, '')
      } else {
        this.macAddr = this.macAddr.replace(/[^\a-f\A-F\0-9\-\:]/g, '')
      }
    },
    apply() {
      if (applyCheck('ipv4', this.ipAddr) === false ||
          applyCheck('mac', this.macAddr) === false) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please input a valid value.'
        })
        return
      }
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
    }
  }
}
</script>
