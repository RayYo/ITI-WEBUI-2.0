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
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    },
    poeUsageData: {
      type: Object,
      required: false,
      default: () => {
        return {
          poeData: [''],
          xData: ['']
        }
      }
    }
  },
  data() {
    return {
      chart: null
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
      let barW = ''
      if (this.poeUsageData.poeData.length > 0 && this.poeUsageData.poeData.length < 9) { barW = '20%' } else if (this.poeUsageData.poeData.length > 8 && this.poeUsageData.poeData.length < 17) { barW = '35%' } else { barW = '60%' }
      this.chart.setOption({
        title: {
          text: 'Watts',
          left: '8%',
          top: '4%',
          textStyle: {
            color: '#37A7EF',
            fontWeight: 400,
            fontSize: 16
          }
        },
        tooltip: {
          show: true,
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            axis: 'auto'
          },
          textStyle: {
            color: '#eee'
          }
        },
        grid: {
          show: true
        },
        xAxis: {
          name: 'Port',
          nameLocation: 'center',
          nameTextStyle: {
            color: '#37A7EF',
            fontSize: 16,
            padding: [8, 0, 0, 0]
          },
          axisTick: {
            alignWithLabel: true
          },
          data: this.poeUsageData.xData
        },
        yAxis: {},
        series: [
          {
            name: 'Watt',
            itemStyle: {
              color: '#3298DA'
            },
            barWidth: barW,
            type: 'bar',
            data: this.poeUsageData.poeData
          }
        ]
      })
    }
  }
}

</script>
