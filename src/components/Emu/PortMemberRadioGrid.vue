<template>
  <!-- 原版:每个成员状态一张 .port_table(端口号在上/分割线/单选在下),同一端口三张表共用单选 -->
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
      <div class="table-scroll">
        <div style="margin: -2px">
          <table border cellspacing="0" cellpadding="2" class="port_table">
            <tbody>
              <tr>
                <td v-for="p in ports" :key="p">
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <br v-if="st.value !== states[states.length - 1].value">
    </div>
  </div>
</template>

<script>
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
  methods: {
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

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}
.port_table {
  min-width: 1200px;
}
</style>
