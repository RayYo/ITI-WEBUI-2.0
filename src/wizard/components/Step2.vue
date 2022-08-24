<template>
  <div class="main_body">
    <div id="basetitle">Switch Setup Wizard</div>
    <common-table
      header-title="Step 3: Date/Time Settings"
      :first-column="['Current Time','Date Settings', 'Time Settings']"
    >
      <template #0>
        {{ currentDate }}
      </template>
      <template #1>
        <div class="InputOutTable150" style="display: inline-block; width: 50%;">
          <input ref="yyyy" v-model="year" onkeyup="value=value.replace(/\D/g,'')" type="text" maxlength="4" class="baseInput" @change="checkValue('year')">
        </div> <span>/</span> <div class="InputOutTable150" style="display: inline-block; width: 50%;">
          <input ref="mm" v-model="month" onkeyup="value=value.replace(/\D/g,'')" type="text" maxlength="2" class="baseInput" @change="checkValue('month')">
        </div> <span>/</span> <div class="InputOutTable150" style="display: inline-block; width: 50%;">
          <input ref="dd" v-model="day" onkeyup="value=value.replace(/\D/g,'')" type="text" maxlength="2" class="baseInput" @change="checkValue('day')">
        </div> <span class="tipAfterInputBox">(YYYY:MM:DD)</span>
      </template>
      <template #2>
        <div class="InputOutTable150" style="display: inline-block; width: 50%;">
          <input ref="hh" v-model="hour" onkeyup="value=value.replace(/\D/g,'')" type="text" maxlength="2" class="baseInput" @change="checkValue('hour')">
        </div> <span>:</span> <div class="InputOutTable150" style="display: inline-block; width: 50%;">
          <input ref="min" v-model="min" onkeyup="value=value.replace(/\D/g,'')" type="text" maxlength="2" class="baseInput" @change="checkValue('min')">
        </div> <span>:</span> <div class="InputOutTable150" style="display: inline-block; width: 50%;">
          <input ref="ss" v-model="sec" onkeyup="value=value.replace(/\D/g,'')" type="text" maxlength="2" class="baseInput" @change="checkValue('sec')">
        </div> <span class="tipAfterInputBox">(HH:MM:SS)</span>
      </template>
    </common-table>

    <div class="margin1015">
      <input type="button" class="btnOutTable" value="Previous" @click="previous">
      <input type="button" class="btnOutTable" value="Next" @click="next">
      <input type="button" class="btnOutTable" value="Cancel" @click="cancel">
    </div>
  </div>
</template>

<script>
import commonTable from '@/components/CustomTable/common-table.vue'
import { parseTime } from '@/utils'
import { mapGetters } from 'vuex'

export default
{
  components: {
    commonTable
  },
  data() {
    return {
      currentDate: '',
      year: '',
      month: '',
      day: '',
      hour: '',
      min: '',
      sec: ''
    }
  },
  computed: {
    ...mapGetters([
      'currentTime'
    ])
  },
  created() {
    this.currentDate = parseTime(this.currentTime, '{d} {m} {y} {h}:{i}:{s}')
    const date = new Date(parseInt(this.currentTime) * 1000)
    this.year = date.getFullYear()
    this.month = (date.getMonth() + 1).toString().padStart(2, '0')
    this.day = date.getDate().toString().padStart(2, '0')
    this.hour = date.getHours().toString().padStart(2, '0')
    this.min = date.getMinutes().toString().padStart(2, '0')
    this.sec = date.getSeconds().toString().padStart(2, '0')
  },
  methods:
  {
    checkValue(type) {
      switch (type) {
        case 'year':
          this.year = this.year.replace(/\D/g, '')
          if (this.year === '' || this.year < 2017 || this.year > 2099) {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'The range of year is 2018 ~ 2099.'
            }).then(() => {
              this.year = ''
              this.$refs.yyyy.focus()
            })
          }
          break
        case 'month':
          this.month = this.month.replace(/\D/g, '')
          if (this.month === '' || this.month < 1 || this.month > 12) {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'The range of month is 1 ~ 12.'
            }).then(() => {
              this.month = ''
              this.$refs.mm.focus()
            })
          }
          break
        case 'day':
          this.day = this.day.replace(/\D/g, '')
          if (this.day === '' || this.day < 1 || this.day > 31) {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'Invalid day settings.'
            }).then(() => {
              this.day = ''
              this.$refs.dd.focus()
            })
          }
          break
        case 'hour':
          this.hour = this.hour.replace(/\D/g, '')
          if (this.hour === '' || this.hour < 0 || this.hour > 23) {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'Please enter an integer between 0 ~ 23'
            }).then(() => {
              this.hour = ''
              this.$refs.hh.focus()
            })
          }
          break
        case 'min':
          this.min = this.min.replace(/\D/g, '')
          if (this.min === '' || this.min < 0 || this.min > 59) {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'Please enter an integer between 0 ~ 59'
            }).then(() => {
              this.min = ''
              this.$refs.min.focus()
            })
          }
          break
        case 'sec':
          this.sec = this.sec.replace(/\D/g, '')
          if (this.sec === '' || this.sec < 0 || this.sec > 59) {
            this.$msgbox({
              type: 'warning',
              title: 'Warning',
              message: 'Please enter an integer between 0 ~ 59'
            }).then(() => {
              this.sec = ''
              this.$refs.ss.focus()
            })
          }
          break
        default:
          break
      }
    },
    previous() {
      this.$router.push('/wizard/step1')
    },

    next() {
      if (this.year === '' ||
          this.month === '' ||
          this.day === '' ||
          this.hour === '' ||
          this.min === '' ||
          this.sec === '') {
        this.$msgbox({
          type: 'warning',
          title: 'Warning',
          message: 'Date cannot be empty!'
        })

        return
      }

      // add current time stamp to store
      const time = new Date(this.year, this.month, this.day, this.hour, this.min, this.sec)
      this.$store.dispatch('wizard/timeSetting', (time / 1000).toString())

      this.$router.push('/wizard/step3')
    },

    cancel() {
      this.$router.push('/dashboard')
    }
  }
}
</script>
