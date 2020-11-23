import Vue from 'vue'
import Vuex from 'vuex'

import flatten from 'lodash/flatten'
import map from 'lodash/map'
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'
import replace from 'lodash/replace'
import round from 'lodash/round'
import moment from 'moment'
import axios from 'axios'

import { getField, updateField } from 'vuex-map-fields'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    dateRange: {
      start: '2020-08-24',
      end: '2020-11-22'
    },
    data: null,
    dates: null,
    rollingAverage: 7,
    dateQuickPick: 90,
    loaded: false
  },
  getters: {
    getField,
    filteredDates: state => {
      const start = replace(state.dateRange.start, /-/g, "")
      const end = replace(state.dateRange.end, /-/g, "")

      return filter(state.dates, (day) => {
        return start <= day.raw && day.raw <= end
      })
    },
    filteredData: state => {
      const start = replace(state.dateRange.start, /-/g, "")
      const end = replace(state.dateRange.end, /-/g, "")

      return filter(state.data, (day) => {
        return start <= day.date && day.date <= end
      })
    },
    dailyNewCasesData: (state, getters) => {
      return map(getters.filteredData, (day) => {
        return day.positiveIncrease
      })
    },
    dailyNewCasesRAData: (state, getters) => {
      if (state.rollingAverage == 0) return null

      return map(getters.filteredData, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(state.data, day)
        const values = map(state.data.slice(index - state.rollingAverage, index), (day) => {
          return day.positiveIncrease
        })
        return rollingAvg(values)
      })
    },
    positivityRateData: (state, getters) => {
      return map(getters.filteredData, (day) => {
        return round((day.positiveIncrease / day.totalTestResultsIncrease) * 100, 2)
      })
    },
    positivityRateRAData: (state, getters) => {
      if (state.rollingAverage == 0) return null

      return map(getters.filteredData, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(state.data, day)
        const values = map(state.data.slice(index - state.rollingAverage, index), (day) => {
          return (day.positiveIncrease / day.totalTestResultsIncrease) * 100
        })
        return rollingAvg(values)
      })
    },
    hospitalizedCurrentlyData: (state, getters) => {
      return map(getters.filteredData, (day) => {
        return day.hospitalizedCurrently
      })
    },
    hospitalizedCurrentlyRAData: (state, getters) => {
      if (state.rollingAverage == 0) return null

      return map(getters.filteredData, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(state.data, day)
        const values = map(state.data.slice(index - state.rollingAverage, index), (day) => {
          return day.hospitalizedCurrently
        })
        return rollingAvg(values)
      })
    },
    dailyDeathsData: (state, getters) => {
      return map(getters.filteredData, (day) => {
        return day.deathIncrease
      })
    },
    dailyDeathsRAData: (state, getters) => {
      if (state.rollingAverage == 0) return null

      return map(getters.filteredData, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(state.data, day)
        const values = map(state.data.slice(index - state.rollingAverage, index), (day) => {
          return day.deathIncrease
        })
        return rollingAvg(values)
      })
    },
    deathsTrailingCasesData: (state, getters) => {
      const threeWeeksAgo = map(getters.filteredData, (day) => {
        const index = findIndex(state.data, day) - 21
        const threeWeeksAgoData = state.data[index].positiveIncrease

        if (index > 0 && threeWeeksAgoData > 0) {
          return {
            x: day.date,
            y: round(day.deathIncrease / threeWeeksAgoData * 100, 2)
          }
        }
        return null
      })

      const rollingAvgData = map(threeWeeksAgo, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(threeWeeksAgo, day)
        const values = map(threeWeeksAgo.slice(index - 7, index), (day) => {
          return day?.y ? day.y : NaN
          // TODO: remove y-values that are 0
        })
        return rollingAvg(values)
      })

      return {
        threeWeeksAgo,
        rollingAvgData
      }
    }
  },
  mutations: {
    updateField,
    updateDates (state, newDates) {
      state.dateRange.start = newDates.start
      state.dateRange.end = newDates.end
    },
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
    // filterByDateRange (state) {
    //   const filtered = filter(state.data, (day) => {
    //     // const { start, end } = replace(state.dateRange, "-", "")
    //     const start = replace(state.dateRange.start, /-/g, "")
    //     const end = replace(state.dateRange.end, /-/g, "")
    //     return start <= day.date && day.date <= end
    //   })
    //
    //   state.filteredData = filtered
    // },
    // filterDatesByDateRange (state) {
    //   const filtered = filter(state.dates, (day) => {
    //     // const { start, end } = replace(state.dateRange, "-", "")
    //     const start = replace(state.dateRange.start, /-/g, "")
    //     const end = replace(state.dateRange.end, /-/g, "")
    //     return start <= day.raw && day.raw <= end
    //   })
    //
    //   state.filteredDates = filtered
    // }
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
      // commit('filterByDateRange')
      // commit('filterDatesByDateRange')
      commit('setLoaded')

      console.log(data)
    },
    quickPickDates({ state, commit }) {
      let newDates = {
        start: state.dateRange.start,
        end: state.dateRange.end
      }

      if (state.dateQuickPick > 10) { // i.e., a date calc value
        newDates.start = moment().subtract(state.dateQuickPick, 'days').format("YYYY-MM-DD")
        newDates.end = moment().format("YYYY-MM-DD")
      } else if (state.dateQuickPick == 1) { // Since March 1
        newDates.start = moment('March 1, 2020').format("YYYY-MM-DD")
        newDates.end = moment().format("YYYY-MM-DD")
      }

      commit('updateDates', newDates)
    }
  }
})

function rollingAvg(arr) {
  const length = arr.length
  let sum = 0
  for (let i=0; i < length; i++) {
    sum += arr[i]
  }

  return round(sum / length, 2)
}
