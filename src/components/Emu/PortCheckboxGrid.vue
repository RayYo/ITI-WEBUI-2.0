<template>
  <div>
    <div class="table_title">
      <span>{{ title }}</span>
      <div style="display: inline; float: right; margin-top: 4px">
        <input type="button" class="btnInTitle" :class="{ btnDisabled: disabled }" value="All" :disabled="disabled" @click="toggleAll">
      </div>
    </div>
    <div class="table-scroll">
      <table class="port-grid" border cellspacing="0">
        <tbody>
          <tr class="port-grid-head">
            <td v-for="p in ports" :key="'h' + p">{{ p }}</td>
          </tr>
          <tr>
            <td v-for="p in ports" :key="'c' + p">
              <input
                type="checkbox"
                :checked="value.indexOf(p) !== -1"
                :disabled="disabled"
                @change="toggle(p, $event)"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PortCheckboxGrid',
  props: {
    title: { type: String, default: '' },
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

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
.port-grid {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  table-layout: fixed;
  background-color: #fff;
  td {
    border: 1px solid #ccc;
    text-align: center;
    padding: 8px 0;
  }
  .port-grid-head td {
    font-weight: 700;
    color: #585f69;
  }
}
</style>
