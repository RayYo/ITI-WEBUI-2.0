<template>
  <div :style="extraStyle">
    <div class="table_title">{{ headerTitle }}</div>
    <table border="" cellspacing="0" class="from_table" :class="extraClass">
      <tbody>
        <tr v-for="(data, rowIdx) in tableData" :key="rowIdx">
          <td>{{ firstColumn[rowIdx] }}</td>
          <td>{{ data }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    headerTitle: {
      type: String,
      required: true
    },
    extraStyle: {
      type: Object,
      required: false,
      default: () => {}
    },
    extraClass: {
      type: Object,
      required: false,
      default: () => {}
    },
    firstColumn: {
      type: Array,
      required: true,
      default: () => []
    },
    tableData: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>
