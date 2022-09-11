<template>
  <div>
    <div v-if="headerTitle" class="table_title">{{ headerTitle }}</div>
    <table border="" cellspacing="0" class="from_table">
      <tbody>
        <template v-for="(name, rowIdx) in firstColumn">
          <tr v-if="true" :key="rowIdx">
            <td :rowspan="(name === 'Syslog Server IP')?'2':'1'">{{ name }}</td>
            <td> <slot :name="rowIdx" /> </td>
          </tr>
          <tr v-if="name === 'Syslog Server IP'" :key="rowIdx+'-2'">
            <td> <slot :name="rowIdx+'-2'" /> </td>
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
    }
  }
}
</script>
