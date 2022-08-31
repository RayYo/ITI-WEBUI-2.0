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
        <select class="chartSelect"><option value="1">Port1</option><option value="2">Port2</option><option value="3">Port3</option><option value="4">Port4</option><option value="5">Port5</option><option value="6">Port6</option><option value="7">Port7</option><option value="8">Port8</option><option value="9">Port9</option><option value="10">Port10</option><option value="11">Port11</option><option value="12">Port12</option><option value="13">Port13</option><option value="14">Port14</option><option value="15">Port15</option><option value="16">Port16</option><option value="17">Port17</option><option value="18">Port18</option><option value="19">Port19</option><option value="20">Port20</option><option value="21">Port21</option><option value="22">Port22</option><option value="23">Port23</option><option value="24">Port24</option><option value="25">Port25</option><option value="26">Port26</option><option value="27">Port27</option><option value="28">Port28</option></select>
        <div class="lineChart_box" style="height: 450px; width: 100%;">
          <statisticsChart
            id="statistics"
            :statistics-data="statsData"
            width="100%"
            height="100%"
          />
        </div>
        <div class="note">
          <p>Note:</p>
          <span> UC(Rx):Unicast received&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MC(Rx):Multicast received&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;BC(Rx):Broadcast received <br> UC(Tx):Unicast transmitted&nbsp;&nbsp;MC(Tx):Multicast transmitted&nbsp;&nbsp;BC(Tx):Broadcast transmitted </span>
        </div>
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

    this.timer = setInterval(this.updatePanel, 10000)
    this.statsTimer = setInterval(this.updateStatsData, 3000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    clearInterval(this.statsTimer)
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
    statsDataInit() {
      const now = new Date()
      for (const k in this.statsData) {
        if (Object.hasOwnProperty.call(this.statsData, k)) {
          for (let i = 0; i < 50; i++) {
            const o = {
              name: (new Date(now - (49 - i) * 3000)).toString(),
              value: [(new Date(now - (49 - i) * 3000)), 0]
            }
            this.statsData[k].push(o)
          }
        }
      }
      // console.log(this.statsData)
    },
    updateStatsData() {
      const n = new Date()
      // const tmp = [211233, 9489, 777, 100021, 34567, 2345, 9765, 2089]
      for (const k in this.statsData) {
        if (Object.hasOwnProperty.call(this.statsData, k)) {
          // console.log(this.statsData[k])
          this.statsData[k].shift()
          // console.log('  shift: ', t)
          // console.log(this.statsData[k])
          this.statsData[k].push({
            name: n.toString(),
            value: [n, 9999]
          })
        }
      }

      // console.log('update', this.statsData)
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
  z-index: 10;
  padding-left: 0;
}
.note {
  margin-top: 12px;
  margin-bottom: 12px;
}
</style>
