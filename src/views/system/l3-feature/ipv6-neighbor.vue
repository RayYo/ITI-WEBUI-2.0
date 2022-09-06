<template>
  <div class="main_body">
    <div id="basetitle">IPv6 Neighbor Settings</div>
    <div>
      <common-table
        header-title="IPv6 Neighbor Settings"
        :first-column="['Neighbor IPv6 Address','Link Layer MAC Address']"
      >
        <template #0>
          <base-input v-model="neighborIpv6" max-len="43" @check="inputCheck('ipv6')" />
          <span class="tipAfterInputBox"> *</span>
        </template>
        <template #1>
          <base-input v-model="macAddr" max-len="17" @check="inputCheck('mac')" />
          <span class="tipAfterInputBox"> * (XX:XX:XX:XX:XX:XX)</span>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" :class="btnClass" value="Add" @click="add">
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
      neighborIpv6: '',
      macAddr: ''
    }
  },
  created() {
    // get data

  },
  methods: {
    add() {
      // check
      if (!applyCheck('ipv6', this.neighborIpv6)) {
        message.warnBox('Invalid IPv6 address.')
        return
      }
      if (!applyCheck('mac', this.macAddr)) {
        message.warnBox('Invalid MAC address.')
        return
      }
      // post
      message.success()
    },
    inputCheck(type) {
      if (type === 'ipv6') {
        this.neighborIpv6 = this.neighborIpv6.replace(/[^a-fA-F0-9:]/g, '')
      } else {
        this.macAddr = this.macAddr.replace(/[^a-fA-F0-9:-]/g, '')
      }
    }
  }
}
</script>
