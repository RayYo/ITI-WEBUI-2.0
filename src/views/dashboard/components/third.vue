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
    updatePanel() {
      const type = this.radio
      this.portLinkData = []
      this.$http.get('url_get_panelInfo').then(resp => {
        for (const i in resp.data.ports) {
          const obj = resp.data.ports[i]
          // port link
          let pRef = ''
          let pColor = ''
          if (obj.port.indexOf('F') !== -1) {
            pRef = 'portf' + obj.port.substr(0, obj.port.length - 1)
          } else {
            pRef = 'port' + obj.port
          }
          switch (type) {
            case 1:
            case 3:
              if (obj.speed === '1000') {
                pColor = 'green'
              } else {
                pColor = 'orange'
              }
              if (!obj.linkup) {
                pColor = 'black'
              }
              break
            case 2:
              if (obj.dupFull) {
                pColor = 'green'
              } else {
                pColor = 'orange'
              }
              if (!obj.linkup) {
                pColor = 'black'
              }
              break
            case 4:
              if (obj.poeStatus === 'ON') {
                pColor = 'green'
              } else {
                pColor = 'black'
              }
              break
            default:
              pColor = 'black'
              break
          }
          this.portLinkData.push({
            portRef: pRef,
            linkColor: pColor
          })
        }
      },
      err => {
        console.log('panelInfo get error: ', err)
      })
    },
    portListInit() {
      this.$http.get('url_get_portStatistics').then(resp => {
        resp.data.ports.forEach(o => {
          this.portList.push({
            v: o.port,
            n: 'Port' + o.port
          })
        })
      },
      err => {
        console.log('portList get error: ', err)
      })
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
      this.$http.get('url_get_portStatistics').then(resp => {
        let v
        for (let i = 0; i < resp.data.ports.length; i++) {
          const o = resp.data.ports[i]
          if (o.port === this.selected) {
            v = {
              totalRx: o.totalRx,
              totalTx: o.totalTx,
              ucRx: o.unicastRx,
              mcRx: o.multiCastRx,
              bcRx: o.broadCastRx,
              ucTx: o.unicastTx,
              mcTx: o.multiCastTx,
              bcTx: o.broadCastTx
            }
            break
          }
        }
        const n = new Date()
        for (const k in this.statsData) {
          if (Object.hasOwnProperty.call(this.statsData, k)) {
            this.statsData[k].shift()
            this.statsData[k].push({
              value: [n, v[k]]
            })
          }
        }
      },
      err => {
        console.log('portStatistics get error: ', err)
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
