<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <div id="left-sidebar" class="col-2 mt-n5">
        <div class="sticky-top pt-5">
          <strong>Jump to:</strong>
          <ul class="nav side-nav">
            <li class="nav-item">Positivity Rate</li>
            <li class="nav-item">Hospitalizations</li>
            <li class="nav-item">Daily Deaths</li>
          </ul>
        </div>
      </div>
      <div id="main" class="col-9">
        <h1>Covid Charts</h1>
        <p>A website for some interactive charts, based on the CovidTracking website's API.</p>

        <div id="filters" class="d-flex flex-start">
          <b-form-group label="Rolling average:" class="mb-5 mt-1">
             <b-form-radio-group
               id="btn-radios-1"
               v-model="rollingAverage"
               :options="rollingAverageOptions"
               buttons
               button-variant="outline-dark"
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

        <div id="positivity-rate" class="chart-card">
          <b-card title="Test Positivity Rate">
            <LineChart
              v-if="loaded"
              :chart-data="positivityRateChartData"
              :chart-dates="filteredDates"
            />
          </b-card>
        </div>
        <!-- cases (increase), hospitalizations (current), deaths (increases) -->
        <div id="hospitalizations" class="chart-card">
          <b-card title="Hospitalizations">
            <LineChart
              v-if="loaded"
              :chart-data="hospitalizedCurrentlyChartData"
              :chart-dates="filteredDates"
            />
          </b-card>
        </div>
        <div id="deaths" class="chart-card">
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
</template>

<script>
import LineChart from './components/charts/Line'
import map from 'lodash/map'
import { mapState, mapGetters } from 'vuex'
import { mapFields } from 'vuex-map-fields'

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
      let chartData = [{
        data: this.$store.getters.dailyDeathsData,
        label: "Daily Deaths",
        borderColor: "#FF6B6B",
        pointRadius: 0,
        backgroundColor: "transparent"
      }]

      if (this.rollingAverage > 0) {
        chartData.push({
          data: this.$store.getters.dailyDeathsRAData,
          label: `Daily Deaths ${this.rollingAverage}-day Average`,
          borderColor: "#ced4da",
          pointRadius: 0,
          backgroundColor: "transparent"
        })
      }

      return {
        labels: map(this.filteredDates, (d) => { return d.formatted }),
        datasets: chartData
      }
    },
    positivityRateChartData() {
      let chartData = [{
        data: this.$store.getters.positivityRateData,
        label: "Test Positivity Rate",
        borderColor: "#FF6B6B",
        pointRadius: 0,
        backgroundColor: "transparent"
      }]

      if (this.rollingAverage > 0) {
        chartData.push({
          data: this.$store.getters.positivityRateRAData,
          label: `Test Positivity ${this.rollingAverage}-day Average`,
          borderColor: "#ced4da",
          pointRadius: 0,
          backgroundColor: "transparent"
        })
      }

      return {
        labels: map(this.filteredDates, (d) => { return d.formatted }),
        datasets: chartData
      }
    },
    hospitalizedCurrentlyChartData() {
      let chartData = [{
        data: this.hospitalizedCurrentlyData,
        label: "Daily Hospitalized",
        borderColor: "#FF6B6B",
        pointRadius: 0,
        backgroundColor: "transparent"
      }]

      if (this.rollingAverage > 0) {
        chartData.push({
          data: this.hospitalizedCurrentlyRAData,
          label: `Test Positivity ${this.rollingAverage}-day Average`,
          borderColor: "#ced4da",
          pointRadius: 0,
          backgroundColor: "transparent"
        })
      }

      return {
        labels: map(this.filteredDates, (d) => { return d.formatted }),
        datasets: chartData
      }
    },
    // positivityRateData () {
    //   const data = map(this.dailyFilteredByDateRange, (day) => {
    //     return (day.positiveIncrease / day.totalTestResultsIncrease) * 100
    //   })
    //
    //   let chartData = [{
    //     data,
    //     label: "Test Positivity Rate",
    //     borderColor: "#FF6B6B",
    //     pointRadius: 0,
    //     backgroundColor: "transparent"
    //   }]
    //
    //   if (this.rollingAverage > 0) {
    //     const rollingAvgData = map(this.dailyFilteredByDateRange, (day) => {
    //       // Find the index of current day in the unfiltered range
    //       const index = findIndex(this.daily, day)
    //       const values = map(this.daily.slice(index - this.rollingAverage, index), (day) => {
    //         return (day.positiveIncrease / day.totalTestResultsIncrease) * 100
    //       })
    //       return this.rollingAvg(values)
    //     })
    //
    //     chartData.push({
    //       data: rollingAvgData,
    //       label: `Test Positivity ${this.rollingAverage}-day Average`,
    //       borderColor: "#ced4da",
    //       pointRadius: 0,
    //       backgroundColor: "transparent"
    //     })
    //   }
    //
    //   return {
    //     labels: map(this.filteredDates, (d) => { return d.formatted }),
    //     datasets: chartData
    //   }
    // },
    // dailyCasesData() {
    //   const data = map(this.dailyFilteredByDateRange, (day) => {
    //     return (day.positiveIncrease / day.totalTestResultsIncrease) * 100
    //   })
    //
    //   let chartData = [{
    //     data,
    //     label: "Test Positivity Rate",
    //     borderColor: "#FF6B6B",
    //     pointRadius: 0,
    //     backgroundColor: "transparent"
    //   }]
    //
    //   if (this.rollingAverage > 0) {
    //     const rollingAvgData = map(this.dailyFilteredByDateRange, (day) => {
    //       // Find the index of current day in the unfiltered range
    //       const index = findIndex(this.daily, day)
    //       const values = map(this.daily.slice(index - this.rollingAverage, index), (day) => {
    //         return (day.positiveIncrease / day.totalTestResultsIncrease) * 100
    //       })
    //       return this.rollingAvg(values)
    //     })
    //
    //     chartData.push({
    //       data: rollingAvgData,
    //       label: `Test Positivity ${this.rollingAverage}-day Average`,
    //       borderColor: "#ced4da",
    //       pointRadius: 0,
    //       backgroundColor: "transparent"
    //     })
    //   }
    //
    //   return {
    //     labels: map(this.filteredDates, (d) => { return d.formatted }),
    //     datasets: chartData
    //   }
    // },
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
  margin: 30px;
  margin-top: 60px;
}

.side-nav {
  display: flex;
  flex-direction: column;
}

.chart-card {
  max-width: 90%;
  margin-bottom: 40px;
  /* height: 300px; */
  /* max-height: 200px; */
}
</style>
