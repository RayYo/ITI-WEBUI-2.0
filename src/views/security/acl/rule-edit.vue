<template>
  <div class="main_body">
    <div id="basetitle">Add Access Rule List</div>
    <div>
      <div class="table_title">Access Profile Details</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr v-for="r in detailRows" :key="r[0]">
            <td>{{ r[0] }}</td>
            <td>{{ r[1] }}</td>
          </tr>
        </tbody>
      </table>
      <br>

      <div class="table_title">(Keep an input field as blank to treat the corresponding option as "Don't Care")</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Access ID</td>
            <td>
              <!-- 点 Access ID 链接进入编辑时,Access ID 置灰不可改 -->
              <base-input v-model="accessId" max-len="5" :disabled="isEdit" @check="onlyNum('accessId')" />
              <span class="tipAfterInputBox">* keep blank means auto-assign</span>
            </td>
          </tr>
          <tr>
            <td>Type</td>
            <td>{{ typeText }}</td>
          </tr>

          <!-- L3:IP Protocol 只读灰显 profile 协议 -->
          <tr v-if="isL3 && hasProto">
            <td>IP Protocol</td>
            <td>
              <div style="display: inline-block; width: 50%">
                <input :value="protoName" type="text" class="baseInput disabledStyle" disabled>
              </div>
            </td>
          </tr>

          <!-- L2 -->
          <template v-if="!isL3">
            <tr v-if="p.srcMask">
              <td>Source MAC</td>
              <td>
                <base-input v-model="f.srcMac" max-len="17" />
                <span class="tipAfterInputBox">ex:(00-00-00-00-00-10)</span>
              </td>
            </tr>
            <tr v-if="p.dstMask">
              <td>Destination MAC</td>
              <td>
                <base-input v-model="f.dstMac" max-len="17" />
                <span class="tipAfterInputBox">ex:(00-00-00-00-FF-FF)</span>
              </td>
            </tr>
            <tr v-if="p.vlan">
              <td>VLAN</td>
              <td>
                <select v-model="f.vlanId">
                  <option v-for="v in vlans" :key="v" :value="String(v)">{{ v }}</option>
                </select>
              </td>
            </tr>
            <tr v-if="p.p8021">
              <td>802.1p</td>
              <td>
                <base-input v-model="f.p8021" max-len="1" @check="onlyNumF('p8021')" />
                <span class="tipAfterInputBox">ex:( 0 ~ 7 )</span>
              </td>
            </tr>
            <tr v-if="p.etherType">
              <td>Ether Type</td>
              <td>
                <base-input v-model="f.etherType" max-len="6" />
                <span class="tipAfterInputBox">ex:(0x05DD-0xFFFF)</span>
              </td>
            </tr>
          </template>

          <!-- L3 IPv4 -->
          <template v-if="isL3 && isV4">
            <tr v-if="p.srcMask">
              <td>Source IP</td>
              <td>
                <base-input v-model="f.srcIp" max-len="15" />
                <span class="tipAfterInputBox">ex:(192.168.1.10)</span>
              </td>
            </tr>
            <tr v-if="p.dstMask">
              <td>Destination IP</td>
              <td>
                <base-input v-model="f.dstIp" max-len="15" />
                <span class="tipAfterInputBox">ex:(192.168.1.10)</span>
              </td>
            </tr>
          </template>

          <!-- L3 共用:端口/DSCP/ToS/Class/ICMP/IGMP -->
          <template v-if="isL3">
            <tr v-if="p.srcPort">
              <td>Source Port</td>
              <td>
                <base-input v-model="f.srcPort" max-len="6" />
                <span class="tipAfterInputBox">ex:(0-0xFFFF)</span>
              </td>
            </tr>
            <tr v-if="p.dstPort">
              <td>Destination Port</td>
              <td>
                <base-input v-model="f.dstPort" max-len="6" />
                <span class="tipAfterInputBox">ex:(0-0xFFFF)</span>
              </td>
            </tr>
            <tr v-if="isV4 && p.dscp">
              <td>DSCP</td>
              <td>
                <base-input v-model="f.dscp" max-len="2" @check="onlyNumF('dscp')" />
                <span class="tipAfterInputBox">ex:(0-63)</span>
              </td>
            </tr>
            <tr v-if="isV4 && p.tos">
              <td>ToS</td>
              <td>
                <base-input v-model="f.tos" max-len="3" @check="onlyNumF('tos')" />
                <span class="tipAfterInputBox">ex:(0-255)</span>
              </td>
            </tr>
            <tr v-if="!isV4 && p.trafficClass">
              <td>IPv6 Class</td>
              <td>
                <base-input v-model="f.ipv6Class" max-len="3" @check="onlyNumF('ipv6Class')" />
                <span class="tipAfterInputBox">ex:(0-255)</span>
              </td>
            </tr>
            <tr v-if="p.icmpType">
              <td>ICMP Type</td>
              <td>
                <base-input v-model="f.icmpType" max-len="3" @check="onlyNumF('icmpType')" />
                <span class="tipAfterInputBox">ex:(0-255)</span>
              </td>
            </tr>
            <tr v-if="p.icmpCode">
              <td>ICMP Code</td>
              <td>
                <base-input v-model="f.icmpCode" max-len="3" @check="onlyNumF('icmpCode')" />
                <span class="tipAfterInputBox">ex:(0-255)</span>
              </td>
            </tr>
            <tr v-if="isV4 && p.igmpType">
              <td>IGMP Type</td>
              <td>
                <base-input v-model="f.igmpType" max-len="3" @check="onlyNumF('igmpType')" />
                <span class="tipAfterInputBox">ex:(0-255)</span>
              </td>
            </tr>
            <tr v-if="p.tcpFlag">
              <td>TCP Flag Mask</td>
              <td>
                <div v-for="line in FLAG_LINES" :key="line[0]" style="margin: 4px 0">
                  <template v-for="fl in line">
                    <span :key="fl" style="display: inline-block; width: 34px; text-align: right; margin-right: 5px">{{ FLAG_LABELS[fl] }}</span>
                    <select :key="fl + '-s'" v-model="f.tcpFlags[fl]" style="width: 110px !important; margin-right: 45px">
                      <option value="0">Don't Care</option>
                      <option value="1">Set</option>
                      <option value="2">UnSet</option>
                    </select>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="!isV4 && p.srcMask">
              <td>Source IPv6</td>
              <td>
                <base-input v-model="f.srcIp6" max-len="43" />
                <span class="tipAfterInputBox">Ex:(1234::1234)</span>
              </td>
            </tr>
            <tr v-if="!isV4 && p.dstMask">
              <td>Destination IPv6</td>
              <td>
                <base-input v-model="f.dstIp6" max-len="43" />
                <span class="tipAfterInputBox">Ex:(1234::1234)</span>
              </td>
            </tr>
          </template>

          <tr>
            <td>Ports</td>
            <td>
              <base-input v-model="f.ports" max-len="1024" />
              <span class="tipAfterInputBox">Ex:(1,2)</span>
            </td>
          </tr>
          <tr>
            <td>Action</td>
            <td>
              <select v-model="f.action">
                <option value="1">Permit</option>
                <option value="2">Deny</option>
                <option value="4">Rate Limit</option>
                <option value="6">Replace DSCP</option>
              </select>
              <div style="width: 50%">
                <input v-model="f.actionVal" type="text" maxlength="1024" autocomplete="off" class="baseInput" :class="{ disabledStyle: !actionNeedsVal }" :disabled="!actionNeedsVal">
              </div>
              <span v-if="actionHint" class="tipAfterInputBox">{{ actionHint }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Previous Page" @click="$router.back()">
        <input type="button" class="btnOutTable" value="Create/Modify" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiSet } from '@/api/cgi'
