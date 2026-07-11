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
import { cgiGet, cgiSet } from '@/api/cgi'
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
    cgiGet('sys_timeout').then(d => {
      this.timeout = String(d.webIdleMin)
    })
  },
  methods: {
    apply() {
      // check
      if (this.timeout < 3 || this.timeout > 60) {
        message.warnBox('Please enter an integer between 3 ~ 60')
        return
      }
      cgiSet('sys_timeout', { webIdleMin: this.timeout })
    }
  }
}
</script>
