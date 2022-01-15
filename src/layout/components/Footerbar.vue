<template>
  <div class="footer footer">
    <p>{{ descript }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      descript: '© 2022 TRENDnet, Inc. All Rights Reserved.'
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
overflow: hidden;
width: 100%;
height: 45px;
line-height: 15px;
background: #cfcfcf;
  p {
  text-align: right;
  padding-right: 20px;
  }
}
</style>
