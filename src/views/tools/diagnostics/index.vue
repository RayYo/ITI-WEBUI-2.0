<template>
  <div class="main_body">
    <div id="basetitle">Cable Diagnostics</div>
    <div>
      <div>
        <div class="table_title">Cable Diagnostics</div>
        <table border="" cellspacing="0" class="from_table">
          <tbody>
            <tr>
              <td>Port</td>
              <td>
                <select v-model="port">
                  <option v-for="p in 28" :key="p" :value="String(p)">{{ p }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="margin1015">
        <input type="button" class="btnOutTable" value="Test Now" @click="onTest">
      </div>
      <div>
        <div class="table_title">Cable Diagnostics Table</div>
        <div id="table1">
          <div class="white-space_pre">
            <el-table
              v-loading="loading"
              :data="rows"
              class="tableBox"
              stripe
              border
              empty-text="< < Table is empty > >"
              :header-cell-style="pageTableHeader"
              :cell-style="pageTableCell"
            >
              <el-table-column prop="port" label="Port" min-width="193" />
              <el-table-column prop="result" label="Test Result" min-width="287" />
              <el-table-column prop="faultDistance" label="Cable Fault Distance (meters)" min-width="575" />
              <el-table-column prop="length" label="Cable Length (meters) [in range]" min-width="575" />
            </el-table>
          </div>
        </div>
      </div>
      <div class="note"><span>The cable diagnostics feature is designed primarily for administrators or customer service representatives to verify and test copper cables; it can rapidly determine the quality of the cables and the types of error.</span></div>
      <div class="note">
        <p>Note:</p>
        <span>
          1. If cable length is displayed as “N/A” it means the cable length is “Not Available”.
          <br>
          {{ NBSP4 }}The cable length is undetermined because either the link speed is less than 100M or
          <br>
          {{ NBSP4 }}the cables are broken and/or bad quality.
          <br> <br>
          2. The deviation of "Cable Fault Distance" is +/-2 meters,
          <br>
          {{ NBSP4 }}therefore No cable may be displayed under Test Result, when the cable used is less than 2 m in length.
          <br> <br>
          3. It also measures cable fault and identifies the fault in length according to the distance from this switch.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { cgiGet } from '@/api/cgi'
import { pageTableHeader, pageTableCell } from '@/utils/emu'

const NBSP4 = '\u00A0'.repeat(4)
const PAIRS = ['Pair1', 'Pair2', 'Pair3', 'Pair4']

export default {
  data() {
    return {
      NBSP4,
      pageTableHeader,
      pageTableCell,
      loading: false,
      port: '1',
      rows: []
    }
  },
  methods: {
    // Test Now:发请求取该 port 的测线结果(mock:linkUp 表给出接入 port 的线长)
    onTest() {
      this.loading = true
      cgiGet('tools_cableDiag').then(d => {
        const linkUp = d.linkUp || {}
        const up = Object.prototype.hasOwnProperty.call(linkUp, this.port)
        this.rows = [{
          port: this.port,
          result: PAIRS.map(p => `${p}: ${up ? 'OK' : 'Open in Cable'}`).join('\n'),
          faultDistance: PAIRS.map(p => `${p}: ${up ? 'N/A' : '0'}`).join('\n'),
          length: up ? String(linkUp[this.port]) : 'N/A'
        }]
      }).finally(() => { this.loading = false })
    }
  }
}
</script>
