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
              <select v-model="src" style="width: 27% !important">
                <option v-for="o in addrOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>{{ ' ' }}
              <input v-model="srcVal" class="input150" :disabled="srcAny">{{ ' ' }}
              <span>{{ addrHint(src) }}</span>
            </td>
          </tr>
          <tr>
            <td>Destination</td>
            <td>
              <select v-model="dst" style="width: 27% !important">
                <option v-for="o in addrOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>{{ ' ' }}
              <input v-model="dstVal" class="input150" :disabled="dstAny">{{ ' ' }}
              <span>{{ addrHint(dst) }}</span>
            </td>
          </tr>
          <tr>
            <td>Service Type</td>
            <td>
              <select v-model="serviceType" style="width: 27% !important">
                <option v-for="o in serviceOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>{{ ' ' }}
              <!-- 副 select:仅 L2+EtherType 可编辑(3 项);其余状态为空的禁用灰 select(原版即如此) -->
              <select v-model="etherSub" style="width: 27% !important" :class="{ disabledStyle: !subEnabled }" :disabled="!subEnabled">
                <template v-if="subEnabled">
                  <option value="1">IP(0x0800)</option>
                  <option value="2">ARP(0x0806)</option>
                  <option value="3">User Define</option>
                </template>
              </select>{{ ' ' }}
              <div style="display: inline-block; width: 27%">
                <!-- EtherType 选 IP/ARP 时只读白底显示 800/806(不置灰);User Define 可编辑 -->
                <input v-model="serviceVal" type="text" maxlength="1024" autocomplete="off" class="baseInput" :class="{ disabledStyle: serviceDisabled }" :disabled="serviceDisabled" :readonly="serviceReadonly">
              </div>{{ ' ' }}
              <span>{{ serviceHint }}</span>
            </td>
          </tr>
          <tr>
            <td>Action</td>
            <td>
              <select v-model="action" style="width: 27% !important">
                <option value="1">Permit</option>
                <option value="2">Deny</option>
                <option value="4">Rate Limit</option>
                <option value="6">Replace DSCP</option>
              </select>{{ ' ' }}
              <div style="display: inline-block; width: 27%">
                <input v-model="actionVal" type="text" maxlength="1024" autocomplete="off" class="baseInput" :class="{ disabledStyle: !actionNeedsVal }" :disabled="!actionNeedsVal">
              </div>{{ ' ' }}
              <span>{{ actionHint }}</span>
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
          Note:{{ NBSP }}ACL Wizard will create the access profile and rule automatically.
          <br>{{ NBSP10 }}For advanced access profile/rule setting. you can manually configure it in Access Profile List.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiSet } from '@/api/cgi'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

const L2_ADDR = [{ value: '5', label: 'Any' }, { value: '3', label: 'MAC Address' }]
const L3_ADDR = [{ value: '6', label: 'Any' }, { value: '1', label: 'IPv4 Address' }, { value: '2', label: 'IPv6 Address' }]
const L2_SERVICE = [{ value: '1', label: 'Any' }, { value: '2', label: 'EtherType' }]
const L3_SERVICE = [
  { value: '1', label: 'Any' }, { value: '3', label: 'ICMP All' },
  { value: '5', label: 'TCP All' }, { value: '6', label: 'TCP Source Port' }, { value: '7', label: 'TCP Destination Port' },
  { value: '8', label: 'UDP All' }, { value: '9', label: 'UDP Source Port' }, { value: '10', label: 'UDP Destination Port' }
]
// L3 中 Service 值输入不可编辑的项(Any/ICMP All/TCP All/UDP All)
const L3_SERVICE_NOVAL = ['1', '3', '5', '8']
// Vue 模板会把 &nbsp; 连同周围空白折叠成单个空格,必须用插值保住
const NBSP = ' '

