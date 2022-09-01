<template>
  <div :id="id" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
// var echarts = require('echarts/lib/echarts');
// require('echarts/lib/chart/line');
// require('echarts/lib/component/title');
// require('echarts/lib/component/tooltip');
// require('echarts/lib/component/legend');

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
    statisticsData: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    statisticsData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
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
      this.setOptions(this.statisticsData)
    },
    setOptions({ totalRx, totalTx, ucRx, mcRx, bcRx, ucTx, mcTx, bcTx } = {}) {
      this.chart.setOption({
        title: {
          text: 'Packets',
          left: '2%',
          top: '4%',
          textStyle: {
            color: '#37A7EF',
            fontWeight: 400,
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#333333'
            }
          }
        },
        legend: {
          orient: 'vertical',
          right: '1%',
          bottom: '12%',
          icon: 'rect',
          itemWidth: 12,
          itemHeight: 10,
          data: ['Total(Rx)', 'Total(Tx)', 'UC(Rx)', 'MC(Rx)', 'BC(Rx)', 'UC(Tx)', 'MC(Tx)', 'BC(Tx)']
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
        xAxis: {
          type: 'time',
          name: 'System Time',
          nameLocation: 'center',
          nameTextStyle: {
            color: '#37A7EF',
            fontSize: 16,
            padding: [15, 0, 0, 0]
          },
          splitLine: {
            show: true
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true
          }
        },
        /**
         * data:{
         *  totalRx: [{name:'xxx',value:[2022111, 22]},....],
         *  totalTx: [{name:'xxx',value:[2022111, 22]},....],
         *  ...
         * }
         */
        series: [
          {
            name: 'Total(Rx)',
            type: 'line',
            itemStyle: {
              color: 'Lime'
            },
            symbol: 'rect',
            data: totalRx
          },
          {
            name: 'Total(Tx)',
            type: 'line',
            itemStyle: {
              color: '#0044FF'
            },
            symbol: 'rect',
            data: totalTx
          },
          {
            name: 'UC(Rx)',
            type: 'line',
            itemStyle: {
              color: 'red'
            },
            symbol: 'rect',
            data: ucRx
          },
          {
            name: 'MC(Rx)',
            type: 'line',
            itemStyle: {
              color: 'black'
            },
            symbol: 'rect',
            data: mcRx
          },
          {
            name: 'BC(Rx)',
            type: 'line',
            itemStyle: {
              color: 'yellow'
            },
            symbol: 'rect',
            data: bcRx
          },
          {
            name: 'UC(Tx)',
            type: 'line',
            itemStyle: {
              color: 'blueviolet'
            },
            symbol: 'rect',
            data: ucTx
          },
          {
            name: 'MC(Tx)',
            type: 'line',
            itemStyle: {
              color: 'SkyBlue'
            },
            symbol: 'rect',
            data: mcTx
          },
          {
            name: 'BC(Tx)',
            type: 'line',
            itemStyle: {
              color: '#7FFFAA'
            },
            symbol: 'rect',
            data: bcTx
          }
        ]
      })
    }
  }
}

</script>
