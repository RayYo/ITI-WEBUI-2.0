<template>
  <div class="main_body">
    <div id="basetitle">Ping Test Result</div>
    <div>
      <div class="table_title">Ping Test Result</div>
      <table border="" cellspacing="0" class="from_table">
        <tbody>
          <tr>
            <td>Result</td>
            <td>{{ result }}</td>
          </tr>
          <tr>
            <td>Destination IP Address</td>
            <td>{{ ip }}</td>
          </tr>
          <tr>
            <td>Pass</td>
            <td>{{ pass }}</td>
          </tr>
          <tr>
            <td>Average Time</td>
            <td>{{ avgTime }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Back To Ping Test" @click="$router.back()">
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'

export default {
  data() {
    return {
      result: '',
      ip: '',
      pass: '',
      avgTime: ''
    }
  },
  watch: {
    // 同页不同 query 导航时组件被复用,需重新加载
    $route: 'init'
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.result = ''
      this.ip = ''
      this.pass = ''
      this.avgTime = ''
      // 只有 ping 过(带 ip)才显示结果内容
      const { ip } = this.$route.query
      if (!ip) return
      this.ip = ip
      cgiGet('tools_pingResult').then(d => {
        this.result = d.result || ''
        this.pass = d.pass
        this.avgTime = d.avgTime
      })
    }
  }
}
</script>
