<template>
  <div style="margin-bottom: 20px; overflow: auto;">
    <div style="text-align: center;">
      <div class="panel_box">
        <!-- 绿区:铜口,8 个一组(上排奇数口/下排偶数口) -->
        <div class="green" style="background: rgb(0, 109, 103);">
          <div
            v-for="(g, gi) in copperGroups"
            :key="'g' + gi"
            class="port_box"
            :style="gi === copperGroups.length - 1 ? 'margin-right: 0px' : null"
          >
            <div style="margin-bottom: 20px;">
              <div v-for="p in g.top" :key="p" :ref="`port${p}`" class="port default_port">
                {{ p }}
              </div>
              <div class="clear_both" />
            </div>
            <div>
              <div v-for="p in g.bottom" :key="p" :ref="`port${p}`" class="port default_port">
                {{ p }}
              </div>
              <div class="clear_both" />
            </div>
          </div>
          <div class="clear_both" />
        </div>
        <!-- 蓝区:光口(SFP/SFP+),2 个一列上下排;无光口机型不渲染 -->
        <div v-if="fiberPairs.length" class="blue">
          <div style="float: left;">
            <div
              v-for="(pair, fi) in fiberPairs"
              :key="'f' + fi"
              class="port_boxf"
              :style="fi === fiberPairs.length - 1 ? 'margin-right: 0px' : null"
            >
              <div style="margin-bottom: 20px;">
                <div :ref="`portf${pair[0]}`" class="portf default_port">
                  {{ pair[0] + 'F' }}
                </div>
                <div class="clear_both" />
              </div>
              <div v-if="pair[1] != null">
                <div :ref="`portf${pair[1]}`" class="portf default_port">
                  {{ pair[1] + 'F' }}
                </div>
                <div class="clear_both" />
              </div>
            </div>
          </div>
          <div class="clear_both" />
        </div>
        <div class="clear_both" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    portLinkChange: {
      type: Array,
      required: false,
      default: () => {
        return [{
          portRef: 'port1',
          linkColor: 'black'
        }]
      }
    }
  },
  computed: {
    // 机型端口表(sys_devinfo 驱动):[{port,type,maxSpeed,poe}]
    ports() {
      return this.$store.getters.modelInfo('ports') || []
    },
    // 铜口按 8 个一组:上排=组内第 1/3/5/7 个,下排=第 2/4/6/8 个
    copperGroups() {
      const copper = this.ports.filter(p => p.type === 'copper').map(p => p.port)
      const groups = []
      for (let i = 0; i < copper.length; i += 8) {
        const g = copper.slice(i, i + 8)
        groups.push({
          top: g.filter((_, j) => j % 2 === 0),
          bottom: g.filter((_, j) => j % 2 === 1)
        })
      }
      return groups
    },
    // 光口两个一列:[上,下];奇数个时最后一列只有上格
    fiberPairs() {
      const fiber = this.ports.filter(p => p.type === 'fiber').map(p => p.port)
      const pairs = []
      for (let i = 0; i < fiber.length; i += 2) {
        pairs.push([fiber[i], fiber[i + 1]])
      }
      return pairs
    }
  },
  watch: {
    portLinkChange: function(newV, oldV) {
      for (const i in newV) {
        // v-for 里的 ref 是数组;按机型不同 fiber 也可能不存在,判空防御
        let el = this.$refs[`${newV[i].portRef}`]
        if (Array.isArray(el)) el = el[0]
        if (el) el.style.background = newV[i].linkColor
      }
    }
  }
}
</script>

<style lang="scss" scoped>
    // 面板必须保持整条水平结构:任何窗口宽度下都不许换行分层,
    // 窄窗口由外层容器(overflow:auto)横向滚动;
    // inline-flex + flex:none:子块始终按内容宽排一行(inline-block 会随容器收缩导致 float 换行)
    .panel_box {
        display: inline-flex;
        align-items: flex-start;
        text-align: left;
    }
    .blue, .green {
        padding: 20px 15px;
        flex: none;
        float: left;
        white-space: nowrap;
    }
    .port_box {
        background: #fff;
        float: left;
        padding: 3px 10px;
        margin-right: 15px;
    }
    .port, .portf {
        width: 38px;
        height: 38px;
        background: #000;
        color: #fff;
        font-size: 18px;
        text-align: center;
        line-height: 38px;
        float: left;
    }
    .port {
        margin-right: 8px;
    }
    .clear_both {
        clear: both;
    }
    .blue .port_box {
        margin-right: 40px;
    }
    .blue {
        background: #0077c5;
    }
    .port_boxf {
        background: #fff;
        float: left;
        padding: 3px 3px;
        margin-right: 20px;
    }
    .default_port {
      width: 50px;
      background-color: black;
    }
    .port_box > div > div:nth-last-child(2) {
      margin-right: 0;
    }
    </style>
