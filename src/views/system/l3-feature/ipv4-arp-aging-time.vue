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
export default {
  components: {
    baseInput
  },
  data() {
    return {
      totalEntry: 3,
      loading: false,
      timeout: '',
      tableData: [{
        intfName: '1',
        timeout: '20'
      },
      {
        intfName: '2',
        timeout: '40'
      },
      {
        intfName: '3',
        timeout: '210'
      },
      {
        intfName: '4',
        timeout: '120'
      },
      {
        intfName: '5',
        timeout: '123'
      }]
    }
  },
  created() {
    // this.$http.get('url_get_xxxx').then(resp => {
    //   this.tableData = resp.data....
    //   // add edit prop
    // },
    // err => {
    //   console.log('ipv4ArpAgingTime-get err:', err)
    // })
    for (const k in this.tableData) {
      if (Object.hasOwnProperty.call(this.tableData, k)) {
        const element = this.tableData[k]
        this.$set(element, 'edit', true)
      }
    }
    this.totalEntry = this.tableData.length
  },
  methods: {
    edit(row) {
      row.edit = false
    },
    apply(row) {
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
      //   console.log('ipv4ArpAgingTime-post error: ', err)
      // })
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
      row.edit = true
    },
    check(row) {
      row.timeout = row.timeout.replace(/[^0-9]/g, '')
    }
  }
}
</script>

