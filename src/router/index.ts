import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/reim-bills',
    },
    {
      path: '/reim-bills',
      name: 'ReimBillList',
      component: () => import('@/views/ReimBillList/index.vue'),
    },
    {
      path: '/reim-bills/create',
      name: 'ReimBillCreate',
      component: () => import('@/views/ReimBillDetail/index.vue'),
    },
    {
      path: '/reim-bills/detail/:id',
      name: 'ReimBillDetail',
      component: () => import('@/views/ReimBillDetail/index.vue'),
    },
  ],
})

export default router
