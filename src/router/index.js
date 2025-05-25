import { createRouter, createWebHistory } from 'vue-router' 
import PieChart from '@/components/PieChart.vue'
import CategoryDetail from '@/components/CategoryDetail.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'PieChart',
            component: PieChart
        },
        {
            path: '/Category/:categoryName',
            name: 'Category',
            component: CategoryDetail,
            props: true
        }
    ]
}) 

export default router
