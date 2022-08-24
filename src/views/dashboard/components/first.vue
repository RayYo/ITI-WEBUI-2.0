<template>
  <div>
    <div style="margin-bottom: 25px; overflow: auto;">
      <div style="display: flex; margin-bottom: 20px;">
        <from-table
          header-title="Switch Information"
          :extra-style="{flex: '14 1 0%', background: 'white'}"
          :extra-class="{das_form: true}"
          :first-column="['System Uptime','Runtime Image','Boot Loader']"
          :table-data="swInfoTableData"
        />
        <div style="flex: 1 1 0%;" />
        <from-table
          header-title="Hardware Information"
          :extra-class="{das_form: true}"
          :extra-style="{flex: '14 1 0%', background: 'white'}"
          :first-column="['DRAM Size','Flash Size']"
          :table-data="hwInfoTableData"
        />
        <div style="flex: 1 1 0%;" />
        <from-table
          header-title="Administration Information"
          :extra-class="{das_form: true}"
          :extra-style="{flex: '14 1 0%', background: 'white'}"
          :first-column="['System Name','System Location','System Contact']"
          :table-data="adminInfoTableData"
        />
      </div>
      <div style="display: flex;">
        <from-table
          header-title="System Information"
          :extra-class="{das_form: true}"
          :extra-style="{flex: '14 1 0%', background: 'white'}"
          :first-column="['Serial Number','MAC Address','IP Address','Subnet Mask','Default Gateway']"
          :table-data="sysInfoTableData"
        />
        <div style="flex: 1 1 0%;" />
        <from-table
          header-title="IPv6 Information"
          :extra-class="{das_form: true}"
          :extra-style="{flex: '14 1 0%', background: 'white'}"
          :first-column="['IPv6 Unicast Address / Prefix Length','IPv6 Default Gateway',
                          'Link Local Address / Prefix length']"
          :table-data="ipv6InfoTableData"
        />
        <div style="flex: 1 1 0%;" />
        <from-table
          header-title="Automatic Network Features"
          :extra-class="{das_form: true}"
          :extra-style="{flex: '14 1 0%', background: 'white'}"
          :first-column="['IPv4 DHCP Client Mode','IPv6 DHCP Client Mode']"
          :table-data="netFeaturesTableData"
        />
      </div>
    </div>
  </div>
</template>

<script>
import fromTable from '@/components/CustomTable/from-table.vue'

export default {
  components: {
    fromTable
  },
  data() {
    return {
      swInfoTableData: ['', '', ''],
      hwInfoTableData: ['', ''],
      adminInfoTableData: ['', '', ''],
      sysInfoTableData: ['', '', '', '', ''],
      ipv6InfoTableData: ['', '', ''],
      netFeaturesTableData: ['', ''],
      loading: {}
    }
  },
  created() {
    this.saveLoading()
    // Simulated delay request
    setTimeout(() => {
      this.$http.get('url_get_statusSysinfo').then(resp => {
        this.swInfoTableData.length = 0
        this.hwInfoTableData.length = 0
        this.adminInfoTableData.length = 0
        this.sysInfoTableData.length = 0
        this.ipv6InfoTableData.length = 0
        this.netFeaturesTableData.length = 0

        this.swInfoTableData.push(resp.data.sysUpTime, resp.data.fwVer, resp.data.loaderVer)
        this.hwInfoTableData.push(resp.data.ramSize, resp.data.flashize)
        this.adminInfoTableData.push(resp.data.hostname, resp.data.location, resp.data.contact)
        this.sysInfoTableData.push(resp.data.snNo, resp.data.sysMac, resp.data.currIpv4, resp.data.currIpv4Mask, resp.data.currIpv4Gw)
        this.ipv6InfoTableData.push(resp.data.currIpv6, resp.data.currIpv6Gw, resp.data.currIpv6LinkLocalAddr)
        this.netFeaturesTableData.push(resp.data.ipv4DHCP, resp.data.ipv6DHCP)
        this.loading.close()
      },
      err => {
        console.log('dashboard get error: ', err)
      })
    }, 2000)
  },
  methods: {
    saveLoading() {
      this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
