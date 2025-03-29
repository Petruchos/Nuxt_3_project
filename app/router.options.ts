import type {RouterConfig} from '@nuxt/schema'

export default <RouterConfig> {
    routes: (_routes) => {
        return [
            {
                path: '/',
                component: () => import('~/components/LogIn.vue'),
                name: 'login'
            },
            {
                path: '/account',
                component: () => import('~/components/Account.vue'),
                name: 'account',
                meta: {
                    requiresAuth: true
                }
            }
        ];
    }
}