export default {
  components: { baseInput },
  data() {
    return {
      NBSP,
      NBSP10: NBSP.repeat(10),
      ruleType: 'L2',
      src: '5', srcVal: '',
      dst: '5', dstVal: '',
      serviceType: '1', etherSub: '1', serviceVal: '',
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
    subEnabled() { return this.ruleType === 'L2' && this.serviceType === '2' },
    serviceDisabled() {
      if (this.ruleType === 'L2') return this.serviceType === '1'
      return L3_SERVICE_NOVAL.indexOf(this.serviceType) !== -1
    },
    serviceReadonly() { return this.subEnabled && this.etherSub !== '3' },
    serviceHint() {
      if (this.ruleType === 'L2') return this.serviceType === '2' ? 'Ex:(0x05DD ~ 0xFFFF)' : ''
      return this.serviceDisabled ? '' : 'Ex:(0 ~ 0xFFFF)'
    },
    actionNeedsVal() { return this.action === '4' || this.action === '6' },
    actionHint() {
      if (this.action === '4') return 'ex:(16 ~ 1000000), will auto-assign to a multiple of 16 value'
      if (this.action === '6') return 'ex: DSCP (0~63)'
      return ''
    }
  },
  watch: {
    // L2/L3 切换重置全部输入,杜绝残留
    ruleType() { this.onCancel() },
    serviceType() {
      this.etherSub = '1'
      this.serviceVal = this.subEnabled ? '800' : ''
    },
    etherSub(v) {
      if (!this.subEnabled) return
      this.serviceVal = v === '1' ? '800' : v === '2' ? '806' : ''
    },
    src(v) { if (v === this.anyAddr) this.srcVal = '' },
    dst(v) { if (v === this.anyAddr) this.dstVal = '' },
    action() { if (!this.actionNeedsVal) this.actionVal = '' }
  },
  methods: {
    addrHint(sel) {
      if (sel === this.anyAddr) return ''
      if (this.ruleType === 'L2') return 'Ex:(00-00-00-00-00-01)'
      return sel === '1' ? 'Ex:(192.168.1.10/24)' : 'Ex:(1234::1234/64)'
    },
    validAddr(sel, val) {
      if (sel === this.anyAddr) return true
      if (this.ruleType === 'L2') return /^([0-9a-f]{2}-){5}[0-9a-f]{2}$/i.test(val)
      if (sel === '1') {
        const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/.exec(val)
        return !!m && m.slice(1, 5).every(n => Number(n) <= 255) && Number(m[5]) <= 32
      }
      const m6 = /^([0-9a-f:]+)\/(\d{1,3})$/i.exec(val)
      return !!m6 && m6[1].indexOf(':') !== -1 && Number(m6[2]) <= 128
    },
    // 接受十进制或 0x 十六进制,返回数值(非法返回 NaN)
    numVal(s) {
      if (/^0x[0-9a-f]{1,4}$/i.test(s)) return parseInt(s, 16)
      if (/^[0-9a-f]{1,4}$/i.test(s)) return parseInt(s, 16)
      return NaN
    },
    validPorts(val) {
      if (!/^\d+(-\d+)?(,\d+(-\d+)?)*$/.test(val)) return false
      return val.split(',').every(seg => {
        const [a, b] = seg.split('-').map(Number)
        return a >= 1 && a <= 28 && (b === undefined || (b <= 28 && a < b))
      })
    },
    onApply() {
      if (!this.validAddr(this.src, this.srcVal)) { message.warnBox('Invalid Source address.'); return }
      if (!this.validAddr(this.dst, this.dstVal)) { message.warnBox('Invalid Destination address.'); return }
      if (this.ruleType === 'L2' && this.subEnabled && this.etherSub === '3') {
        const v = this.numVal(this.serviceVal)
        if (isNaN(v) || v < 0x05DD || v > 0xFFFF) { message.warnBox('EtherType must be within 0x05DD ~ 0xFFFF.'); return }
      }
      if (this.ruleType === 'L3' && !this.serviceDisabled) {
        const v = /^\d+$/.test(this.serviceVal) ? Number(this.serviceVal) : this.numVal(this.serviceVal)
        if (isNaN(v) || v < 0 || v > 0xFFFF) { message.warnBox('Service port must be within 0 ~ 0xFFFF.'); return }
      }
      if (this.action === '4') {
        const v = Number(this.actionVal)
        if (!/^\d+$/.test(this.actionVal) || v < 16 || v > 1000000) { message.warnBox('Rate Limit must be within 16 ~ 1000000.'); return }
      }
      if (this.action === '6') {
        const v = Number(this.actionVal)
        if (!/^\d+$/.test(this.actionVal) || v > 63) { message.warnBox('DSCP must be within 0 ~ 63.'); return }
      }
      if (!this.validPorts(this.ports)) { message.warnBox('Invalid Ports. Ex:(1,2,4-6)'); return }
      cgiSet('sec_aclWizardApply', {
        ruleType: this.ruleType, src: this.src, srcVal: this.srcVal, dst: this.dst, dstVal: this.dstVal,
        serviceType: this.serviceType, etherSub: this.subEnabled ? this.etherSub : '',
        serviceVal: this.serviceVal, action: this.action, actionVal: this.actionVal, ports: this.ports
      })
    },
    onCancel() {
      this.src = this.anyAddr; this.dst = this.anyAddr
      this.srcVal = ''; this.dstVal = ''
      this.serviceType = '1'; this.etherSub = '1'; this.serviceVal = ''
      this.action = '1'; this.actionVal = ''; this.ports = ''
    }
  }
}
</script>
