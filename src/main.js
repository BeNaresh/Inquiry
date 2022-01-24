import Vue from 'vue'
import App from './App-Latest.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
export const bus = new Vue({})
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')

