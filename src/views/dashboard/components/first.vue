<template>
  <div>
    <div style="margin-bottom: 25px; overflow: auto;">
      <div class="das-flex-row" style="display: flex; margin-bottom: 20px;">
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
      <div class="das-flex-row" style="display: flex;">
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
          <select v-model="selected" style="width: 299px" @change="getSelectedInterval">
            <option v-for="(item, idx) in selectList" :key="idx" :value="item.id">{{ item.name }}</option>
          </select>
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
import { cgiGet } from '@/api/cgi'
import { mapGetters } from 'vuex'

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
      selectList: [
        { id: 5, name: 'Utilization 5 Sec Usage' },
        { id: 60, name: 'Utilization 1 Min Usage' },
        { id: 300, name: 'Utilization 5 Min Usage' },
        { id: 301, name: 'Utilization 5 Min Max Usage' }
      ],
      selected: '',
      timer: null,
      cpuMemChartTimer: null
    }
  },
  computed: {
    ...mapGetters([
      'modelInfo'
    ])
  },
  created() {
    this.cpuMemChartDataInit()
    this.saveLoading()
    cgiGet('sys_sysinfo').then(d => {
      this.swInfoTableData = [this.formatUptime(d.uptimeSec), d.runtimeImage, d.bootLoader]
      this.hwInfoTableData = [d.dramMB + ' MB', d.flashMB + ' MB']
      this.adminInfoTableData = [d.hostname, d.location, d.contact]
      this.sysInfoTableData = [d.serialNum, d.macAddr, d.ipv4.ip, d.ipv4.mask, d.ipv4.gateway]
      this.ipv6InfoTableData = [d.ipv6.unicast, d.ipv6.gateway, d.ipv6.linkLocal]
      this.netFeaturesTableData = [
        d.ipv4DhcpEnabled ? 'Enabled' : 'Disabled',
        d.ipv6DhcpEnabled ? 'Enabled' : 'Disabled'
      ]
      this.loading.close()

      // PoE 面板(仅带 PoE 机型):30s 轮询 panel_info
      if (this.modelInfo('poeNum') > 0) {
        this.updatePoEData()
        this.timer = setInterval(this.updatePoEData, 30000)
      }

      this.selected = this.selectList[0].id
      this.updateCpuMemData()
      this.cpuMemChartTimer = setInterval(this.updateCpuMemData, this.utilizationInterval)
    }, err => {
      this.loading.close()
      console.log('dashboard get error: ', err)
    })
  },
  beforeDestroy() {
    clearInterval(this.timer)
    clearInterval(this.cpuMemChartTimer)
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
    getSelectedInterval() {
      if (this.utilizationInterval !== (this.selected * 1000)) {
        // handle Max Usage option
        if (this.utilizationInterval === 300 * 1000 && this.selected === 301) {
          this.utilizationInterval = 300 * 1000
        } else {
          this.utilizationInterval = this.selected * 1000
        }
        clearInterval(this.cpuMemChartTimer)
        this.cpuMemChartTimer = setInterval(this.updateCpuMemData, this.utilizationInterval)
      }
    },
    formatUptime(sec) {
      const s = Number(sec) || 0
      const d = Math.floor(s / 86400)
      const h = Math.floor((s % 86400) / 3600)
      const m = Math.floor((s % 3600) / 60)
      return `${d} days, ${h} hrs, ${m} mins, ${s % 60} secs`
    },
    updatePoEData() {
      // PoE 每口功耗(W)来自 panel_info,总预算来自 sys_devinfo
      cgiGet('panel_info').then(d => {
        const poePorts = (d.ports || []).filter(p => p.poe)
        if (!poePorts.length) return
        const usage = poePorts.map(p => (p.poe.powerMw || 0) / 1000)
        const consumed = usage.reduce((a, b) => a + b, 0)
        const budget = this.modelInfo('poeBudget')
        this.currPoeData = {
          poeData: usage,
          xData: poePorts.map(p => p.port)
        }
        this.poeTableInfo = [{
          Total: budget + ' W MAX'
        }, {
          Used: consumed.toFixed(1).replace('.0', '') + ' W'
        }, {
          Available: (budget - consumed).toFixed(1).replace('.0', '') + ' W'
        }]
      }, err => {
        console.log('panel_info get error: ', err)
      })
    },
    updateCpuMemData() {
      cgiGet('sys_cpumem').then(d => {
        const memUsed = d.memTotalKB - d.memFreeKB

        // cpu & mem data
        this.cpuTableInfo = [{
          Used: d.cpu + ' %'
        }, {
          Idle: (100 - d.cpu) + ' %'
        }]

        this.memTableInfo = [{
          Total: d.memTotalKB + ' KB'
        }, {
          Free: d.memFreeKB + ' KB'
        }, {
          Used: memUsed + ' KB'
        }]

        const now = new Date()
        const memUsage = parseInt(memUsed * 100 / d.memTotalKB)

        if (this.cpuChartData.length >= 70) {
          this.memChartData.shift()
          this.cpuChartData.shift()
        }

        this.memChartData.push({
          name: now.toString(),
          value: [now, memUsage]
        })

        this.cpuChartData.push({
          name: now.toString(),
          value: [now, d.cpu]
        })
      },
      err => {
        console.log('sys_cpumem get error: ', err)
      })
    },
    cpuMemChartDataInit() {
      const now = new Date()

      this.cpuChartData.push({
        name: (now - 2000 * 60).toString(),
        value: [now - 2000 * 60, 0]
      })
      this.memChartData.push({
        name: (now - 2000 * 60).toString(),
        value: [now - 2000 * 60, 0]
      })

      this.cpuChartData.push({
        name: (now - 1500 * 60).toString(),
        value: [now - 1500 * 60, 0]
      })
      this.memChartData.push({
        name: (now - 1500 * 60).toString(),
        value: [now - 1500 * 60, 0]
      })

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
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
