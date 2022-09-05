<template>
  <div class="main_body">
    <div id="basetitle">IPv6 Static/Default Route</div>
    <div>
      <common-table
        header-title="IPv6 Static/Default Route"
        :first-column="['IPv6 Address/Prefix Length', 'Interface VLAN', 'Next Hop IPv6 Address', 'Backup Status']"
      >
        <template #0>
          <base-input v-model="ipv6Addr" :disabled="checkboxValue" :css="ipInputClass" max-len="43" placeholder="2023::1/64" @check="inputCheck('ipv6')" />
          <input v-model="checkboxValue" type="checkbox" class="tipAfterInputBox">
          <span class="tipAfterInputBox">Default Route</span>
        </template>
        <template #1>
          <base-input v-model="vlan" max-len="4" @check="inputCheck('vlan')" />
          <span class="tipAfterInputBox">(1-4094)</span>
        </template>
        <template #2>
          <base-input v-model="nextHopIpv6" max-len="39" placeholder="2022::1" @check="inputCheck('nextHopIpv6')" />
        </template>
        <template #3>
          <select v-model="backupSelect">
            <option title="Please Select" value="-1"><span>Please Select</span></option>
            <option title="Primary" value="1"><span>Primary</span></option>
            <option title="Backup" value="2"><span>Backup</span></option>
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
import baseInput from '@/components/CustomInput/base-input.vue'
import { applyCheck } from '@/utils'
export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      btnClass: 'btnOutTable',
      ipv6Addr: '',
      checkboxValue: true,
      vlan: '',
      nextHopIpv6: '',
      backupSelect: '-1'

    }
  },
  computed: {
    ipInputClass() {
      return this.checkboxValue ? 'baseInput disabledStyle' : 'baseInput'
    }
  },
  created() {
    // get data
  },
  methods: {
    apply() {
      // check
      if (!this.checkboxValue && applyCheck('ipv6CIDR', this.ipv6Addr) === false) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please input ipv6 address/prefix.'
        })
        return
      }
      if (this.vlan < 1 || this.vlan > 4094) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please enter an integer between 1 ~ 4094'
        })
        return
      }
      if (applyCheck('ipv6', this.nextHopIpv6) === false) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Invalid IPv6 address.'
        })
        return
      }
      if (this.backupSelect < 0) {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Please select Backup Status.'
        })
        return
      }
      // post
      this.$message.success({
        showClose: true,
        message: 'Success.'
      })
    },
    inputCheck(t) {
      switch (t) {
        case 'vlan':
          this.vlan = this.vlan.replace(/[^0-9]/g, '')
          break
        case 'ipv6':
          this.ipv6Addr = this.ipv6Addr.replace(/[^a-fA-F0-9:/]/g, '')
          break
        case 'nextHopIpv6':
          this.nextHopIpv6 = this.nextHopIpv6.replace(/[^a-fA-F0-9:]/g, '')
          break

        default:
          break
      }
    }
  }
}
</script>
