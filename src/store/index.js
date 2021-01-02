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

const today = moment().format('YYYY-MM-DD')
const ninetyDaysAgo = moment().subtract(90, 'days').format('YYYY-MM-DD')

export const store = new Vuex.Store({
  state: {
    dateRange: {
      start: ninetyDaysAgo,
      end: today,
    },
    data: [],
    statesData: {},
    dates: null,
    rollingAverage: 7,
    dateQuickPick: 90,
    loaded: false,
    statesLoaded: false,
    stateMeta: [],
    stateSelected: {
      name: "All",
      item: "US"
    }
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
    hospitalFatalityRate: (state, getters) => {
      const { data, rollingAverage } = state
      const { filteredData } = getters

      // Calculate the CFR of the filtered data by mapping
      // each day of filtered data, and returning that day's
      // deathIncrease divided by the positiveIncrease from 21 days prior
      const hospFatalityRatio = map(filteredData, (day) => {

        // Get the array index for data from 21 days ago
        const index = findIndex(data, day) - 7

        // If we go back in time too far, return null
        if (index < 0) return null

        // Get positiveIncrease from three weeks ago
        const posFromThreeWeeksAgo = data[index] ? data[index].hospitalizedCurrently : null

        // Catch divide-by-0 errors
        if (posFromThreeWeeksAgo > 0) {
          return {
            x: day.date,
            y: round(day.deathIncrease / posFromThreeWeeksAgo * 100, 2)
          }
        }

        return null
      })

      const rollingAvgData = map(hospFatalityRatio, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(hospFatalityRatio, day)

        // Map each day of data into an array of
        const values = map(
          hospFatalityRatio.slice(index - rollingAverage, index), (day) => {
          return day?.y ? day.y : NaN
          // TODO: remove y-values that are 0
        })

        return rollingAvg(values)
      })

      return {
        hospFatalityRatio,
        rollingAvgData
      }
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
      const { data, rollingAverage } = state
      const { filteredData } = getters

      // Calculate the CFR of the filtered data by mapping
      // each day of filtered data, and returning that day's
      // deathIncrease divided by the positiveIncrease from 21 days prior
      const caseFatalityRatio = map(filteredData, (day) => {

        // Get the array index for data from 21 days ago
        const index = findIndex(data, day) - 21

        // If we go back in time too far, return null
        if (index < 0) return null

        // Get positiveIncrease from three weeks ago
        const posFromThreeWeeksAgo = data[index] ? data[index].positiveIncrease : null

        // Catch divide-by-0 errors
        if (posFromThreeWeeksAgo > 0) {
          return {
            x: day.date,
            y: round(day.deathIncrease / posFromThreeWeeksAgo * 100, 2)
          }
        }

        return null
      })

      const rollingAvgData = map(caseFatalityRatio, (day) => {
        // Find the index of current day in the unfiltered range
        const index = findIndex(caseFatalityRatio, day)

        // Map each day of data into an array of
        const values = map(
          caseFatalityRatio.slice(index - rollingAverage, index), (day) => {
          return day?.y ? day.y : NaN
          // TODO: remove y-values that are 0
        })

        return rollingAvg(values)
      })

      return {
        caseFatalityRatio,
        rollingAvgData
      }
    }
  },
  mutations: {
    updateField,
    addStateMeta (state, meta) {
      state.stateMeta = [
        {
          name: "All",
          state: "US"
        },
        ...meta
      ]
    },
    updateDates (state, newDates) {
      state.dateRange.start = newDates.start
      state.dateRange.end = newDates.end
    },
    setLoaded (state) {
      state.loaded = true
    },
    setStatesLoaded (state) {
      state.statesLoaded = true
    },
    setRollingAverage(state, num) {
      state.rollingAverage = num
    },
    addDates (state, array) {
      state.dates = array.reverse()
    },
    addHistoricalData (state, payload) {
      state.data = payload.data
    },
    addStatesData (state, payload) {
      console.log("Adding statesData", payload)
      const { abbr, data, meta } = payload

      state.statesData[abbr] = {
        ...meta,
        data
      }
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
      const usData = await axios.get('us/daily.json')
        .then((response) => {
          return flatten(response.data).reverse()
        })

      const stateMeta = await axios.get('/states/info.json')
        .then((response) => {
          return response.data
        })

      // Format dates
      const dates = map(usData, (day) => {
        return {
          formatted: moment(day.date, "YYYYMMDD").format("MM/DD"),
          raw: day.date
        }
      }).reverse()

      commit('addDates', dates)
      commit('addHistoricalData', { data: usData })
      commit('addStateMeta', stateMeta)
      commit('addStatesData', {
        abbr: "US",
        data: usData
      })
      commit('setLoaded')
    },
    async getStateData({ commit, state }, payload) {
      if (payload.state == undefined) { return }

      let data

      if (state.statesData[payload.state] != undefined) {
        console.log(`${payload.state} already exists!`, payload)
        // Grab it from Vuex if it already exists
        data = state.statesData[payload.state].data
      } else {
        // Otherwise, go get it from api
        data = await axios.get(`states/${payload.state}/daily.json`)
          .then((response) => {
            return flatten(response.data).reverse()
          })

        commit('addStatesData', {
          abbr: payload.state,
          data,
          meta: payload
        })
      }

      commit('addHistoricalData', { data })
      return true
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
      } else if (state.dateQuickPick == 2) { // Since March 1
        newDates.start = moment('April 1, 2020').format("YYYY-MM-DD")
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
