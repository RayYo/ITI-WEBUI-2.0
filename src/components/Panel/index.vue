<template>
  <div style="margin-bottom: 20px; overflow: auto;">
    <div>
      <div class="panel_box" style="height: 142px; overflow: auto; width: 1122px; margin: 0px auto;">
        <div class="green" style="background: rgb(0, 109, 103);">
          <template v-for="group in copperGroupNum">
            <div v-if="group < copperGroupNum" :key="group" class="port_box">
              <div style="margin-bottom: 20px;">
                <div v-for="port in 4" :key="port" :ref="`port${2*(port-1)+(group-1)*8+1}`" class="port default_port">
                  {{ 2*(port-1)+(group-1)*8+1 }}
                </div>
                <div class="clear_both" />
              </div>
              <div>
                <div v-for="port in 4" :key="port" :ref="`port${2*(port-1)+(group-1)*8+2}`" class="port default_port">
                  {{ 2*(port-1)+(group-1)*8+2 }}
                </div>
                <div class="clear_both" />
              </div>
            </div>
            <div v-else :key="group+1" class="port_box" style="margin-right:0px;">
              <div style="margin-bottom: 20px;">
                <div v-for="port in 4" :key="port" :ref="`port${2*(port-1)+(group-1)*8+1}`" class="port default_port">
                  {{ 2*(port-1)+(group-1)*8+1 }}
                </div>
                <div class="clear_both" />
              </div>
              <div>
                <div v-for="port in 4" :key="port" :ref="`port${2*(port-1)+(group-1)*8+2}`" class="port default_port">
                  {{ 2*(port-1)+(group-1)*8+2 }}
                </div>
                <div class="clear_both" />
              </div>
            </div>
          </template>
          <div class="clear_both" />
        </div>
        <div class="blue">
          <div class="port_box">
            <div style="margin-bottom: 20px;">
              <div v-for="port in 2" :key="port" :ref="`port${copperGroupNum*8+(port*2-1)}`" class="port default_port">
                {{ copperGroupNum*8+(port*2-1) }}
              </div>
              <div class="clear_both" />
            </div>
            <div>
              <div v-for="port in 2" :key="port" :ref="`port${copperGroupNum*8+(port*2)}`" class="port default_port">
                {{ copperGroupNum*8+(port*2) }}
              </div>
              <div class="clear_both" />
            </div>
          </div>
          <div style="float: left;">
            <div class="port_boxf">
              <div style="margin-bottom: 20px;">
                <div :ref="`portf${copperGroupNum*8+1}`" class="portf default_port">
                  {{ (copperGroupNum*8+1)+'F' }}
                </div>
                <div class="clear_both" />
              </div>
              <div>
                <div :ref="`portf${copperGroupNum*8+2}`" class="portf default_port">
                  {{ (copperGroupNum*8+2)+'F' }}
                </div>
                <div class="clear_both" />
              </div>
            </div>
            <div class="port_boxf" style="margin-right: 0px;">
              <div style="margin-bottom: 20px;">
                <div :ref="`portf${copperGroupNum*8+3}`" class="portf default_port">
                  {{ (copperGroupNum*8+3)+'F' }}
                </div>
                <div class="clear_both" />
              </div>
              <div>
                <div :ref="`portf${copperGroupNum*8+4}`" class="portf default_port">
                  {{ (copperGroupNum*8+4)+'F' }}
                </div>
                <div class="clear_both" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    copperGroupNum: {
      type: Number,
      default: 3
    },
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
  watch: {
    portLinkChange: function(newV, oldV) {
      for (const i in newV) {
        if (newV[i].portRef.indexOf('f') !== -1) { // fiber port
          this.$refs[`${newV[i].portRef}`].style.background = newV[i].linkColor
        } else { // copper port
          this.$refs[`${newV[i].portRef}`][0].style.background = newV[i].linkColor
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
    .panel_box {
        width: 100%;
    }
    .blue, .green {
        padding: 20px 15px;
        float: left;
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
    .threeGroup .port_box:nth-child(3), .twoGroup .port_box:nth-child(2) {
      margin-right: 0;
    }
    </style>
