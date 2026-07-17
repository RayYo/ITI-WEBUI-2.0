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
              <input type="button" class="btnOutTable" :class="{ btnDisabled: formVisible && ruleType === 'L2' }" value="Add L2 Rule" :disabled="formVisible && ruleType === 'L2'" @click="openForm('L2')">
              <input type="button" class="btnOutTable" :class="{ btnDisabled: formVisible && ruleType === 'L3' }" value="Add L3 Rule" :disabled="formVisible && ruleType === 'L3'" @click="openForm('L3')">
            </td>
          </tr>
        </tbody>
      </table>
      <br>
      <!-- Cancel 后表单/按钮/Note 均 display:none(v-show),两个 Rule Type 按钮恢复可点 -->
      <table v-show="formVisible" border="" cellspacing="0" class="from_table">
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
              <!-- 副 select:L2+EtherType / L3+IGMP 时可编辑;其余状态为空的禁用灰 select(原版即如此) -->
              <select v-model="sub" style="width: 27% !important" :class="{ disabledStyle: !subEnabled }" :disabled="!subEnabled">
                <option v-for="o in subOpts" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>{{ ' ' }}
              <div style="display: inline-block; width: 27%">
                <!-- 副 select 选定值时只读白底显示对应码(800/806、11/12/16/17);User Define 可编辑 -->
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
      <div v-show="formVisible" class="margin1015">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
        <input type="button" class="btnOutTable" value="Cancel" @click="onCancel">
      </div>
      <div v-show="formVisible" class="note">
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
  { value: '1', label: 'Any' }, { value: '3', label: 'ICMP All' }, { value: '4', label: 'IGMP' },
  { value: '5', label: 'TCP All' }, { value: '6', label: 'TCP Source Port' }, { value: '7', label: 'TCP Destination Port' },
  { value: '8', label: 'UDP All' }, { value: '9', label: 'UDP Source Port' }, { value: '10', label: 'UDP Destination Port' }
]
// L3 中 Service 值输入置灰的项(Any/ICMP All/TCP All/UDP All)
const L3_SERVICE_NOVAL = ['1', '3', '5', '8']
// L3 中按端口号过滤的项(TCP/UDP Source/Destination Port)
const L3_SERVICE_PORT = ['6', '7', '9', '10']
// 副 select 选项:value=提交值,val=右侧 input 联动显示的码
const ETHER_SUB = [
  { value: '1', label: 'IP(0x0800)', val: '800' },
  { value: '2', label: 'ARP(0x0806)', val: '806' },
  { value: '3', label: 'User Define', val: '' }
]
const IGMP_SUB = [
  { value: '4', label: 'IGMP Query(0x11)', val: '11' },
  { value: '5', label: 'IGMPv1 Report(0x12)', val: '12' },
  { value: '6', label: 'IGMPv2 Report(0x16)', val: '16' },
  { value: '7', label: 'IGMPv2 Leave(0x17)', val: '17' },
  { value: '8', label: 'User Define', val: '' }
]
// Vue 模板会把 &nbsp; 连同周围空白折叠成单个空格,必须用插值保住
const NBSP = ' '

export default {
  components: { baseInput },
  data() {
    return {
      NBSP,
      NBSP10: NBSP.repeat(10),
      formVisible: true,
      ruleType: 'L2',
      src: '5', srcVal: '',
      dst: '5', dstVal: '',
      serviceType: '1', sub: '', serviceVal: '',
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
    subOpts() {
      if (this.ruleType === 'L2' && this.serviceType === '2') return ETHER_SUB
      if (this.ruleType === 'L3' && this.serviceType === '4') return IGMP_SUB
      return []
    },
    subEnabled() { return this.subOpts.length > 0 },
    isUserDefine() {
      return this.subEnabled && this.sub === this.subOpts[this.subOpts.length - 1].value
    },
    serviceDisabled() {
      if (this.ruleType === 'L2') return this.serviceType === '1'
      return L3_SERVICE_NOVAL.indexOf(this.serviceType) !== -1
    },
    serviceReadonly() { return this.subEnabled && !this.isUserDefine },
    serviceHint() {
      if (this.ruleType === 'L2') return this.serviceType === '2' ? 'Ex:(0x05DD ~ 0xFFFF)' : ''
      if (this.serviceType === '4') return 'Ex:(0 ~ 0xFF)'
      return L3_SERVICE_PORT.indexOf(this.serviceType) !== -1 ? 'Ex:(0 ~ 0xFFFF)' : ''
    },
    actionNeedsVal() { return this.action === '4' || this.action === '6' },
    actionHint() {
      if (this.action === '4') return 'ex:(16 ~ 1000000), will auto-assign to a multiple of 16 value'
      if (this.action === '6') return 'ex: DSCP (0~63)'
      return ''
    }
  },
  watch: {
    serviceType() {
      const first = this.subOpts[0]
      this.sub = first ? first.value : ''
      this.serviceVal = first ? first.val : ''
    },
    sub(v) {
      if (!this.subEnabled) return
      const o = this.subOpts.find(x => x.value === v)
      this.serviceVal = o ? o.val : ''
    },
    src(v) { if (v === this.anyAddr) this.srcVal = '' },
    dst(v) { if (v === this.anyAddr) this.dstVal = '' },
    action() { if (!this.actionNeedsVal) this.actionVal = '' }
  },
  methods: {
    // Rule Type 按钮:切模式并重置全部输入(杜绝 L2/L3 残留),Cancel 后重新展开表单
    openForm(type) {
      this.ruleType = type
      this.resetFields()
      this.formVisible = true
    },
    resetFields() {
      this.src = this.anyAddr; this.dst = this.anyAddr
      this.srcVal = ''; this.dstVal = ''
      this.serviceType = '1'; this.sub = ''; this.serviceVal = ''
      this.action = '1'; this.actionVal = ''; this.ports = ''
    },
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
      const max = this.$store.getters.modelInfo('portNum') || 0
      return val.split(',').every(seg => {
        const [a, b] = seg.split('-').map(Number)
        return a >= 1 && a <= max && (b === undefined || (b <= max && a < b))
      })
    },
    onApply() {
      if (!this.validAddr(this.src, this.srcVal)) { message.warnBox('Invalid Source address.'); return }
      if (!this.validAddr(this.dst, this.dstVal)) { message.warnBox('Invalid Destination address.'); return }
      if (this.ruleType === 'L2' && this.isUserDefine) {
        const v = this.numVal(this.serviceVal)
        if (isNaN(v) || v < 0x05DD || v > 0xFFFF) { message.warnBox('EtherType must be within 0x05DD ~ 0xFFFF.'); return }
      }
      if (this.ruleType === 'L3' && this.serviceType === '4' && this.isUserDefine) {
        const v = this.numVal(this.serviceVal)
        if (isNaN(v) || v > 0xFF) { message.warnBox('IGMP Type must be within 0 ~ 0xFF.'); return }
      }
      if (this.ruleType === 'L3' && L3_SERVICE_PORT.indexOf(this.serviceType) !== -1) {
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
        serviceType: this.serviceType, sub: this.subEnabled ? this.sub : '',
        serviceVal: this.serviceVal, action: this.action, actionVal: this.actionVal, ports: this.ports
      })
    },
    // 原版 Cancel:隐藏表单 table + Apply/Cancel 按钮 + Note,Rule Type 两按钮恢复可点
    onCancel() {
      this.resetFields()
      this.formVisible = false
    }
  }
}
</script>
