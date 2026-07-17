<template>
  <!-- 全站统一翻页(以 IPv4 ARP Table 的设计为准):
       background 彩底按钮 + total/sizes/prev/pager/next/jumper,sizes 5/10/20/40 默认 5 -->
  <el-pagination
    :current-page="currentPage"
    :page-sizes="[5, 10, 20, 40]"
    :page-size="pageSize"
    background
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    @size-change="$emit('update:pageSize', $event)"
    @current-change="$emit('update:currentPage', $event)"
  />
</template>

<script>
export default {
  name: 'EmuPagination',
  props: {
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 5 },
    total: { type: Number, default: 0 }
  }
}
</script>