import { aclProfileDetailRows, loadAclProfile } from './acl-common'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

const FLAG_LINES = [['urg', 'ack', 'psh'], ['rst', 'syn', 'fin']]
const FLAG_LABELS = { urg: 'Urg', ack: 'Ack', psh: 'Psh', rst: 'Rst', syn: 'Syn', fin: 'Fin' }
const emptyFlags = () => ({ urg: '0', ack: '0', psh: '0', rst: '0', syn: '0', fin: '0' })

export default {
  components: { baseInput },
  data() {
    return {
      FLAG_LINES,
      FLAG_LABELS,
      detailRows: [],
      vlans: [1],
      p: {},
      accessId: '',
      f: {
        srcMac: '', dstMac: '', vlanId: '1', p8021: '', etherType: '',
        srcIp: '', dstIp: '', srcPort: '', dstPort: '', dscp: '', tos: '', ipv6Class: '',
        icmpType: '', icmpCode: '', igmpType: '', tcpFlags: emptyFlags(),
        srcIp6: '', dstIp6: '',
        ports: '', action: '1', actionVal: ''
      }
    }
  },
  computed: {
    isL3() { return this.$route.query.type === 'L3' },
    isV4() { return this.p.ipType !== 'IPv6' },
    isEdit() { return this.$route.query.accessId != null },
    profileId() { return this.$route.query.id },
    typeText() {
      if (!this.isL3) return 'Layer 2'
      return this.isV4 ? 'IPv4' : 'IPv6'
    },
    hasProto() { return !!this.p.protocol },
    protoName() { return this.p.protocolName || String(this.p.protocol || '') },
    actionNeedsVal() { return this.f.action === '4' || this.f.action === '6' },
    actionHint() {
      if (this.f.action === '4') return 'ex:(16 ~ 1000000), will auto-assign to a multiple of 16 value'
      if (this.f.action === '6') return 'ex: DSCP (0~63)'
      return ''
    }
  },
  watch: {
    'f.action'() { if (!this.actionNeedsVal) this.f.actionVal = '' },
    // 同页不同 query 导航时组件被复用,需重置并重新加载
    $route: 'init'
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.p = {}
      this.detailRows = []
      this.accessId = ''
      this.f = {
        srcMac: '', dstMac: '', vlanId: '1', p8021: '', etherType: '',
        srcIp: '', dstIp: '', srcPort: '', dstPort: '', dscp: '', tos: '', ipv6Class: '',
        icmpType: '', icmpCode: '', igmpType: '', tcpFlags: emptyFlags(),
        srcIp6: '', dstIp6: '',
        ports: '', action: '1', actionVal: ''
      }
      const { type, id, accessId } = this.$route.query
      loadAclProfile(type, id).then(({ profile, vlans }) => {
        this.vlans = vlans
        this.f.vlanId = String(vlans[0] != null ? vlans[0] : 1)
        if (!profile) return
        this.p = profile
        this.detailRows = aclProfileDetailRows(profile)
        // 点 Access ID 链接进来 = 编辑该 rule,表单预填
        if (accessId != null) {
          const rule = (profile.rules || []).find(r => String(r.accessId) === String(accessId))
          if (rule) {
            this.accessId = String(rule.accessId)
            const strKeys = ['srcMac', 'dstMac', 'p8021', 'etherType', 'srcIp', 'dstIp', 'srcPort', 'dstPort',
              'dscp', 'tos', 'ipv6Class', 'icmpType', 'icmpCode', 'igmpType', 'srcIp6', 'dstIp6', 'ports', 'actionVal']
            strKeys.forEach(k => { if (rule[k] != null) this.f[k] = String(rule[k]) })
            if (rule.vlanId != null) this.f.vlanId = String(rule.vlanId)
            if (rule.action != null) this.f.action = String(rule.action)
            if (rule.tcpFlags) this.f.tcpFlags = Object.assign(emptyFlags(), rule.tcpFlags)
          }
        }
      })
    },
    onlyNum(key) {
      this[key] = this[key].replace(/[^0-9]/g, '')
    },
    onlyNumF(key) {
      this.f[key] = this.f[key].replace(/[^0-9]/g, '')
    },
    hexVal(s) {
      if (/^0x[0-9a-f]{1,4}$/i.test(s)) return parseInt(s, 16)
      if (/^\d+$/.test(s)) return Number(s)
      return NaN
    },
    // 必填 + 范围校验(0 ~ max)
    checkNum(val, max, label) {
      if (val === '') { message.warnBox(`Please input ${label}.`); return false }
      if (!/^\d+$/.test(val) || Number(val) > max) { message.warnBox(`${label} must be within 0 ~ ${max}.`); return false }
      return true
    },
    onApply() {
      const f = this.f
      const p = this.p
      // 仅校验当前表单中显示的行;每项必填且在范围内
      const macOk = (v, label, ex) => {
        if (v === '') { message.warnBox(`Please input ${label}.`); return false }
        if (!/^([0-9a-f]{2}-){5}[0-9a-f]{2}$/i.test(v)) { message.warnBox(`Invalid ${label}. ex:(${ex})`); return false }
        return true
      }
      const ip4Ok = (v, label) => {
        if (v === '') { message.warnBox(`Please input ${label}.`); return false }
        const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v)
        if (!m || !m.slice(1, 5).every(n => Number(n) <= 255)) { message.warnBox(`Invalid ${label}. ex:(192.168.1.10)`); return false }
        return true
      }
      const ip6Ok = (v, label) => {
        if (v === '') { message.warnBox(`Please input ${label}.`); return false }
        if (!/^[0-9a-f:]+$/i.test(v) || v.indexOf(':') === -1) { message.warnBox(`Invalid ${label}. Ex:(1234::1234)`); return false }
        return true
      }
      const portOk = (v, label) => {
        if (v === '') { message.warnBox(`Please input ${label}.`); return false }
        const n = this.hexVal(v)
        if (isNaN(n) || n > 0xFFFF) { message.warnBox(`${label} must be within 0 ~ 0xFFFF.`); return false }
        return true
      }
      if (!this.isL3) {
        if (p.srcMask && !macOk(f.srcMac, 'Source MAC', '00-00-00-00-00-10')) return
        if (p.dstMask && !macOk(f.dstMac, 'Destination MAC', '00-00-00-00-FF-FF')) return
        if (p.p8021 && !this.checkNum(f.p8021, 7, '802.1p')) return
        if (p.etherType) {
          if (f.etherType === '') { message.warnBox('Please input Ether Type.'); return }
          const v = this.hexVal(f.etherType)
          if (isNaN(v) || v < 0x05DD || v > 0xFFFF) { message.warnBox('Ether Type must be within 0x05DD ~ 0xFFFF.'); return }
        }
      } else if (this.isV4) {
        if (p.srcMask && !ip4Ok(f.srcIp, 'Source IP')) return
        if (p.dstMask && !ip4Ok(f.dstIp, 'Destination IP')) return
        if (p.srcPort && !portOk(f.srcPort, 'Source Port')) return
        if (p.dstPort && !portOk(f.dstPort, 'Destination Port')) return
        if (p.dscp && !this.checkNum(f.dscp, 63, 'DSCP')) return
        if (p.tos && !this.checkNum(f.tos, 255, 'ToS')) return
        if (p.icmpType && !this.checkNum(f.icmpType, 255, 'ICMP Type')) return
        if (p.icmpCode && !this.checkNum(f.icmpCode, 255, 'ICMP Code')) return
        if (p.igmpType && !this.checkNum(f.igmpType, 255, 'IGMP Type')) return
      } else {
        if (p.srcPort && !portOk(f.srcPort, 'Source Port')) return
        if (p.dstPort && !portOk(f.dstPort, 'Destination Port')) return
        if (p.trafficClass && !this.checkNum(f.ipv6Class, 255, 'IPv6 Class')) return
        if (p.icmpType && !this.checkNum(f.icmpType, 255, 'ICMP Type')) return
        if (p.icmpCode && !this.checkNum(f.icmpCode, 255, 'ICMP Code')) return
        if (p.srcMask && !ip6Ok(f.srcIp6, 'Source IPv6')) return
        if (p.dstMask && !ip6Ok(f.dstIp6, 'Destination IPv6')) return
      }
      if (f.ports === '') { message.warnBox('Please input Ports.'); return }
      if (!/^\d+(-\d+)?(,\d+(-\d+)?)*$/.test(f.ports)) { message.warnBox('Invalid Ports. Ex:(1,2)'); return }
      if (f.action === '4') {
        const v = Number(f.actionVal)
        if (!/^\d+$/.test(f.actionVal) || v < 16 || v > 1000000) { message.warnBox('Rate Limit must be within 16 ~ 1000000.'); return }
      }
      if (f.action === '6') {
        const v = Number(f.actionVal)
        if (!/^\d+$/.test(f.actionVal) || v > 63) { message.warnBox('DSCP must be within 0 ~ 63.'); return }
      }
      cgiSet('sec_aclRuleEdit', {
        profileId: this.profileId, accessId: this.accessId, ...f, tcpFlags: JSON.stringify(f.tcpFlags)
      }, { successMsg: false }).then(() => {
        this.$router.back()
        const idPart = this.accessId ? `${this.accessId} ` : ''
        message.successMsg(`Successfully create rule with access id ${idPart}on profile ${this.profileId}`)
      })
    }
  }
}
</script>
