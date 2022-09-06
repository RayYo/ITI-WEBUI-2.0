<template>
  <div class="main_body">
    <div id="basetitle">DNS Server Settings</div>
    <div>
      <common-table
        header-title="DNS Server Settings"
        :first-column="['DNS IPv4 Server','DNS IPv6 Server']"
      >
        <template #0>
          <base-input v-model="ipv4DnsServer" max-len="15" @check="check('v4DNS')" />
        </template>
        <template #1>
          <base-input v-model="ipv6DnsServer" max-len="43" @check="check('v6DNS')" />
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
import { applyCheck } from '@/utils'

export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      ipv4DnsServer: '',
      ipv6DnsServer: ''
    }
  },
  methods: {
    apply() {
      if (!applyCheck('ipv4', this.ipv4DnsServer)) {
        message.warnBox('Invalid IPv4 address.')
        return
      }
      if (!applyCheck('ipv6', this.ipv6DnsServer)) {
        message.warnBox('Invalid IPv6 address.')
        return
      }
      // post
      message.success()
    },
    check(type) {
      if (type === 'v4DNS') {
        this.ipv4DnsServer = this.ipv4DnsServer.replace(/[^0-9.]/g, '')
      } else {
        this.ipv6DnsServer = this.ipv6DnsServer.replace(/[^a-fA-F0-9:]/g, '')
      }
    }
  }
}
</script>
