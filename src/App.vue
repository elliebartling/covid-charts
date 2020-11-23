<template>
  <div id="app" class="container-fluid">
    <div class="row bg-dark text-light mb-5">
      <div id="main" class="col-9">
        <h1>Covid Charts</h1>
        <p>A website for some interactive charts, based on the CovidTracking website's API.</p>

        <div id="filters" class="d-flex flex-start">
          <b-form-group label="Rolling average:" class="mb-1 mt-1">
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

          <div class="d-flex ml-4 mt-1">
            <b-form-group class="mr-2" label-for="input-horizontal" label="Start:">
              <b-form-datepicker
                id="start-datepicker"
                v-model="dateRange.start"
              ></b-form-datepicker>
            </b-form-group>
            <b-form-group label-for="input-horizontal" label="End:">
              <b-form-datepicker
                id="end-datepicker"
                v-model="dateRange.end"
              ></b-form-datepicker>
            </b-form-group>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
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
        <div class="row">
          <div id="positivity-rate" class="col-6 chart-card">
            <b-card title="Test Positivity Rate">
              <LineChart
                v-if="loaded"
                :chart-data="positivityRateChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
          <!-- cases (increase), hospitalizations (current), deaths (increases) -->
          <div id="hospitalizations" class="col-6 chart-card">
            <b-card title="Hospitalizations">
              <LineChart
                v-if="loaded"
                :chart-data="hospitalizedCurrentlyChartData"
                :chart-dates="filteredDates"
              />
            </b-card>
          </div>
          <div id="deaths" class="col-6 chart-card">
        <b-card title="Daily Deaths">
          <LineChart
            v-if="loaded"
            :chart-data="dailyDeathsChartData"
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
      // rollingAverage: 7,
      rollingAverageOptions: [
        { text: 'None', value: 0 },
        { text: '5-day', value: 5 },
        { text: '7-day', value: 7 },
        { text: '14-day', value: 14 }
      ]
    }
  },
  methods: {
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
      'dailyFilteredByDateRange',
      'daily',
      'filteredDates',
      'loaded'
    ]),
    ...mapFields([
      'rollingAverage',
      'dateRange'
    ]),
    ...mapGetters([
      'hospitalizedCurrentlyData',
      'hospitalizedCurrentlyRAData',
    ]),
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
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin: 30px; */
}


#left-sidebar .sticky-top {
  top: 280px;
  padding-left: 17px;
}

#main {
  padding: 30px;
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
</style>
