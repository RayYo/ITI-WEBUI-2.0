<template>
  <div class="main_body">
    <div id="basetitle">Add ACL Profile</div>
    <div>
      <div class="table_title">Add ACL Profile</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Profile ID</td>
            <td>
              <base-input v-model="profileId" max-len="5" @check="onlyNum" />
              <span class="tipAfterInputBox">* keep blank means auto-assign</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- L2 -->
      <table v-if="type === 'L2'" border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Source MAC Mask</td>
            <td>
              <input v-model="l2.srcMac" maxlength="17" class="input150">
              <span class="tipAfterInputBox">Ex:(ff:ff:ff:ff:ff:ff)</span>
            </td>
          </tr>
          <tr>
            <td>Destination MAC Mask</td>
            <td>
              <input v-model="l2.dstMac" maxlength="17" class="input150">
              <span class="tipAfterInputBox">Ex:(ff:ff:ff:ff:ff:ff)</span>
            </td>
          </tr>
          <tr>
            <td>802.1p check</td>
            <td><input v-model="l2.p8021" type="checkbox"></td>
          </tr>
          <tr>
            <td>VLAN ID check</td>
            <td><input v-model="l2.vlanId" type="checkbox"></td>
          </tr>
          <tr>
            <td>Ether Type check</td>
            <td><input v-model="l2.etherType" type="checkbox"></td>
          </tr>
        </tbody>
      </table>

      <!-- L3:Profile Type 切换 IPv4/IPv6 动态表单 -->
      <table v-else border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Profile Type</td>
            <td>
              <select v-model="l3.profileType">
                <option value="1">IPv4</option>
                <option value="2">IPv6</option>
              </select>
            </td>
          </tr>
          <template v-if="isV4">
            <tr>
              <td>Source IPv4 Mask</td>
              <td>
                <select v-model="l3.srcMask">
                  <option v-for="o in ipv4Masks" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Destination IPv4 Mask</td>
              <td>
                <select v-model="l3.dstMask">
                  <option v-for="o in ipv4Masks" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </td>
            </tr>
            <!-- DSCP / ToS 二选一:勾了一个另一个禁用 -->
            <tr>
              <td>IPv4 DSCP Check</td>
              <td><input v-model="l3.dscp" type="checkbox" :disabled="l3.tos"></td>
            </tr>
            <tr>
              <td>IPv4 ToS Check</td>
              <td><input v-model="l3.tos" type="checkbox" :disabled="l3.dscp"></td>
            </tr>
            <tr>
              <td>IPv4 Protocol</td>
              <td>
                <select v-model="l3.proto">
                  <option value="0">none</option>
                  <option value="1">ICMP</option>
                  <option value="2">IGMP</option>
                  <option value="6">TCP</option>
                  <option value="17">UDP</option>
                  <option value="1001">User Define</option>
                </select>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td>Source IPv6 Mask</td>
              <td>
                <select v-model="l3.srcMask">
                  <option v-for="o in ipv6Masks" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Destination IPv6 Mask</td>
              <td>
                <select v-model="l3.dstMask">
                  <option v-for="o in ipv6Masks" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>IPv6 Traffic Class Check</td>
              <td><input v-model="l3.trafficClass" type="checkbox"></td>
            </tr>
            <tr>
              <td>IPv6 Protocol</td>
              <td>
                <select v-model="l3.proto">
                  <option value="0">none</option>
                  <option value="58">ICMPv6</option>
                  <option value="6">TCP</option>
                  <option value="17">UDP</option>
                </select>
              </td>
            </tr>
          </template>
          <!-- 协议联动的动态勾选行(可同时勾选) -->
          <tr v-for="row in dynRows" :key="row.key">
            <td>{{ row.label }}</td>
            <td><input v-model="l3[row.key]" type="checkbox"></td>
          </tr>
          <tr v-if="type === 'L3' && l3.proto === '1001'">
            <td>Protocol ID</td>
            <td>
              <base-input v-model="l3.protocolId" max-len="4" @check="onlyNumProtocol" />
              <span class="tipAfterInputBox">(0-255)</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Previous Page" @click="$router.back()">
        <input type="button" class="btnOutTable" value="Apply" @click="onApply">
      </div>
    </div>
  </div>
</template>

<script>
import { cgiSet } from '@/api/cgi'
import { ipv4Mask, ipv6Mask } from './acl-common'
import message from '@/utils/message'
import baseInput from '@/components/CustomInput/base-input.vue'

