<template>
  <div id="app" class="container-fluid">
    <div class="row bg-dark text-light px-1 px-lg-4 pt-5 pb-0 ">
      <div class="col-12 col-lg-3 d-flex order-lg-2 align-items-start justify-content-end pt-2">
        <a class="text-white" href="https://github.com/elliebartling/covid-charts">
          <font-awesome-icon :icon="['fab', 'github-alt']" size="lg" />
        </a>
      </div>
      <div id="main" class="col col-lg-9">
        <h1>Covid Charts</h1>
        <p class="lead">Interactive charts using CovidTracking.com's new API.</p>
      </div>
    </div>
    <div id="filter-wrapper" class="row bg-dark px-1 px-lg-4 py-3 mb-4 sticky-top">
      <b-form-group style="width:auto" label-for="btn-radios-1" class="ml-3 text-light mb-1 mr-2">
         <StateSelect />
      </b-form-group>
      <div id="filters" class="bg-dark col text-light">
        <b-form-group style="width:auto" class="mr-3 " label-for="btn-radios-2" label="Date Range:">
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
        <b-form-group style="width:auto" class="mr-2" label-for="input-horizontal" label="Start:">
          <b-form-datepicker
            id="start-datepicker"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
            v-model="start"
          ></b-form-datepicker>
        </b-form-group>
        <b-form-group class="mr-4" style="width:auto" label-for="input-horizontal" label="End:">
          <b-form-datepicker
            id="end-datepicker"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
            v-model="end"
          ></b-form-datepicker>
        </b-form-group>
        <b-form-group style="width:auto" label-for="btn-radios-1" label="Rolling average:" class="mb-1 mr-4">
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
      </div>
    </div>
    <div class="row px-1 px-lg-4">
      <div id="left-sidebar" class="col-12 col-md-2 mb-5">
        <div class="sticky-top">
          <Sidebar />
        </div>
      </div>
      <div ref="charts" class="charts col-12 col-lg-10">
        <!-- Section Start -->
        <h3 id="daily-metrics" class="mb-4 mt-3">Daily Metrics</h3>
        <div class="row row-cols-1 row-cols-md-2">
          <div id="cases" class="col chart-card">
            <b-card title="Cases">
              <LineChart
                v-if="loaded"
                :chart-data="dailyNewCasesChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
          <div id="deaths" class="col chart-card">
            <b-card title="Deaths">
              <LineChart
                v-if="loaded"
                :chart-data="dailyDeathsChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
          <div id="hospitalizations" class="col chart-card">
            <b-card title="Hospitalizations">
              <LineChart
                v-if="loaded"
                :chart-data="hospitalizedCurrentlyChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
        </div>
        <h3 class="mb-4 mt-5">Derived Metrics</h3>
        <div class="row">
          <!-- cases (increase), hospitalizations (current), deaths (increases) -->
          <div id="positivity-rate" class="col-12 col-lg-6 chart-card">
            <b-card title="Test Positivity Rate">
              <p class="lead">The ratio of new positive tests to the total number of new tests.</p>
              <LineChart
                v-if="loaded"
                :chart-data="positivityRateChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
          <div id="deaths-trailing-cases" class="col-12 col-lg-6 chart-card">
            <b-card title="Daily Case Fatality Ratio">
              <p class="lead">The ratio of deaths to new cases, trailing 3 weeks.</p>
              <ScatterChart
                v-if="loaded"
                :chart-data="deathsTrailingCasesChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
          <div id="deaths-trailing-hospitaliztions" class="col-12 col-lg-6 chart-card">
            <b-card title="Hospitalization Case Fatality Ratio">
              <p class="lead">The ratio of deaths to current hospitalizations, trailing 1 week.</p>
              <ScatterChart
                v-if="loaded"
                :chart-data="deathsTrailingHospitalizationsChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
        </div>
      </div>
    </div>
    <div class="row p-4 mt-5 bt-1">
      <div class="col d-flex flex-column flex-lg-row justify-content-end">
        <p class="mr-2" >Data from <a href="https://covidtracking.com">CovidTracking</a> •</p>
        <p class="mr-2">Charts & Data Calculations by Daniel Bier •</p>
        <p class="mr-2">Code by Ellie Bartling •</p>
        <p class="mr-2"><a target="_blank" href="https://ellenbartling.typeform.com/to/rr9szvwB">Request a Chart</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import LineChart from './components/charts/Line'
import ScatterChart from './components/charts/ScatterChart'
import Sidebar from './components/Sidebar'
import StateSelect from './components/StateSelect'
import map from 'lodash/map'
import replace from 'lodash/replace'
import { mapState, mapGetters } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import tinycolor from 'tinycolor2'

export default {
  name: 'App',
  components: {
    LineChart,
    ScatterChart,
    Sidebar,
    StateSelect
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
        { text: 'Since March', value: 1 },
        { text: 'Since April', value: 2 },
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
    deathsTrailingHospitalizationsChartData() {
      const data = this.$store.getters.hospitalFatalityRate['hospFatalityRatio'] || 0
      let chartData = [{
        data: data,
        label: "Deaths:New Hospitalizations 1 Week Ago",
        type: 'line',
        borderColor: tinycolor("#00629a").lighten(15).toHexString(),
        showLine: false,
        backgroundColor: "transparent",
        borderWidth: 0
      }, {
        data: this.$store.getters.hospitalFatalityRate['rollingAvgData'],
        label: `Rolling ${this.rollingAverage}-day Average`,
        type: 'line',
        spanGaps: false,
        pointRadius: 0,
        borderColor: "#00629a",
        backgroundColor: 'transparent'
      }]

      return {
        labels: map(this.filteredDates, (d) => { return d.formatted }),
        datasets: chartData.reverse()
      }
    },
    deathsTrailingCasesChartData() {
      const threeWeeksAgo = this.$store.getters.deathsTrailingCasesData['caseFatalityRatio'] || 0
      let chartData = [{
        data: threeWeeksAgo,
        label: "Deaths: New Cases 3 Weeks Ago",
        type: 'line',
        borderColor: tinycolor("#12a592").lighten(15).toHexString(),
        showLine: false,
        backgroundColor: "transparent",
        borderWidth: 0
      }, {
        data: this.$store.getters.deathsTrailingCasesData['rollingAvgData'],
        label: `Rolling ${this.rollingAverage}-day Average`,
        type: 'line',
        spanGaps: false,
        pointRadius: 0,
        borderColor: "#12a592",
        backgroundColor: 'transparent'
      }]

      return {
        labels: map(this.filteredDates, (d) => { return d.formatted }),
        datasets: chartData.reverse()
      }
    },
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
    this.$store.dispatch('getStateData', 'ca')
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}


#left-sidebar .sticky-top {
  top: 142px;
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
  line-height: 1.2;
  font-size: 1rem;
}

label {
  font-weight: 800;
}

h4 + .lead {
  margin-top: -0.2rem;
}

#filters {
  overflow-x: scroll;
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  justify-content: start;
  align-items: start;
  z-index: 5000;
  /* width: 100%; */
}

#filter-wrapper {
  z-index: 5000;
}

.btn-group .btn {
  white-space: nowrap;
}

.b-form-btn-label-control.form-control > label {
  white-space: nowrap !important;
}
</style>
