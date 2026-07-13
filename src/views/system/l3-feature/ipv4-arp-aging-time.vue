<template>
  <div class="main_body">
    <div id="basetitle">ARP Aging Time</div>
    <div class="table_title"> ARP Aging Time
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
      <el-table-column label="Interface Name">
        <template slot-scope="scope">
          <span>{{ scope.row.intfName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Timeout">
        <template slot-scope="scope">
          <span v-if="scope.row.edit">{{ scope.row.timeout }}</span>
          <base-input v-else v-model="scope.row.timeout" div-class="InputInTable" max-len="5" @check="check(scope.row)" />
        </template>
      </el-table-column>

      <el-table-column label="Action">
        <template slot-scope="scope">
          <input v-if="scope.row.edit" type="button" class="btnInTable" value="Edit" @click="edit(scope.row)">
          <input v-else type="button" class="btnInTable" value="Apply" @click="apply(scope.row)">
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import baseInput from '@/components/CustomInput/base-input.vue'
import message from '@/utils/message'
import { cgiGet, cgiSet } from '@/api/cgi'
export default {
  components: {
    baseInput
  },
  data() {
    return {
      totalEntry: 0,
      loading: false,
      tableData: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      cgiGet('l3_arpAging').then(d => {
        this.tableData = (d.entries || []).map(e => ({
          intfName: e.interface,
          timeout: String(e.timeout),
          edit: true // true=显示态,false=编辑态(行内 Edit→Apply)
        }))
        this.totalEntry = this.tableData.length
        this.loading = false
      }, err => {
        this.loading = false
        console.log('l3_arpAging get err:', err)
      })
    },
    edit(row) {
      row.edit = false
    },
    apply(row) {
      const t = Number(row.timeout)
      if (!Number.isInteger(t) || t < 1 || t > 65535) {
        message.warnBox('Timeout must be 1-65535.')
        return
      }
      cgiSet('l3_arpAgingEdit', { interface: row.intfName, timeout: t }).then(() => {
        row.edit = true
      })
    },
    check(row) {
      row.timeout = row.timeout.replace(/[^0-9]/g, '')
    }
  }
}
</script>

