import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import { store } from './store'
import './assets/styles/app.scss'
import axios from 'axios'

axios.defaults.baseURL = 'https://api.covidtracking.com/v1'


Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)


new Vue({
  render: h => h(App),
  store: store
}).$mount('#app')
