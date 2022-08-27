<template>
  <div id="pannel2" :style="{'margin-bottom': marginB}">
    <div :class="extraClass">{{ headerTitle }}</div>
    <div>
      <div v-for="(data, rowIdx) in tableData" id="pannel2" :key="rowIdx">
        <div class="three">{{ Object.keys(data)[0] }}</div>
        <div class="three">{{ Object.values(data)[0] }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    headerTitle: {
      type: String,
      default: ''
    },
    tableData: {
      type: Array,
      required: false,
      default: () => []
    },
    extraClass: {
      type: Object,
      required: false,
      default: () => {}
    },
    marginB: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>
