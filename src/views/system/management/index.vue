<template>
  <div class="main_body">
    <div id="basetitle">Management</div>
    <common-table
      header-title="System Settings"
      :first-column="['System Description','System Object ID', 'System Name','System Location','System Contact']"
    >
      <template #0> {{ sysDesc }} </template>
      <template #1>{{ sysOID }}</template>
      <template #2>
        <base-input v-model="sysName" max-len="50" @check="check('sysName')" />
      </template>
      <template #3>
        <base-input v-model="sysLocation" max-len="30" @check="check('sysLocation')" />
      </template>
      <template #4>
        <base-input v-model="sysContact" max-len="30" @check="check('sysContact')" />
      </template>
    </common-table>

    <div class="margin1015">
      <input ref="apply" type="button" :class="btnClass" value="Apply" @click="apply">
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import baseInput from '@/components/CustomInput/base-input.vue'

export default {
  components: {
    commonTable,
    baseInput
  },
  data() {
    return {
      sysDesc: '',
      sysOID: '',
      sysName: '',
      sysLocation: '',
      sysContact: '',
      btnClass: 'btnOutTable'
    }
  },
  created() {
    this.$http.get('url_get_statusSysinfo').then(resp => {
      this.sysDesc = resp.data.title
      this.sysOID = resp.data.sysObjID
      this.sysName = resp.data.hostname
      this.sysLocation = resp.data.location
      this.sysContact = resp.data.contact
    },
    err => {
      console.log('system-management-get err:', err)
    })
  },
  methods: {
    apply() {
      this.btnClass = 'btnOutTable btnDisabled'
      const data = {
        hostname: this.sysName,
        location: this.sysLocation,
        contact: this.sysContact
      }
      this.$http.post('url_set_statusSysinfo', data).then(resp => {
        this.$message.success({
          showClose: true,
          message: 'Success.'
        })

        this.btnClass = 'btnOutTable'
      },
      err => {
        console.log('system-management-post error: ', err)
      })
    },
    check(v) {
      switch (v) {
        case 'sysName':
          this.sysName = this.sysName.replace(/[^\a-\z\A-\Z0-9\.\,\?\<\>\。\-\=\;\@\!\+\$]/g, '')
          break
        case 'sysLocation':
          this.sysLocation = this.sysLocation.replace(/[^\a-\z\A-\Z0-9\.\,\?\<\>\。\-\=\;\@\!\+\$]/g, '')
          break
        case 'sysContact':
          this.sysContact = this.sysContact.replace(/[^\a-\z\A-\Z0-9\.\,\?\<\>\。\-\=\;\@\!\+\$]/g, '')
          break
        default:
          break
      }
    }
  }
}
</script>

