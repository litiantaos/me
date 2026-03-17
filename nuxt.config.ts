import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: false },

  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
        },
        {
          name: 'description',
          content: `${process.env.NUXT_PUBLIC_NAME}的个人网站，记录想法与生活。`,
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
      ],
    },
    pageTransition: { name: 'move-up', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('highlight.js')) return 'highlight'
            if (id.includes('node_modules/marked')) return 'markdown'
            if (id.includes('@ai-sdk') || id.includes('node_modules/ai/'))
              return 'ai-sdk'
          },
        },
      },
    },
  },

  modules: ['@nuxtjs/supabase', '@vercel/analytics', '@vercel/speed-insights'],

  supabase: {
    types: false,
    redirectOptions: {
      login: '/login',
      callback: '/login',
      include: ['/note/new(/*)?', '/hobby/add(/*)?'],
    },
  },

  runtimeConfig: {
    aiGatewayApiKey: '',
    tavilyApiKey: '',
    tmdbApiKey: '',
    igdbClientId: '',
    igdbClientSecret: '',
    mapboxToken: '',
    noteApiToken: '',

    public: {
      name: '',
      birthDate: '',
      email: '',
      github: '',
      siteUrl: '',
    },
  },
})
