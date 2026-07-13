<template>
  <!-- 原版:单选端口方格表(共用一个 radio name,选唯一成员口);无 All 按钮;窄屏换行重排 -->
  <div>
    <div class="table_title">{{ title }}</div>
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
                      type="radio"
                      :name="'portRadio' + _uid"
                      :checked="value === p"
                      :disabled="disabled"
                      @change="$emit('input', p)"
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
  name: 'PortRadioGrid',
  mixins: [portReflow],
  props: {
    title: { type: String, default: '' },
    ports: { type: Array, required: true, default: () => [] },
    value: { type: [Number, String], default: 0 }, // v-model:选中的端口号(0=未选)
    disabled: { type: Boolean, default: false }
  }
}
</script>
