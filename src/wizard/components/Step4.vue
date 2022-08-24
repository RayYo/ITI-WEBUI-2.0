<template>
  <div class="main_body">
    <div id="basetitle">Switch Setup Wizard</div>
    <div class="table_title">System Information</div>
    <table border="" cellspacing="0" class="from_table">
      <tbody>
        <tr style="border-bottom: 1px solid rgb(255, 255, 255);">
          <td colspan="2">Write down the below information and store it in a safe place. The below information are the current settings that will be applied to the switch. Click&nbsp;<span><b>Apply</b></span>&nbsp;below to finalize the settings.
          </td></tr>
      </tbody>
    </table>
    <common-table
      :first-column="['System Time','Username', 'Password', 'Switch IP Address', 'Subnet Mask', 'Gateway IP Address', 'DNS']"
    >
      <template #0> {{ sysTime }} </template>
      <template #1> {{ userAccount.username }} </template>
      <template #2>
        {{ password }} <span class="show-pwd" style="cursor: pointer;margin-left: 9px;" @click="openClose()">
          <svg-icon style="width: 14px; height: 14px;" :icon-class="isOpen ? 'eye-open' : 'eye'" /></span>
      </template>
      <template #3> {{ ipInfo.ip }} </template>
      <template #4> {{ ipInfo.mask }} </template>
      <template #5> {{ ipInfo.gw }} </template>
      <template #6> {{ ipInfo.dns }} </template>
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
import { parseTime } from '@/utils'

export default
{
  components: {
    commonTable
  },
  data() {
    return {
      sysTime: '',
      svgXlink: '#icon-eye',
      isOpen: false,
      password: '******'
    }
  },
  computed: {
    ...mapGetters([
      'currentTime',
      'userAccount',
      'ipInfo'
    ])
  },
  created() {
    this.sysTime = parseTime(this.currentTime, '{d} {m} {y} {h}:{i}:{s}')
  },
  methods:
  {
    openClose() {
      if (this.isOpen) {
        this.password = '******'
        this.svgXlink = '#svg-icon'
        this.isOpen = false
      } else {
        this.password = this.userAccount.password
        this.svgXlink = '#icon-eye-open'
        this.isOpen = true
      }
    },
    previous() {
      this.$router.push('/wizard/step3')
    },
    next() {
      const data = {
        time: this.currentTime,
        username: this.userAccount.username,
        passwor: this.userAccount.passwor,
        ip: this.ipInfo.ip,
        mask: this.ipInfo.mask,
        gw: this.ipInfo.gw,
        dns: this.ipInfo.dns
      }
      this.$http.post('url_set_wizard', data).then(resp => {
        this.$router.push('/dashboard')
      },
      err => {
        console.log('wizard post error: ', err)
      })
    },

    cancel() {
      this.$router.push('/dashboard')
    }
  }
}
</script>
