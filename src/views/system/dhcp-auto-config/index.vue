<template>
  <div class="main_body">
    <div id="basetitle">DHCP Auto Configuration Settings</div>
    <div>
      <common-table
        header-title="DHCP Auto Configuration Settings"
        :first-column="['Auto Configuration Status']"
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
  </div>
</template>
<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import message from '@/utils/message'
export default {
  components: {
    commonTable
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      select: ''
    }
  },
  created() {
    this.select = 2
    // get ssl enabled
    // this.$http.get('url_get_xxx').then(resp=>{
    //     this.timeout = resp.data.timeout
    // },
    // err=>{
    //     console.log('get ssl fail..');
    // })
  },
  methods: {
    apply() {
      // post
      message.success()
    }
  }
}
</script>
