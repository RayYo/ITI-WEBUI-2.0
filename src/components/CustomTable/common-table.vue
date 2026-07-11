<template>
  <div>
    <div v-if="headerTitle" class="table_title">{{ headerTitle }}</div>
    <table border="" cellspacing="0" class="from_table">
      <tbody>
        <template v-for="(name, rowIdx) in firstColumn">
          <tr :key="rowIdx">
            <td :rowspan="doubleRows.indexOf(rowIdx) !== -1 ? 2 : 1">{{ name }}</td>
            <td> <slot :name="rowIdx" /> </td>
          </tr>
          <!-- doubleRows 指定的行在名称列 rowspan 下追加第二行(slot 名 <idx>-2) -->
          <tr v-if="doubleRows.indexOf(rowIdx) !== -1" :key="rowIdx + '-2'">
            <td> <slot :name="rowIdx + '-2'" /> </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    headerTitle: {
      type: String,
      default: ''
    },
    firstColumn: {
      type: Array,
      required: true,
      default: () => []
    },
    doubleRows: {
      type: Array,
      required: false,
      default: () => []
    }
  }
}
</script>
