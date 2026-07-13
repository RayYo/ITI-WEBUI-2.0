<template>
  <div class="main_body">
    <div id="basetitle">Cloud Settings</div>
    <common-table
      header-title="Cloud Settings"
      :first-column="['Cloud Mode','Status', 'Registration']"
    >
      <template #0>
        <select v-model="mode">
          <option title="Enabled" value="1"><span>Enabled</span></option>
          <option title="Disabled" value="2"><span>Disabled</span></option>
        </select>
      </template>
      <template #1>{{ connected ? 'Connect' : 'Disconnect' }}</template>
      <template #2>
        <select v-model="registration" class="disabledStyle" disabled="disabled">
          <option title="Enabled" value="1"><span>Enabled</span></option>
          <option title="Disabled" value="2"><span>Disabled</span></option>
        </select>
      </template>
    </common-table>

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="apply">
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
      mode: '2',
      connected: false,
      registration: '2'
    }
  },
  created() {
    cgiGet('sys_cloud').then(d => {
      this.mode = d.enabled ? '1' : '2'
      this.connected = !!d.connected
      this.registration = d.registered ? '1' : '2'
    })
  },
  methods: {
    apply() {
      cgiSet('sys_cloud', { enabled: this.mode === '1' ? 1 : 0 })
    }
  }
}
</script>
