<template>
  <div :id="id" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    cpuChartData: {
      type: Array,
      required: false,
      default: () => []
    },
    memChartData: {
      type: Array,
      required: false,
      default: () => []
    }

  },
  data() {
    return {
      cpuCurrData: 0,
      memCurrData: 0,
      chart: null
    }
  },
  watch: {
    cpuChartData: function(newV, oldV) {
      if (this.chart) {
        const cpu = this.cpuChartData
        const mem = this.memChartData

        this.cpuCurrData = cpu[cpu.length - 1].value[1]
        this.memCurrData = mem[mem.length - 1].value[1]
        this.initChart()
        // this.chart.setOption({
        //   series: [{
        //     name: 'cpu',
        //     data: this.cpuChartData
        //   }, {
        //     name: 'mem',
        //     data: this.memChartData
        //   }]
        // })
      }
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      const currC = this.cpuCurrData
      const currM = this.memCurrData

      this.chart.setOption({
        xAxis: {
          type: 'time',
          splitLine: {
            show: true
          }
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          min: '0',
          max: '100',
          splitNumber: 10,
          axisLabel: {
            show: true,
            interval: 'auto',
            formatter: '{value} %'
          },
          splitLine: {
            show: true
          }
        },
        grid: {
          show: true,
          borderColor: 'transparent',
          backgroundColor: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#CDE6F1'
            }, {
              offset: 1, color: 'white'
            }]
          }
        },
        color: ['#FF8302', 'rgb(0,255,0)'],
        legend: {
          itemWidth: 15,
          itemHeight: 10,
          itemGap: 15,
          data: [{ name: 'cpu', icon: 'rect' },
            { name: 'mem', icon: 'rect' }
          ],
          left: '10%',
          bottom: '85%',
          textStyle: {
            fontSize: 12,
            color: '#000'
          },
          formatter: function(name) {
            let res = ''
            if (name === 'cpu') { res += 'CPU:' + currC + '%' } else { res += 'Memory:' + currM + '%' }
            return res
          },
          backgroundColor: 'rgb(243,249,251)'
        },
        series: [
          {
            name: 'cpu',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            lineStyle: {
              color: '#FF8302',
              width: 2
            },
            data: this.cpuChartData
          },
          {
            name: 'mem',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            lineStyle: {
              color: 'rgb(0,255,0)',
              width: 2
            },
            data: this.memChartData
          }
        ]
      })
    }
  }
}

</script>
