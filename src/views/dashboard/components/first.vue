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
    <div v-if="currPoeData.poeData.length" id="pannel2" style="margin-bottom: 25px; overflow: visible; min-height: 370px; position: relative;">
      <div style="height: 250px; position: absolute; top: 50%; margin-top: -150px;">
        <p class="cpuMemory2">PoE Utilization</p>
        <div class="cpuTable">
          <cpuMemTable
            header-title="PoE"
            :extra-class="{memory: true}"
            :table-data="poeTableInfo"
          />
        </div>
      </div>
      <div style="position: absolute; padding-top: 10px; padding-left: 400px; height: 360px; width: 100%; top: 50%; margin-top: -190px;">
        <div class="lineChart_box" style="height: 360px; width: 99%;">
          <poe-chart
            id="poechart"
            :poe-usage-data="currPoeData"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
    <div id="pannel2" style="min-height: 440px; overflow: visible;">
      <div>
        <p class="cpuMemory2">CPU &amp; Memory Utilization</p>
        <div class="cpuTable2">
          <span>Table: &nbsp;</span>
          <select style="width: 299px">
            <option value="0">Utilization 5 Sec Usage</option>
            <option value="1">Utilization 1 Min Usage</option>
            <option value="2">Utilization 5 Min Usage</option>
            <option value="3">Utilization 5 Min Max Usage</option></select>
        </div>
        <div class="cpuTable2">
          <cpuMemTable
            header-title="CPU"
            margin-b="20px"
            :extra-class="{cpu: true}"
            :table-data="cpuTableInfo"
          />
          <cpuMemTable
            header-title="Memory"
            :extra-class="{memory: true}"
            :table-data="memTableInfo"
          />
        </div>
      </div>

      <div style="padding-top: 65px;width: 100%;">
        <div class="lineChart_box" style="height: 360px; width: 99.5%;">
          <cpuMemChart
            id="cpuMem"
            :cpu-chart-data="cpuChartData"
            :mem-chart-data="memChartData"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fromTable from '@/components/CustomTable/from-table.vue'
import cpuMemTable from '@/components/CustomTable/cpu-mem-table.vue'
import poeChart from '@/components/Charts/PoE.vue'
import cpuMemChart from '@/components/Charts/CpuMem.vue'

export default {
  components: {
    fromTable,
    poeChart,
    cpuMemChart,
    cpuMemTable
  },
  data() {
    return {
      swInfoTableData: ['', '', ''],
      hwInfoTableData: ['', ''],
      adminInfoTableData: ['', '', ''],
      sysInfoTableData: ['', '', '', '', ''],
      ipv6InfoTableData: ['', '', ''],
      netFeaturesTableData: ['', ''],
      loading: {},
      currPoeData: {
        poeData: '',
        xData: ''
      },
      poeTableInfo: [''],
      cpuTableInfo: [{ Used: '0 %' }, { Idel: '100 %' }],
      memTableInfo: [{ Total: '255572 KB' }, { Free: '255572 KB' }, { Used: '0 KB' }],
      cpuChartData: [],
      memChartData: [],
      utilizationInterval: 5000, // 5s
      timer: null,
      cpuMemChartTimer: null
    }
  },
  created() {
    this.cpuMemChartDataInit()
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
        this.updateCpuMemData(resp)

        this.timer = setInterval(this.polling, 5000)
        this.cpuMemChartTimer = setInterval(this.updateCpuMemChartData, this.utilizationInterval)
      },
      err => {
        console.log('dashboard get error: ', err)
      })
    }, 2000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    saveLoading() {
      this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    updateCpuMemData(resp) {
      // poe data
      if (resp.data.poeUsage) {
        this.currPoeData = {
          poeData: resp.data.poeUsage,
          xData: Array.from(new Array(resp.data.poeUsage.length + 1).keys()).slice(1)
        }
        this.poeTableInfo = [{
          Total: resp.data.norminalPower + ' W MAX'
        }, {
          Used: resp.data.consumedPower + ' W'
        }, {
          Available: resp.data.availPower + ' W'
        }]
      }
      // cpu & mem data
      this.cpuTableInfo = [{
        Used: resp.data.cpuUseage + ' %'
      }, {
        Idle: (100 - resp.data.cpuUseage) + ' %'
      }]

      this.memTableInfo = [{
        Total: resp.data.memTotal + ' KB'
      }, {
        Free: (resp.data.memTotal - resp.data.memUsed) + ' KB'
      }, {
        Used: resp.data.memUsed + ' KB'
      }]
    },
    updateCpuMemChartData() {
      this.$http.get('url_get_statusSysinfo').then(resp => {
      const now = new Date()

      if (this.cpuChartData.length >= 70) {
        this.memChartData.shift()
        this.cpuChartData.shift()
      }

      this.memChartData.push({
        name: now.toString(),
        value: [now, Math.round(Math.random() * (99)) + 1]
      })

      this.cpuChartData.push({
        name: now.toString(),
        value: [now, Math.round(Math.random() * (99)) + 1]
      })
      },
      err => {
        console.log('dashboard get error: ', err)
      })
    },
    cpuMemChartDataInit() {
      const now = new Date()

      this.cpuChartData.push({
        name: (now - 1000 * 60).toString(),
        value: [now - 1000 * 60, 0]
      })
      this.memChartData.push({
        name: (now - 1000 * 60).toString(),
        value: [now - 1000 * 60, 0]
      })

      this.cpuChartData.push({
        name: (now - 500 * 60).toString(),
        value: [now - 500 * 60, 0]
      })
      this.memChartData.push({
        name: (now - 500 * 60).toString(),
        value: [now - 500 * 60, 0]
      })

      this.cpuChartData.push({
        name: now.toString(),
        value: [now, 0]
      })
      this.memChartData.push({
        name: now.toString(),
        value: [now, 0]
      })
    },
    polling() {
      this.$http.get('url_get_statusSysinfo').then(resp => {
        this.updateCpuMemData(resp)
      },
      err => {
        console.log('dashboard get error: ', err)
      })
    },
    randomData() {
      const t = new Date()
      const timeStr = this.formatDate(t)
      const value = Math.round(Math.random() * (99)) + 1
      return [timeStr, value]
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
