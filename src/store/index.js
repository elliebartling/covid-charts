import Vue from 'vue'
import Vuex from 'vuex'

import flatten from 'lodash/flatten'
import map from 'lodash/map'
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'
import moment from 'moment'
import axios from 'axios'

import { getField, updateField } from 'vuex-map-fields'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    dateRange: {
      start: '20200824',
      end: '20201122'
    },
    data: null,
    filteredData: null,
    dates: null,
    filteredDates: null,
    rollingAverage: 7,
    loaded: false
  },
  getters: {
    getField,
    positivityRateData: state => {
      return map(state.filteredData, (day) => {
        return (day.positiveIncrease / day.totalTestResultsIncrease) * 100
      })
    },
    positivityRateRAData: state => {
      if (state.rollingAverage == 0) return null

      return map(state.filteredData, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(state.data, day)
        const values = map(state.data.slice(index - state.rollingAverage, index), (day) => {
          return (day.positiveIncrease / day.totalTestResultsIncrease) * 100
        })
        return rollingAvg(values)
      })
    },
    hospitalizedCurrentlyData: state => {
      return map(state.filteredData, (day) => {
        return day.hospitalizedCurrently
      })
    },
    hospitalizedCurrentlyRAData: state => {
      if (state.rollingAverage == 0) return null

      return map(state.filteredData, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(state.data, day)
        const values = map(state.data.slice(index - state.rollingAverage, index), (day) => {
          return day.hospitalizedCurrently
        })
        return rollingAvg(values)
      })
    },
    dailyDeathsData: state => {
      return map(state.filteredData, (day) => {
        return day.deathIncrease
      })
    },
    dailyDeathsRAData: state => {
      if (state.rollingAverage == 0) return null

      return map(state.filteredData, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(state.data, day)
        const values = map(state.data.slice(index - state.rollingAverage, index), (day) => {
          return day.deathIncrease
        })
        return rollingAvg(values)
      })
    }
  },
  mutations: {
    updateField,
    setLoaded (state) {
      state.loaded = true
    },
    setRollingAverage(state, num) {
      state.rollingAverage = num
    },
    addDates (state, array) {
      state.dates = array.reverse()
    },
    addHistoricalData (state, data) {
      state.data = data.reverse()
    },
    filterByDateRange (state) {
      const filtered = filter(state.data, (day) => {
        const { start, end } = state.dateRange
        return start <= day.date && day.date <= end
      })

      state.filteredData = filtered
    },
    filterDatesByDateRange (state) {
      const filtered = filter(state.dates, (day) => {
        const { start, end } = state.dateRange
        return start <= day.raw && day.raw <= end
      })

      state.filteredDates = filtered
    }
  },
  actions: {
    async setInitialData({ commit }) {
      // Get the data from covidtracking
      const data = await axios.get('us/daily.json')
        .then((response) => {
          return flatten(response.data)
        })

      // Format dates
      const dates = map(data, (day) => {
        return {
          formatted: moment(day.date, "YYYYMMDD").format("MM/DD"),
          raw: day.date
        }
      })

      commit('addDates', dates)
      commit('addHistoricalData', data)
      commit('filterByDateRange')
      commit('filterDatesByDateRange')
      commit('setLoaded')

      console.log(data)
    }
  }
})

function rollingAvg(arr) {
  const length = arr.length
  let sum = 0
  for (let i=0; i < length; i++) {
    sum += arr[i]
  }

  return sum / length
}
