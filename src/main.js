import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import { ValidationProvider, extend } from 'vee-validate'
import { regex, required } from 'vee-validate/dist/rules';
import 'vue-swatches/dist/vue-swatches.css'

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.component('ValidationProvider', ValidationProvider);

extend('required', {
  ...required,
  message: 'This field is required.'
});
extend('regex', {
  ...regex,
  message: 'Invalid input.'
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
