<template>
  <div class="main_body">
    <div id="basetitle">Timeout Settings</div>
    <div>
      <common-table
        header-title="Timeout Settings"
        :first-column="['Web Idle Timeout']"
      >
        <template #0>
          <base-input v-model="timeout" max-len="2" />
          <span> Min (3-60)</span>
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
      timeout: ''
    }
  },
  created() {
    this.timeout = 20
    // get timeout
    // this.$http.get('url_get_xxx').then(resp=>{
    //     this.timeout = resp.data.timeout
    // },
    // err=>{
    //     console.log('get timeout fail..');
    // })
  },
  methods: {
    apply() {
      // check
      if (this.timeout < 3 || this.timeout > 60) {
        message.warnBox('Please enter an integer between 3 ~ 60')
        return
      }
      // post
      message.success()
    }
  }
}
</script>
