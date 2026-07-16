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
              <base-input v-model="accessId" max-len="5" @check="onlyNum('accessId')" />
              <span class="tipAfterInputBox">* keep blank means auto-assign</span>
            </td>
          </tr>
          <tr>
            <td>Type</td>
            <td>{{ ruleType === 'L3' ? 'Layer 3' : 'Layer 2' }}</td>
          </tr>
          <tr>
            <td>Source MAC</td>
            <td>
              <base-input v-model="srcMac" max-len="17" placeholder="00-00-00-00-00-10" />
              <span class="tipAfterInputBox">ex:(00-00-00-00-00-10)</span>
            </td>
          </tr>
          <tr>
            <td>Destination MAC</td>
            <td>
              <base-input v-model="dstMac" max-len="17" placeholder="00-00-00-00-FF-FF" />
              <span class="tipAfterInputBox">ex:(00-00-00-00-FF-FF)</span>
            </td>
          </tr>
          <tr>
            <td>VLAN</td>
            <td>
              <select v-model="vlanId">
                <option v-for="v in vlans" :key="v" :value="String(v)">{{ v }}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>802.1p</td>
            <td>
              <base-input v-model="p8021" max-len="1" @check="onlyNum('p8021')" />
              <span class="tipAfterInputBox">ex:( 0 ~ 7 )</span>
            </td>
          </tr>
          <tr>
            <td>Ether Type</td>
            <td>
              <base-input v-model="etherType" max-len="6" placeholder="0x05DD" />
              <span class="tipAfterInputBox">ex:(0x05DD-0xFFFF)</span>
            </td>
          </tr>
          <tr>
            <td>Ports</td>
            <td>
              <base-input v-model="ports" max-len="1024" />
              <span class="tipAfterInputBox">Ex:(1,2)</span>
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
              <div style="width: 50%">
                <input v-model="actionVal" type="text" maxlength="1024" autocomplete="off" class="baseInput" :class="{ disabledStyle: !actionNeedsVal }" :disabled="!actionNeedsVal">
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

export default {
  components: { baseInput },
  data() {
    return {
      detailRows: [],
      vlans: [1],
      accessId: '',
      srcMac: '',
      dstMac: '',
      vlanId: '1',
      p8021: '',
      etherType: '',
      ports: '',
      action: '1',
      actionVal: ''
    }
  },
  computed: {
    ruleType() { return this.$route.query.type === 'L3' ? 'L3' : 'L2' },
    profileId() { return this.$route.query.id },
    actionNeedsVal() { return this.action === '4' || this.action === '6' },
    actionHint() {
      if (this.action === '4') return 'ex:(16 ~ 1000000), will auto-assign to a multiple of 16 value'
      if (this.action === '6') return 'ex: DSCP (0~63)'
      return ''
    }
  },
  watch: {
    action() { if (!this.actionNeedsVal) this.actionVal = '' }
  },
  created() {
    const { type, id, accessId } = this.$route.query
    loadAclProfile(type, id).then(({ profile, vlans }) => {
      this.vlans = vlans
      this.vlanId = String(vlans[0] != null ? vlans[0] : 1)
      if (!profile) return
      this.detailRows = aclProfileDetailRows(profile)
      // 点 Access ID 链接进来 = 编辑该 rule,表单预填
      if (accessId != null) {
        const rule = (profile.rules || []).find(r => String(r.accessId) === String(accessId))
        if (rule) {
          this.accessId = String(rule.accessId)
          this.srcMac = rule.srcMac || ''
          this.dstMac = rule.dstMac || ''
          this.vlanId = String(rule.vlanId != null ? rule.vlanId : this.vlanId)
          this.p8021 = rule.p8021 != null ? String(rule.p8021) : ''
          this.etherType = rule.etherType || ''
          this.ports = rule.ports || ''
          this.action = String(rule.action != null ? rule.action : 1)
          this.actionVal = rule.actionVal || ''
        }
      }
    })
  },
  methods: {
    onlyNum(key) {
      this[key] = this[key].replace(/[^0-9]/g, '')
    },
    hexVal(s) {
      if (/^0x[0-9a-f]{1,4}$/i.test(s)) return parseInt(s, 16)
      if (/^[0-9a-f]{1,4}$/i.test(s)) return parseInt(s, 16)
      return NaN
    },
    onApply() {
      // 留空 = Don't Care;有值才校验
      const macOk = v => v === '' || /^([0-9a-f]{2}-){5}[0-9a-f]{2}$/i.test(v)
      if (!macOk(this.srcMac)) { message.warnBox('Invalid Source MAC. ex:(00-00-00-00-00-10)'); return }
      if (!macOk(this.dstMac)) { message.warnBox('Invalid Destination MAC. ex:(00-00-00-00-FF-FF)'); return }
      if (this.p8021 !== '' && Number(this.p8021) > 7) { message.warnBox('802.1p must be within 0 ~ 7.'); return }
      if (this.etherType !== '') {
        const v = this.hexVal(this.etherType)
        if (isNaN(v) || v < 0x05DD || v > 0xFFFF) { message.warnBox('Ether Type must be within 0x05DD ~ 0xFFFF.'); return }
      }
      if (this.ports !== '' && !/^\d+(-\d+)?(,\d+(-\d+)?)*$/.test(this.ports)) { message.warnBox('Invalid Ports. Ex:(1,2)'); return }
      if (this.action === '4') {
        const v = Number(this.actionVal)
        if (!/^\d+$/.test(this.actionVal) || v < 16 || v > 1000000) { message.warnBox('Rate Limit must be within 16 ~ 1000000.'); return }
      }
      if (this.action === '6') {
        const v = Number(this.actionVal)
        if (!/^\d+$/.test(this.actionVal) || v > 63) { message.warnBox('DSCP must be within 0 ~ 63.'); return }
      }
      cgiSet('sec_aclRuleEdit', {
        profileId: this.profileId, accessId: this.accessId,
        srcMac: this.srcMac, dstMac: this.dstMac, vlanId: this.vlanId,
        p8021: this.p8021, etherType: this.etherType, ports: this.ports,
        action: this.action, actionVal: this.actionVal
      }, { successMsg: false }).then(() => {
        this.$router.back()
        const idPart = this.accessId ? `${this.accessId} ` : ''
        message.warnBox(`Successfully create rule with access id ${idPart}on profile ${this.profileId}`)
      })
    }
  }
}
</script>
