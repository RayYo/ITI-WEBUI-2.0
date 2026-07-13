<template>
  <!-- 原版:每个成员状态一张 .port_table(端口号在上/分割线/单选在下),同端口三张表共用单选;窄屏换行重排不滚动 -->
  <div>
    <div v-for="st in states" :key="st.value">
      <div class="table_title">
        {{ st.label }}
        <div style="display: inline; float: right; margin-top: 4px">
          <input
            type="button"
            class="btnInTitle"
            :class="{ btnDisabled: disabled }"
            value="All"
            :disabled="disabled"
            @click="selectAll(st.value)"
          >
        </div>
      </div>
      <div :ref="stateRef(st)" style="margin: -2px">
        <table border cellspacing="0" cellpadding="2" class="port_table">
          <tbody>
            <tr v-for="(row, ri) in gridRows" :key="ri">
              <td v-for="(p, ci) in row" :key="ci">
                <template v-if="p !== null">
                  <div class="pt-cell"><span>{{ p }}</span></div>
                  <div class="pt-divider" />
                  <div class="pt-cell">
                    <span>
                      <input
                        type="radio"
                        :name="'portMember' + _uid + '_' + p"
                        :value="st.value"
                        :checked="value[p - 1] === st.value"
                        :disabled="disabled"
                        @change="pick(p, st.value)"
                      >
                    </span>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <br v-if="st.value !== states[states.length - 1].value">
    </div>
  </div>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill'

const CELL_MIN = 41

export default {
  name: 'PortMemberRadioGrid',
  props: {
    // 状态定义:[{ label:'Static Tagged', value:1 }, ...]
    states: { type: Array, required: true, default: () => [] },
    ports: { type: Array, required: true, default: () => [] },
    // v-model:长度 = 端口数,每项为该端口当前状态值
    value: { type: Array, required: true, default: () => [] },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return { gridW: 0 }
  },
  computed: {
    // 换行算法照原版(见 portReflow.js)
    colsPerRow() {
      const n = this.ports.length
      if (!n) return 1
      const w = this.gridW || 1635
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
    // 所有状态表宽度一致,取第一张观测即可
    const first = this.states[0] && this.$refs[this.stateRef(this.states[0])]
    const box = Array.isArray(first) ? first[0] : first
    if (!box) return
    this.gridW = box.clientWidth
    this._ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      if (w) this.gridW = w
    })
    this._ro.observe(box)
  },
  beforeDestroy() {
    if (this._ro) { this._ro.disconnect(); this._ro = null }
  },
  methods: {
    stateRef(st) {
      return 'box' + st.value
    },
    pick(port, val) {
      const arr = this.value.slice()
      arr[port - 1] = val
      this.$emit('input', arr)
    },
    selectAll(val) {
      this.$emit('input', this.ports.map(() => val))
    }
  }
}
</script>
