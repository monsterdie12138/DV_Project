import Vue from 'vue'
import Router from 'vue-router'
import StackedBarChart from '@/components/StackedBarChart'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'StackedBarChart',
      component: StackedBarChart
    }
  ]
})
