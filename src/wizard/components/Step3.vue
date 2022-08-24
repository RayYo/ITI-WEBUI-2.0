<template>
  <div class="main_body">
    <div id="basetitle">Switch Setup Wizard</div>
    <common-table
      header-title="Step 3: Input your IP settings in the fields below"
      :first-column="['IP Address','Subnet Mask', 'Gateway IP Address', 'DNS']"
    >
      <template #0>
        <div style="display: inline-block; width: 50%;">
          <input ref="ip" v-model="ipAddr" onkeyup="value=value.replace(/[^\d^\.]+/g,'')" type="text" maxlength="15" class="baseInput" @change="checkValue('ip')">
        </div>
      </template>
      <template #1>
        <div style="display: inline-block; width: 50%;">
          <input ref="mask" v-model="ipMask" onkeyup="value=value.replace(/[^\d^\.]+/g,'')" type="text" maxlength="15" class="baseInput" @change="checkValue('mask')">
        </div>
      </template>
      <template #2>
        <div style="display: inline-block; width: 50%;">
          <input ref="gw" v-model="ipGw" onkeyup="value=value.replace(/[^\d^\.]+/g,'')" type="text" maxlength="15" class="baseInput" @change="checkValue('gw')">
        </div>
      </template>
      <template #3>
        <div style="display: inline-block; width: 50%;">
          <input ref="dns" v-model="dns" onkeyup="value=value.replace(/[^\d^\.]+/g,'')" type="text" maxlength="15" class="baseInput" @change="checkValue('dns')">
        </div>
      </template>
    </common-table>

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Previous" @click="previous">
      <input type="button" class="btnOutTable" value="Next" @click="next">
      <input type="button" class="btnOutTable" value="Cancel" @click="cancel">
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import { mapGetters } from 'vuex'

export default
{
  components: {
    commonTable
  },
  data() {
    return {
      ipAddr: '',
      ipMask: '',
      ipGw: '',
      dns: ''
    }
  },
  computed: {
    ...mapGetters([
      'ipInfo'
    ])
  },
  created() {
    this.ipAddr = this.ipInfo.ip
    this.ipMask = this.ipInfo.mask
    this.ipGw = this.ipInfo.gw
    this.dns = this.ipInfo.dns
  },
  methods:
  {
    checkValue(type) {
      switch (type) {
        case 'ip':
          if (!/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(this.ipAddr) ||
              this.ipAddr === '') {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'Invalid IPv4 address.'
            }).then(() => {
              this.ipAddr = ''
              this.$refs.ip.focus()
            })
            return false
          }
          break
        case 'mask':
          if (!/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(this.ipMask) ||
              this.ipMask === '') {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'Invalid subnet mask.'
            }).then(() => {
              this.ipMask = ''
              this.$refs.mask.focus()
            })
            return false
          }
          break
        case 'gw':
          if (!/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(this.ipGw) ||
              this.ipGw === '') {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'Invalid gateway address.'
            }).then(() => {
              this.ipGw = ''
              this.$refs.gw.focus()
            })
            return false
          }
          break
        case 'dns':
          if (!/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(this.dns) ||
              this.dns === '') {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'Invalid DNS address.'
            }).then(() => {
              this.dns = ''
              this.$refs.dns.focus()
            })
            return false
          }
          break
      }
      return true
    },
    previous() {
      this.$router.push('/wizard/step2')
    },
    next() {
      if (this.checkValue('ip') &&
          this.checkValue('mask') &&
          this.checkValue('gw') &&
          this.checkValue('dns')) {
        const ipData = {
          ip: this.ipAddr,
          mask: this.ipMask,
          gw: this.ipGw,
          dns: this.dns
        }
        this.$store.dispatch('wizard/ipConfig', ipData)
        this.$router.push('/wizard/step4')
      }
    },

    cancel() {
      this.$router.push('/dashboard')
    }
  }
}
</script>
