<template>
  <div class="main_body">
    <div id="basetitle">Administration</div>
    <div>
      <common-table
        header-title="Administration Settings"
        :first-column="['User Name','Password','Confirm Password']"
      >
        <template #0>
          <base-input v-model="userName" max-len="20" @check="check('userName')" />
          <span> (Maximum length is 20)</span>
        </template>
        <template #1>
          <base-input v-model="psw" type="password" autocomplete="new-password" max-len="20" />
          <span> (Maximum length is 20)</span>
        </template>
        <template #2>
          <base-input v-model="confirmPsw" type="password" autocomplete="new-password" max-len="20" />
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Add" @click="add">
    </div>

    <div class="table_title">
      <span>Administration Table</span>
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
      <el-table-column prop="tIndex" label="Index" min-width="5%" />
      <el-table-column prop="tName" label="User Name" min-width="30%" />
      <el-table-column prop="tPsw" label="Password" min-width="30%" />

      <el-table-column label="Action" min-width="33%">
        <template slot-scope="scope">
          <input type="button" class="btnInTable" value="Modify" @click="tModify(scope.row)">
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'
import message from '@/utils/message'

export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      userName: '',
      psw: '',
      confirmPsw: '',
      loading: false,
      tableData: [],
      tIndex: '',
      tName: '',
      tPsw: ''
    }
  },
  created() {
    // get data & init tableData
    const mockData = [{
      userName: 'aaa',
      password: 'pp11p'
    }, {

      userName: 'bbb',
      password: 'ppp'
    }, {

      userName: 'ccc',
      password: 'ppps'
    }, {

      userName: 'ddd',
      password: 'ppps'
    }]

    for (let i = 0; i < mockData.length; i++) {
      const element = mockData[i]
      this.tableData.push({
        tIndex: i + 1,
        tName: element.userName,
        tPsw: element.password.replace(/[\s\S]/g, '*')
      })
    }
  },
  methods: {
    add() {
      // check
      if (!this.userName) {
        message.warnBox('The length of User Name is between 1 and 20 characters!')
        return
      }
      if (!this.psw || (this.psw !== this.confirmPsw)) {
        message.warnBox('The passwords do not match.')
        return
      }
      // post
      message.success()
    },
    tModify(row) {
      this.$router.push({
        path: 'user-account-modify',
        query: row
      })
    },
    check(type) {
      if (type === 'userName') {
        this.userName = this.userName.replace(/[\u4E00-\u9FA5]/g, '')
      }
    }
  }
}
</script>
