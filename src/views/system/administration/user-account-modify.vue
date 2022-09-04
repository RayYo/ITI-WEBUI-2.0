<template>
  <div class="main_body">
    <div id="basetitle">Modify Administration</div>
    <div>
      <common-table
        header-title="Modify Administration"
        :first-column="['Entry number','User Name','Password','Confirm Password']"
      >
        <template #0>
          <base-input v-model="index" :disabled="true" css="baseInput disabledStyle" />
        </template>
        <template #1>
          <base-input v-model="userName" :disabled="true" css="baseInput disabledStyle" />
        </template>
        <template #2>
          <base-input v-model="password" type="password" autocomplete="new-password" max-len="20" />
        </template>
        <template #3>
          <base-input v-model="confirmPsw" type="password" autocomplete="new-password" max-len="20" />
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Apply" @click="apply">
      <input type="button" class="btnOutTable" value="Back" @click="back">
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
      index: '',
      userName: '',
      password: '',
      confirmPsw: ''
    }
  },
  created() {
    const queryObj = this.$route.query
    this.index = queryObj.tIndex
    this.userName = queryObj.tName
  },
  methods: {
    back() {
      this.$router.go(-1)
    },
    apply() {
      if (!this.password || !this.confirmPsw || this.password !== this.confirmPsw) {
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
    }
  }
}
</script>
