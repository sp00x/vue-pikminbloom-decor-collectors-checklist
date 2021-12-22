import Vue from 'vue'
import VueRouter from 'vue-router'
import Checklist from '../views/Checklist.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Checklist',
    component: Checklist
  }
]

const router = new VueRouter({
  routes
})

export default router
