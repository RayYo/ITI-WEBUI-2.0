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
      :data="tableData"
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
          <span>{{ scope.row.interface }}</span>
        </template>
      </el-table-column>

      <el-table-column label="State" min-width="12%">
        <template slot-scope="scope">
          <span>{{ scope.row.state }}</span>
        </template>
      </el-table-column>

      <el-table-column label="IP Address" min-width="35%">
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Link Status" min-width="14%">
        <template slot-scope="scope">
          <span>{{ scope.row.linkStatus }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Action" min-width="26%">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Edit" @click="edit(scope.row.interface)">
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
      tableData: [{
        interface: 'vlan1',
        state: 'Enabled',
        ip: '192.168.105.20/255.255.255.0 Manual',
        linkStatus: 'Up'
      }, {
        interface: 'vlan2',
        state: 'Enabled',
        ip: '192.168.10.30/255.255.255.0 Manual',
        linkStatus: 'Up'
      }]
    }
  },
  created() {
    this.totalEntry = this.tableData.length
  },
  methods: {
    add() {
      console.log('add..')
    },
    find() {
      console.log('find..')
    },
    edit(intf) {
      console.log(intf)
    },
    check() {
      this.vid = this.vid.replace(/[^0-9]/g, '')
    }
  }
}
</script>