const IPV4_MASKS = [{ value: '0', label: 'Ignore' }].concat(
  Array.from({ length: 32 }, (_, i) => ({ value: ipv4Mask(i + 1), label: `${i + 1} / ${ipv4Mask(i + 1)}` }))
)
const IPV6_MASKS = [{ value: '0', label: 'Ignore' }].concat(
  Array.from({ length: 128 }, (_, i) => ({ value: ipv6Mask(i + 1), label: `${i + 1} / ${ipv6Mask(i + 1)}` }))
)
const DYN_LABELS = {
  icmpType: 'ICMP Type Check',
  icmpCode: 'ICMP Code Check',
  igmpType: 'IGMP Type Check',
  tcpFlag: 'TCP Flag Check',
  srcPort: 'Source Port Check',
  dstPort: 'Destination Port Check'
}
// 协议 → 动态勾选行(none / User Define 无勾选行)
const V4_DYN = { 1: ['icmpType', 'icmpCode'], 2: ['igmpType'], 6: ['tcpFlag', 'srcPort', 'dstPort'], 17: ['srcPort', 'dstPort'] }
const V6_DYN = { 58: ['icmpType', 'icmpCode'], 6: ['tcpFlag', 'srcPort', 'dstPort'], 17: ['srcPort', 'dstPort'] }
const DYN_KEYS = Object.keys(DYN_LABELS)

export default {
  components: { baseInput },
  data() {
    return {
      ipv4Masks: IPV4_MASKS,
      ipv6Masks: IPV6_MASKS,
      profileId: '',
      l2: { srcMac: '', dstMac: '', p8021: false, vlanId: false, etherType: false },
      l3: {
        profileType: '1', srcMask: '0', dstMask: '0',
        dscp: false, tos: false, trafficClass: false,
        proto: '0', protocolId: '',
        icmpType: false, icmpCode: false, igmpType: false, tcpFlag: false, srcPort: false, dstPort: false
      }
    }
  },
  computed: {
    type() {
      return this.$route.query.type === 'L3' ? 'L3' : 'L2'
    },
    isV4() { return this.l3.profileType === '1' },
    dynRows() {
      if (this.type !== 'L3') return []
      const map = this.isV4 ? V4_DYN : V6_DYN
      return (map[this.l3.proto] || []).map(key => ({ key, label: DYN_LABELS[key] }))
    }
  },
  watch: {
    // 切协议:清理旧动态行的勾选与 Protocol ID
    'l3.proto'() {
      DYN_KEYS.forEach(k => { this.l3[k] = false })
      this.l3.protocolId = ''
    },
    // 切 IPv4/IPv6:掩码与下方所有配置复位
    'l3.profileType'() {
      this.l3.srcMask = '0'
      this.l3.dstMask = '0'
      this.l3.dscp = false
      this.l3.tos = false
      this.l3.trafficClass = false
      this.l3.proto = '0'
      DYN_KEYS.forEach(k => { this.l3[k] = false })
      this.l3.protocolId = ''
    }
  },
  methods: {
    onlyNum() {
      this.profileId = this.profileId.replace(/[^0-9]/g, '')
    },
    onlyNumProtocol() {
      this.l3.protocolId = this.l3.protocolId.replace(/[^0-9]/g, '')
    },
    onApply() {
      const macMaskOk = v => v === '' || /^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i.test(v)
      if (this.type === 'L2') {
        if (!macMaskOk(this.l2.srcMac)) { message.warnBox('Invalid Source MAC Mask. Ex:(ff:ff:ff:ff:ff:ff)'); return }
        if (!macMaskOk(this.l2.dstMac)) { message.warnBox('Invalid Destination MAC Mask. Ex:(ff:ff:ff:ff:ff:ff)'); return }
      } else if (this.l3.proto === '1001') {
        const v = Number(this.l3.protocolId)
        if (!/^\d+$/.test(this.l3.protocolId) || v > 255) { message.warnBox('Protocol ID must be within 0 ~ 255.'); return }
      }
      const payload = { type: this.type, profileId: this.profileId }
      Object.assign(payload, this.type === 'L2' ? this.l2 : this.l3)
      cgiSet('sec_aclProfileAdd', payload, { successMsg: false }).then(() => {
        this.$router.back()
        message.successMsg(`Create new acl profile ${this.profileId || 1} Successfully.`)
      })
    }
  }
}
</script>
