<template>
  <div class="main_body">
    <div id="basetitle">ACL Configuration Wizard</div>
    <div>
      <div class="table_title">General ACL Rules</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Rule Type</td>
            <td>
              <input type="button" class="btnOutTable" :class="{ btnDisabled: ruleType === 'L2' }" value="Add L2 Rule" :disabled="ruleType === 'L2'" @click="ruleType = 'L2'">
              <input type="button" class="btnOutTable" :class="{ btnDisabled: ruleType === 'L3' }" value="Add L3 Rule" :disabled="ruleType === 'L3'" @click="ruleType = 'L3'">
            </td>
          </tr>
        </tbody>
      </table>
      <br>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Source</td>
            <td>
              <select v-model="src">
                <option v-for="o in addrOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <input v-model="srcVal" class="input150" :class="{ disabledStyle: srcAny }" :disabled="srcAny">
            </td>
          </tr>
          <tr>
            <td>Destination</td>
            <td>
              <select v-model="dst">
                <option v-for="o in addrOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <input v-model="dstVal" class="input150" :class="{ disabledStyle: dstAny }" :disabled="dstAny">
            </td>
          </tr>
          <tr>
            <td>Service Type</td>
            <td>
              <select v-model="serviceType">
                <option v-for="o in serviceOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <input v-model="serviceVal" type="text" maxlength="1024" class="baseInput" :class="{ disabledStyle: serviceAny }" :disabled="serviceAny">
            </td>
          </tr>
          <tr>
            <td>Action</td>
            <td>
              <select v-model="action">
                <option value="1">Permit</option>
                <option value="2">Deny</option>
                <option value="4">Rate Limit</option>
                <option value="6">Replace DSCP</option>
              </select>
              <input v-model="actionVal" type="text" maxlength="1024" class="baseInput" :class="{ disabledStyle: !actionNeedsVal }" :disabled="!actionNeedsVal">
            </td>
          </tr>
          <tr>
            <td>Ports</td>
            <td>
              <base-input v-model="ports" max-len="1024" />
              <span>Ex:(1,2,4-6)</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
        <input type="button" class="btnOutTable" value="Cancel" @click="onCancel">
      </div>
      <div class="note">
        <span>
          Note:
          &nbsp;ACL Wizard will create the access profile and rule automatically.
          <br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For advanced access profile/rule setting. you can manually configure it in Access Profile List.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiSet } from '@/api/cgi'
import baseInput from '@/components/CustomInput/base-input.vue'

const L2_ADDR = [{ value: '5', label: 'Any' }, { value: '3', label: 'MAC Address' }]
const L3_ADDR = [{ value: '6', label: 'Any' }, { value: '1', label: 'IPv4 Address' }, { value: '2', label: 'IPv6 Address' }]
const L2_SERVICE = [{ value: '1', label: 'Any' }, { value: '2', label: 'EtherType' }]
const L3_SERVICE = [
  { value: '1', label: 'Any' }, { value: '3', label: 'ICMP All' }, { value: '4', label: 'IGMP' },
  { value: '5', label: 'TCP All' }, { value: '6', label: 'TCP Source Port' }, { value: '7', label: 'TCP Destination Port' },
  { value: '8', label: 'UDP All' }, { value: '9', label: 'UDP Source Port' }, { value: '10', label: 'UDP Destination Port' }
]

export default {
  components: { baseInput },
  data() {
    return {
      ruleType: 'L2',
      src: '5', srcVal: '',
      dst: '5', dstVal: '',
      serviceType: '1', serviceVal: '',
      action: '1', actionVal: '',
      ports: ''
    }
  },
  computed: {
    addrOpts() { return this.ruleType === 'L2' ? L2_ADDR : L3_ADDR },
    serviceOpts() { return this.ruleType === 'L2' ? L2_SERVICE : L3_SERVICE },
    anyAddr() { return this.ruleType === 'L2' ? '5' : '6' },
    srcAny() { return this.src === this.anyAddr },
    dstAny() { return this.dst === this.anyAddr },
    serviceAny() { return this.serviceType === '1' },
    actionNeedsVal() { return this.action === '4' || this.action === '6' }
  },
  watch: {
    ruleType() {
      this.src = this.anyAddr; this.dst = this.anyAddr; this.serviceType = '1'
      this.srcVal = ''; this.dstVal = ''; this.serviceVal = ''
    }
  },
  methods: {
    onApply() {
      cgiSet('sec_aclWizardApply', {
        ruleType: this.ruleType, src: this.src, srcVal: this.srcVal, dst: this.dst, dstVal: this.dstVal,
        serviceType: this.serviceType, serviceVal: this.serviceVal, action: this.action, actionVal: this.actionVal, ports: this.ports
      })
    },
    onCancel() {
      this.src = this.anyAddr; this.dst = this.anyAddr; this.serviceType = '1'; this.action = '1'
      this.srcVal = ''; this.dstVal = ''; this.serviceVal = ''; this.actionVal = ''; this.ports = ''
    }
  }
}
</script>
