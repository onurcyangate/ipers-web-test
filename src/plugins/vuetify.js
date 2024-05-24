/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
// import DateFnsAdapter from '@date-io/date-fns'
// import trTR from 'date-fns/locale/tr-TR'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  //
  // date: {
  //   adapter: DateFnsAdapter,
  //   locale: {
  //     tr: trTR,
  //   },
  // },
})
