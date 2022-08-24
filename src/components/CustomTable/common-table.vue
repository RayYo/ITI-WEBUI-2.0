<template>
  <div>
    <div v-if="headerTitle" class="table_title">{{ headerTitle }}</div>
    <table border="" cellspacing="0" class="from_table">
      <tbody>
        <tr v-for="(name, rowIdx) in firstColumn" :key="rowIdx">
          <td>{{ name }}</td>
          <td> <slot :name="rowIdx" /> </td>
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
      default: ''
    },
    firstColumn: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>
