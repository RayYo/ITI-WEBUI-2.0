<template>
  <div class="main_body">
    <div id="basetitle"> IPv4 Interface Configuration </div>
    <div>
      <common-table header-title="Status Settings" :first-column="['Interface', 'State']">
        <template #0>{{ intf }}</template>
        <template #1>
          <select v-model="stateSelected" style="width: 23%;">
            <option :value="1">Enabled</option>
            <option :value="2">Disabled</option>
          </select>
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="stateApply">
    </div>

    <div>
      <common-table header-title="IP Settings" :first-column="['Get IP Form', 'IP Address', 'Subnet Mask']">
        <template #0>
          <select v-model="ipTypeSelected" style="width: 23%;" @change="ipTypeChange">
            <option :value="1"><span>Static</span></option>
            <option :value="2"><span>DHCP</span></option>
          </select>
        </template>
        <template #1>
          <base-input v-model="staticIp" :css="inputClass" :disabled="isDisabled" max-len="15" @check="inputCheck('ip')" />
        </template>
        <template #2>
          <base-input v-model="staticIpMask" :css="inputClass" :disabled="isDisabled" max-len="15" @check="inputCheck('mask')" />
        </template>
      </common-table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Apply" @click="ipApply">
      <input type="button" class="btnOutTable" value="Back" @click="back">
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
      intf: '',
      ipType: 'static',
      staticIp: '',
      staticIpMask: '',
      stateSelected: '',
      ipTypeSelected: '',
      isDisabled: false,
      inputClass: 'baseInput'
    }
  },
  created() {
    const queryObj = this.$route.query
    this.intf = queryObj.intf
    this.stateSelected = (queryObj.state === 'true') ? 1 : 2
    this.ipTypeSelected = (queryObj.ipType === 'static') ? 1 : 2
    this.staticIp = queryObj.ipAddr
    this.staticIpMask = queryObj.ipMask
    this.ipTypeChange()
  },
  methods: {
    stateApply() {
      // todo: post
      message.success()
    },
    ipApply() {
      // static
      if (this.ipTypeSelected === 1) {
        if (applyCheck('ipv4', this.staticIp) === false ||
            applyCheck('ipv4', this.staticIpMask) === false) {
          message.warnBox('Please input a valid value.')
          return
        }
      }
      // todo: post
      message.success()
    },
    back() {
      this.$router.go(-1)
    },
    inputCheck(type) {
      if (type === 'ip') {
        this.staticIp = this.staticIp.replace(/[^0-9\.]/g, '')
      } else {
        this.staticIpMask = this.staticIpMask.replace(/[^0-9\.]/g, '')
      }
    },
    ipTypeChange() {
      if (this.ipTypeSelected === 2) {
        this.isDisabled = true
        this.inputClass = 'baseInput disabledStyle'
      } else {
        this.isDisabled = false
        this.inputClass = 'baseInput'
      }
    }
  }
}
</script>
