<template>
  <div class="main_body" style="position: relative;">
    <div style="position: absolute; right: 25px; top: 12px;">
      <span>{{ getCurrentTime }}</span>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Dashboard" name="first">Dashboard</el-tab-pane>
      <el-tab-pane label="Switch View" name="second">Switch View</el-tab-pane>
      <el-tab-pane label="Real-time Statistics" name="third">Real-time Statistics</el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { parseTime } from '@/utils'

export default {
  data() {
    return {
      activeName: 'first',
      getCurrentTime: parseTime(new Date(), '{d} {m} {y} {h}:{i}:{s}'),
      timerId: 0
    }
  },
  created() {
    this.$http.get('url_get_mainPage').then(resp => {
      console.log('dashboard: ', resp)
    },
    err => {
      console.log('dashboard get error: ', err)
    })
  },
  mounted() {
    this.timerId = setInterval(() => {
      this.getCurrentTime = parseTime(new Date(), '{d} {m} {y} {h}:{i}:{s}')
    }, 1000)
  },
  beforeDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId)
    }
  },
  methods: {
    handleClick(tabVc, event) {
      // console.log(tabVc, event) 01 Jan 2021 0:19:57 {y}-{m}-{d} {h}:{i}:{s}
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-tabs__item {
  font-size: 18px;
  font-weight: 200;
  &.is-active {
    color: #1890ff;
  }
  &:hover {
    color: #1890ff;
    cursor: pointer;
  }
}
</style>
