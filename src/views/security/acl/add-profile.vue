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
              * keep blank means auto-assign
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

      <!-- L3 -->
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
          <tr>
            <td>Source IPv4 Mask</td>
            <td>
              <select v-model="l3.srcIpv4Mask">
                <option v-for="o in ipv4Masks" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Destination IPv4 Mask</td>
            <td>
              <select v-model="l3.dstIpv4Mask">
                <option v-for="o in ipv4Masks" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Source IPv6 Mask</td>
            <td>
              <select v-model="l3.srcIpv6Mask">
                <option v-for="o in ipv6Masks" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Destination IPv6 Mask</td>
            <td>
              <select v-model="l3.dstIpv6Mask">
                <option v-for="o in ipv6Masks" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </td>
          </tr>
          <tr v-for="c in l3Checks" :key="c.key">
            <td>{{ c.label }}</td>
            <td><input v-model="l3[c.key]" type="checkbox"></td>
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
import baseInput from '@/components/CustomInput/base-input.vue'

const dotted = (prefix) => {
  const bits = '1'.repeat(prefix).padEnd(32, '0')
  return [0, 8, 16, 24].map(i => parseInt(bits.slice(i, i + 8), 2)).join('.')
}
const IPV4_MASKS = [{ value: '0', label: 'Ignore' }].concat(
  Array.from({ length: 32 }, (_, i) => ({ value: dotted(i + 1), label: `${i + 1} / ${dotted(i + 1)}` }))
)
const IPV6_MASKS = [{ value: '0', label: 'Ignore' }].concat(
  Array.from({ length: 128 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} / ${i + 1}` }))
)
const L3_CHECKS = [
  { key: 'ipv4Dscp', label: 'IPv4 DSCP Check' },
  { key: 'ipv4Tos', label: 'IPv4 ToS Check' },
  { key: 'ipv6Tc', label: 'IPv6 Traffic Class Check' },
  { key: 'ipv4Proto', label: 'IPv4 Protocol' },
  { key: 'ipv6Proto', label: 'IPv6 Protocol' },
  { key: 'tcpFlag', label: 'TCP Flag Check' },
  { key: 'icmpType', label: 'ICMP Type Check' },
  { key: 'icmpCode', label: 'ICMP Code Check' },
  { key: 'igmpType', label: 'IGMP Type Check' },
  { key: 'srcPort', label: 'Source Port Check' },
  { key: 'dstPort', label: 'Destination Port Check' }
]

export default {
  components: { baseInput },
  data() {
    return {
      ipv4Masks: IPV4_MASKS,
      ipv6Masks: IPV6_MASKS,
      l3Checks: L3_CHECKS,
      profileId: '',
      l2: { srcMac: '', dstMac: '', p8021: false, vlanId: false, etherType: false },
      l3: L3_CHECKS.reduce((o, c) => { o[c.key] = false; return o },
        { profileType: '1', srcIpv4Mask: '0', dstIpv4Mask: '0', srcIpv6Mask: '0', dstIpv6Mask: '0' })
    }
  },
  computed: {
    type() {
      return this.$route.query.type === 'L3' ? 'L3' : 'L2'
    }
  },
  methods: {
    onlyNum() {
      this.profileId = this.profileId.replace(/[^0-9]/g, '')
    },
    onApply() {
      const payload = { type: this.type, profileId: this.profileId }
      Object.assign(payload, this.type === 'L2' ? this.l2 : this.l3)
      cgiSet('sec_aclProfileAdd', payload).then(() => this.$router.back())
    }
  }
}
</script>
