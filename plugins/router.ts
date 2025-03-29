import { useAuthStore } from '~/stores/auth';
import {process} from "std-env";

export default defineNuxtPlugin(() => {
    const router = useRouter();

    // На сервере используем более простую проверку, не требующую доступа к localStorage
    const isServer = process.server;

    router.beforeEach((to, from) => {
        if (to.meta.requiresAuth) {
            if (isServer) {
                return;
            }
            const authStore = useAuthStore();
            authStore.checkAuth();

            if (!authStore.isAuthenticated) {
                return '/';
            }
        }
    });
});