export default defineNuxtConfig({
    css: [
        '@/assets/styles/styles.sass',
    ],

    components: true,

    plugins: [
        '~/plugins/router.ts'
    ],

    // Для работы с локальными JSON файлами
    nitro: {
        publicAssets: [
            {
                dir: 'users.json',
                baseURL: '/'
            },
            {
                dir: 'products.json',
                baseURL: '/'
            }
        ]
    },
    build: {
        transpile: ['md5']
    },
    modules: [
        '@pinia/nuxt',
        '@nuxt/ui',
        'nuxt-icon',
    ],

    compatibilityDate: '2025-03-28',

    devServer: {
        host: '192.168.0.83',
        port: 3000,
    },
    vite: {
        server: {
            fs: {
                strict: false,
                allow: ['..', 'C:/']
            },
            hmr: {
                protocol: 'ws'
            }
        },
        optimizeDeps: {
            include: ['vue']
        }
    },
    experimental: {
        payloadExtraction: false
    }
})