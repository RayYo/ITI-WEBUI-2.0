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
import { cgiGet, cgiSet } from '@/api/cgi'
export default {
  components: {
    commonTable
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      select: '2'
    }
  },
  created() {
    cgiGet('sys_dhcpAutoConfig').then(d => {
      this.select = d.enabled ? '1' : '2'
    })
  },
  methods: {
    apply() {
      cgiSet('sys_dhcpAutoConfig', { enabled: this.select === '1' ? 1 : 0 })
    }
  }
}
</script>
