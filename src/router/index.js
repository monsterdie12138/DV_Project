import Vue from 'vue'
import Router from 'vue-router'
import PieChart from '@/components/PieChart'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'PieChart',
      component: PieChart
    }
  ]
})
