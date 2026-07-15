<template>
  <div class="main_body">
    <div id="basetitle">Port Security Global Settings</div>
    <div>
      <common-table header-title="Port Security System Settings" :first-column="['System Maximum Address (1 - 6656)']">
        <template #0>
          <base-input v-model="maxAddr" max-len="4" :disabled="noLimit" @check="onlyNum" />
          <input v-model="noLimit" type="checkbox" class="tipAfterInputBox"><span>No Limit</span>
        </template>
      </common-table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet, cgiSet } from '@/api/cgi'
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: { commonTable, baseInput },
  data() {
    return {
      maxAddr: '',
      noLimit: false
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      cgiGet('sec_portSecGlobal').then(d => {
        this.noLimit = !!d.noLimit
        this.maxAddr = String(d.maxAddr != null ? d.maxAddr : '')
      })
    },
    onlyNum() {
      this.maxAddr = this.maxAddr.replace(/[^0-9]/g, '')
    },
    onApply() {
      cgiSet('sec_portSecGlobalEdit', {
        noLimit: this.noLimit ? 1 : 0,
        maxAddr: this.noLimit ? 0 : Number(this.maxAddr)
      })
    }
  }
}
</script>
