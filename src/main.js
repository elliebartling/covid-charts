import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import { store } from './store'
import './assets/styles/app.scss'
import axios from 'axios'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueScrollTo from 'vue-scrollto'

library.add(fab)

Vue.component('font-awesome-icon', FontAwesomeIcon)

// You can also pass in the default options
Vue.use(VueScrollTo, {
     container: "body",
     duration: 500,
     easing: "ease",
     offset: -140,
     force: true,
     cancelable: true,
     onStart: function(element) {
       const elementHasId = typeof element.id !== 'undefined'
        if (elementHasId) {
            history.pushState(null, '', `#${element.id}`)
        }
     },
     onDone: false,
     onCancel: false,
     x: false,
     y: true
 })

axios.defaults.baseURL = 'https://api.covidtracking.com/v1'

import Chart from 'chart.js'
console.log(Chart.defaults)

// Set chart defaults
Chart.defaults.global.defaultFontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)


new Vue({
  render: h => h(App),
  store: store
}).$mount('#app')
