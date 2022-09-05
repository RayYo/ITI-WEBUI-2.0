<template>
  <div class="main_body">
    <div id="basetitle">IPv4 Interface</div>
    <div>
      <common-table
        header-title="IPv4 Interface"
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
      <el-table-column label="Interface" min-width="12%">
        <template slot-scope="scope">
          <span>{{ scope.row.intf }}</span>
        </template>
      </el-table-column>

      <el-table-column label="State" min-width="12%">
        <template slot-scope="scope">
          <span>{{ scope.row.state?'Enabeld':'Disabled' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="IP Address" min-width="35%">
        <template slot-scope="scope">
          <span>{{ (scope.row.ipAddr==='0.0.0.0')?'-/-':(scope.row.ipAddr+'/'+scope.row.ipMask+' Manual') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Link Status" min-width="14%">
        <template slot-scope="scope">
          <span>{{ scope.row.linkStatus?'Up':'Down' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Action" min-width="26%">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Edit" @click="edit(scope.row)">
          <input v-if="scope.$index>0" type="button" class="btnInTable" value="Delete" @click="del(scope.row)">
        </template>
      </el-table-column>
    </el-table>
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
      vid: '',
      totalEntry: 1,
      loading: false,
      tableData: [],
      findBegin: 0,
      findEnd: this.totalEntry
    }
  },
  created() {
    // this.$http.get('url_get_xxxx').then(resp => {
    //   this.tableData = resp.data....
    // },
    // err => {
    //   console.log('ipv4Intf-get err:', err)
    // })
    const mockData = [{
      intf: 'vlan1',
      state: true,
      ipType: 'static',
      ipAddr: '192.168.1.1',
      ipMask: '255.255.255.0',
      linkStatus: true
    }, {
      intf: 'vlan2',
      state: false,
      ipType: 'static',
      ipAddr: '192.168.1.1',
      ipMask: '255.255.255.0',
      linkStatus: true
    },
    {
      intf: 'vlan3',
      state: false,
      ipType: 'static',
      ipAddr: '0.0.0.0',
      ipMask: '255.255.255.0',
      linkStatus: false
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
    add() {
      console.log('add..')
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
    edit(rowData) {
      this.$router.push({
        path: 'ipv4-intf-edit',
        query: rowData
      })
    },
    del(v) {
      // this.loading = true
      // this.$http.post('url_set_xxx', data).then(resp => {
      //   this.$message.success({
      //     showClose: true,
      //     message: 'Success.'
      //   })
      //   this.loading = false
      //   row.edit = true
      // },
      // err => {
      //   console.log('ipv4IntfDel-post error: ', err)
      // })
      this.$message.success({
        showClose: true,
        message: v.intf + ' Delete Success.'
      })
    },
    check() {
      this.vid = this.vid.replace(/[^0-9]/g, '')
    }
  }
}
</script>
