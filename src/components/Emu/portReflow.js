import ResizeObserver from 'resize-observer-polyfill'

/**
 * 端口方格表(.port_table)换行混入:照原版逻辑——不横向滚动,窗口变窄时换行重排。
 *
 * 原版算法(实测 emulator):每格最小宽约 41px。
 *   maxFit = floor(可用宽 / CELL_MIN)
 *   行数    = ceil(端口数 / maxFit)
 *   每行列数 = ceil(端口数 / 行数)   ← 均衡分行
 * 末行不足列数时补空白单元格(保持列宽一致)。
 *
 * 使用组件需:
 *   - props/computed 里有 `ports`(端口号数组)
 *   - 模板容器加 ref="gridBox"
 * 提供:`gridRows`(二维:每行为 port 号或 null 的数组)
 */
const CELL_MIN = 41

export default {
  data() {
    return { gridW: 0 }
  },
  computed: {
    colsPerRow() {
      const n = this.ports.length
      if (!n) return 1
      const w = this.gridW || 1635 // 挂载前默认按宽屏(28 列)
      const maxFit = Math.max(1, Math.floor(w / CELL_MIN))
      const rows = Math.max(1, Math.ceil(n / maxFit))
      return Math.ceil(n / rows)
    },
    gridRows() {
      const cols = this.colsPerRow
      const rows = []
      for (let i = 0; i < this.ports.length; i += cols) {
        const row = this.ports.slice(i, i + cols)
        while (row.length < cols) row.push(null)
        rows.push(row)
      }
      return rows
    }
  },
  mounted() {
    if (!this.$refs.gridBox) return
    this.gridW = this.$refs.gridBox.clientWidth
    this._ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      if (w) this.gridW = w
    })
    this._ro.observe(this.$refs.gridBox)
  },
  beforeDestroy() {
    if (this._ro) { this._ro.disconnect(); this._ro = null }
  }
}
