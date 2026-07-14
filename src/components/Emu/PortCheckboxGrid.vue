<template>
  <!-- 原版:.port_table(端口号在上/分割线/勾选在下),窄屏换行重排不滚动 -->
  <!-- bare=true:仅端口勾选格(无灰头 All,Trunk 每行内嵌用) -->
  <div>
    <div v-if="!bare" class="table_title">
      <span>{{ title }}</span>
      <div style="display: inline; float: right; margin-top: 4px">
        <input type="button" class="btnInTitle" :class="{ btnDisabled: disabled }" value="All" :disabled="disabled" @click="toggleAll">
      </div>
    </div>
    <div ref="gridBox" style="margin: -2px">
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
                      type="checkbox"
                      :class="{ disabledStyle: disabled }"
                      :checked="value.indexOf(p) !== -1"
                      :disabled="disabled"
                      @change="toggle(p, $event)"
                    >
                  </span>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import portReflow from './portReflow'

export default {
  name: 'PortCheckboxGrid',
  mixins: [portReflow],
  props: {
    title: { type: String, default: '' },
    bare: { type: Boolean, default: false }, // 仅渲染勾选格,无灰头 All
    ports: { type: Array, required: true, default: () => [] },
    value: { type: Array, default: () => [] }, // v-model:已选端口号数组
    disabled: { type: Boolean, default: false }
  },
  methods: {
    toggle(p, e) {
      const set = this.value.slice()
      const i = set.indexOf(p)
      if (e.target.checked) {
        if (i === -1) set.push(p)
      } else if (i !== -1) {
        set.splice(i, 1)
      }
      set.sort((a, b) => a - b)
      this.$emit('input', set)
    },
    toggleAll() {
      // 全选/全不选切换(原版标题栏 All 按钮)
      this.$emit('input', this.value.length === this.ports.length ? [] : this.ports.slice())
    }
  }
}
</script>
