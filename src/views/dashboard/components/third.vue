<template>
  <div>
    <switch-panel
      :copper-group-num="copperGroupNum"
      :port-link-change="portLinkData"
    />
    <div class="rahama">
      <el-radio-group v-model="radio" @change="radioChange">
        <el-radio v-for="(item, idx) in radioArr" :key="idx" :label="idx+1">{{ item }}</el-radio>
      </el-radio-group>
    </div>

    <div class="chart" style="height: 489px; min-height: 549px; overflow: auto;">
      <div class="dasChart">
        <div class="chartBorder" />
        <select v-model="selected" class="chartSelect" @change="portSelectChange">
          <option v-for="(item, idx) in portList" :key="idx" :value="item.v">{{ item.n }}</option>
        </select>
        <div class="lineChart_box" style="height: 450px; width: 100%;">
          <statisticsChart
            id="statistics"
            :statistics-data="statsData"
            width="100%"
            height="100%"
          />
        </div>
        <div class="note" v-html="noteDescription" />
      </div>
    </div>
  </div>
</template>
<script>
import switchPanel from '@/components/Panel'
import { mapGetters } from 'vuex'
import statisticsChart from '@/components/Charts/Statistics.vue'
import { cgiGet } from '@/api/cgi'

export default {
  components: {
    switchPanel,
    statisticsChart
  },
  data() {
    return {
      copperGroupNum: 0,
      portLinkData: [],
      radio: 1,
      radioArr: [],
      statsData: {
        totalRx: [],
        totalTx: [],
        ucRx: [],
        mcRx: [],
        bcRx: [],
        ucTx: [],
        mcTx: [],
        bcTx: []
      },
      selected: 1, // default port1
      portList: [],
      noteDescription: '<p>Note:</p><span>UC(Rx):Unicast received&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MC(Rx):Multicast received&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;BC(Rx):Broadcast received<br>UC(Tx):Unicast transmitted&nbsp;&nbsp;MC(Tx):Multicast transmitted&nbsp;&nbsp;BC(Tx):Broadcast transmitted</span>',
      timer: null,
      statsTimer: null
    }
  },
  computed: {
    ...mapGetters([
      'modelInfo'
    ])
  },
  created() {
    this.copperGroupNum = this.modelInfo('copperPortNum') / 8
    this.radioArr = ['Status', 'Duplex', 'Speed']
    if (this.modelInfo('poeNum') !== 0) {
      this.radioArr.push('PoE')
    }
    this.statsDataInit()
    this.updatePanel()
    this.portListInit()

    this.timer = setInterval(this.updatePanel, 10000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.statsTimer) {
      clearInterval(this.statsTimer)
    }
  },
  methods: {
    /** devinfo 端口类型 → 面板 ref(fiber 走 portf<n>) */
    portRefOf(port) {
      const meta = this.modelInfo('ports').find(p => p.port === port)
      return (meta && meta.type === 'fiber') ? `portf${port}` : `port${port}`
    },
    updatePanel() {
      const type = this.radio
      cgiGet('panel_info', {}, { loading: false }).then(d => {
        const links = []
        for (const p of d.ports || []) {
          let pColor = 'black'
          switch (type) {
            case 1: // Status
              pColor = !p.link ? 'black' : (p.speed >= 1000 ? 'green' : 'orange')
              break
            case 2: // Duplex
              pColor = !p.link ? 'black' : (p.duplex === 'full' ? 'green' : 'orange')
              break
            case 3: // Speed(10G 蓝色)
              if (!p.link) pColor = 'black'
              else if (p.speed >= 10000) pColor = '#0077c5'
              else if (p.speed >= 1000) pColor = 'green'
              else pColor = 'orange'
              break
            case 4: // PoE
              pColor = (p.poe && p.poe.powering) ? 'green' : 'black'
              break
          }
          links.push({ portRef: this.portRefOf(p.port), linkColor: pColor })
        }
        this.portLinkData = links
      }, err => {
        console.log('panelInfo get error: ', err)
      })
    },
    portListInit() {
      this.portList = this.modelInfo('ports').map(p => ({
        v: p.port,
        n: 'Port' + p.port
      }))
    },
    portSelectChange() {
      // clear db
      for (const k in this.statsData) {
        if (Object.hasOwnProperty.call(this.statsData, k)) {
          this.statsData[k] = []
        }
      }
      // init db
      this.statsDataInit()
    },
    statsDataInit() {
      if (this.statsTimer) {
        clearInterval(this.statsTimer)
      }
      const now = new Date()
      for (const k in this.statsData) {
        if (Object.hasOwnProperty.call(this.statsData, k)) {
          for (let i = 0; i < 50; i++) {
            const o = {
              value: [(new Date(now - (49 - i) * 3000)), 0]
            }
            this.statsData[k].push(o)
          }
        }
      }
      this.statsTimer = setInterval(this.updateStatsData, 3000)
    },
    updateStatsData() {
      // 单端口实时包计数(3s 轮询,切端口后重置曲线)
      cgiGet('port_rtstat', { port: this.selected }, { loading: false }).then(v => {
        const n = new Date()
        for (const k in this.statsData) {
          if (Object.hasOwnProperty.call(this.statsData, k)) {
            this.statsData[k].shift()
            this.statsData[k].push({
              value: [n, v[k]]
            })
          }
        }
      }, err => {
        console.log('port_rtstat get error: ', err)
      })
    },
    radioChange(v) {
      this.updatePanel()
    }
  }
}
</script>

<style lang="scss" scoped>
.rahama {
    font-size: 13px;
    text-align: center;
    width: 350px;
    margin: 20px auto 0;
}
.chart {
  margin-top: 20px;
}
// 固定 900px:窄窗口时由外层 .chart(overflow:auto)横向滚动,不压缩图表
.dasChart {
  position: relative;
  width: 900px;
  height: 450px;
  margin: 0 auto;
}
.dasChart .chartBorder {
  width: 99%;
  height: 95%;
  border: 2px solid #ccc;
  position: absolute;
  top: 3%;
  left: 1%;
  background: #ecf4f7;
}
.dasChart .chartSelect {
  position: absolute;
  right: 15px;
  top: 59px;
  width: 72px;
  z-index: 8;
  padding-left: 0;
}
.note {
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>
