<template>
  <div id="app" class="container-fluid">
    <div class="row bg-dark text-light px-4 pt-5 pb-0 ">
      <div id="main" class="col-9">
        <h1>Covid Charts</h1>
        <p class="lead">Interactive charts using CovidTracking.com's new API.</p>
      </div>
      <div class="col-3">

      </div>
    </div>
    <div class="row bg-dark text-light px-4 py-3 mb-4 sticky-top">
      <div id="filters" class="col-12">
        <div class="d-flex flex-start">
          <b-form-group label-for="btn-radios-1" label="Rolling average:" class="mb-1 mt-1">
             <b-form-radio-group
               id="btn-radios-1"
               v-model="rollingAverage"
               :options="rollingAverageOptions"
               buttons
               button-variant="outline-light"
               size="md"
               name="radios-btn-default"
             ></b-form-radio-group>
          </b-form-group>

          <div class="d-flex ml-4 mt-1 align-items-center">
            <b-form-group class="mr-2" label-for="btn-radios-2" label="Date Range:">
              <b-form-radio-group
                id="btn-radios-2"
                v-model="dateQuickPick"
                :options="dateQuickPickOptions"
                buttons
                button-variant="outline-light"
                size="md"
                name="radios-btn-default"
                @change="$store.dispatch('quickPickDates')"
              ></b-form-radio-group>
            </b-form-group>
            <b-form-group class="mr-2" label-for="input-horizontal" label="Start:">
              <b-form-datepicker
                id="start-datepicker"
                :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                v-model="start"
              ></b-form-datepicker>
            </b-form-group>
            <b-form-group label-for="input-horizontal" label="End:">
              <b-form-datepicker
                id="end-datepicker"
                :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                v-model="end"
              ></b-form-datepicker>
            </b-form-group>
          </div>
        </div>
      </div>
    </div>
    <div class="row p-4">
      <div id="left-sidebar" class="col-2">
        <div class="sticky-top">
          <strong>Jump to:</strong>
          <ul class="nav side-nav">
            <li class="nav-item">Positivity Rate</li>
            <li class="nav-item">Hospitalizations</li>
            <li class="nav-item">Daily Deaths</li>
          </ul>
        </div>
      </div>
      <div class="charts col-10">
        <h3 class="mb-4">Daily Numbers</h3>
        <div class="row">
          <div id="deaths" class="col-6 chart-card">
            <b-card title="Cases">
              <LineChart
                v-if="loaded"
                :chart-data="dailyNewCasesChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
          <div id="deaths" class="col-6 chart-card">
            <b-card title="Deaths">
              <LineChart
                v-if="loaded"
                :chart-data="dailyDeathsChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
          <div id="hospitalizations" class="col-6 chart-card">
            <b-card title="Hospitalizations">
              <LineChart
                v-if="loaded"
                :chart-data="hospitalizedCurrentlyChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
        </div>
        <h3 class="mb-4 mt-5">Calculated Metrics</h3>
        <div class="row">
          <!-- cases (increase), hospitalizations (current), deaths (increases) -->
          <div id="positivity-rate" class="col-6 chart-card">
            <b-card title="Test Positivity Rate">
              <LineChart
                v-if="loaded"
                :chart-data="positivityRateChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LineChart from './components/charts/Line'
import map from 'lodash/map'
import replace from 'lodash/replace'
import { mapState, mapGetters } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import tinycolor from 'tinycolor2'

export default {
  name: 'App',
  components: {
    LineChart
  },
  data() {
    return {
      rollingAverageOptions: [
        { text: 'None', value: 0 },
        { text: '5-day', value: 5 },
        { text: '7-day', value: 7 },
        { text: '14-day', value: 14 }
      ],
      dateQuickPickOptions: [
        { text: 'Last 90 days', value: 90 },
        { text: 'Last 30 days', value: 30 },
        { text: 'Since March', value: 1 }
      ],
    }
  },
  methods: {
    toggleDateFormat(str) {
      if (str.includes("-")) {
        // YYYY-MM-DD -> YYYYMMDD
        return replace(str, "-", "")
      } else {
        // YYYYMMDD -> YYYY-MM-DD
        return str[0,3] + "-" + str[4,5] + "-" + str[6,7]
      }
    },
    getChartData(dataSet, baseColor, label) {
      let chartData = [{
        data: this.$store.getters[dataSet + 'Data'],
        label,
        type: 'bar',
        backgroundColor: tinycolor(baseColor).lighten(35).toHexString()
      }]

      if (this.rollingAverage > 0) {
        chartData.push({
          data: this.$store.getters[dataSet + 'RAData'],
          label: `${label} ${this.rollingAverage}-day Average`,
          type: 'line',
          pointRadius: 0,
          borderColor: baseColor,
          backgroundColor: 'transparent'
        })
      }

      return {
        labels: map(this.filteredDates, (d) => { return d.formatted }),
        datasets: chartData.reverse()
      }
    }
  },
  computed: {
    ...mapState([
      'data',
      'loaded'
    ]),
    ...mapFields([
      'rollingAverage',
      'dateRange.start',
      'dateRange.end',
      'dateQuickPick'
    ]),
    ...mapGetters([
      'filteredDates',
      'filteredData'
    ]),
    dailyNewCasesChartData() {
      return this.getChartData('dailyNewCases', '#994857', 'Daily New Cases')
    },
    dailyDeathsChartData() {
      return this.getChartData('dailyDeaths', '#29272b', 'Daily Deaths')
    },
    positivityRateChartData() {
      return this.getChartData('positivityRate', '#994857', 'Positivity Rate')
    },
    hospitalizedCurrentlyChartData() {
      return this.getChartData('hospitalizedCurrently', '#246196', 'Daily Hospitalizations')
    },
    loaded() {
      return this.$store.state.loaded
    }
  },
  mounted() {
    this.$store.dispatch('setInitialData')
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}


#left-sidebar .sticky-top {
  top: 182px;
  /* padding-left: 17px; */
}

.side-nav {
  display: flex;
  flex-direction: column;
}

.chart-card {
  /* max-width: 90%; */
  margin-bottom: 40px;
  /* height: 300px; */
  /* max-height: 200px; */
}

p.lead {
  font-weight: 400;
  opacity: 0.8;
}

label {
  font-weight: 800;
}
</style>
