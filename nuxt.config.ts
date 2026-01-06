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
          content: `${process.env.NAME}的个人网站，记录生活与想法。`,
        },
        {
          name: 'robots',
          content: 'index, follow',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'canonical',
          href: process.env.SITE_URL,
        },
      ],
    },
    pageTransition: { name: 'move-up', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['@nuxtjs/supabase'],

  supabase: {
    types: false,
    redirectOptions: {
      login: '/login',
      callback: '/',
      include: ['/note/new(/*)?', '/movie/add(/*)?'],
    },
  },

  runtimeConfig: {
    aiGatewayApiKey: '',
    jinaApiKey: '',
    tmdbApiKey: '',

    public: {
      name: '',
      birthDate: '',
      email: '',
      github: '',
      siteUrl: '',
      tmdbUrl: '',
      mapboxToken: '',
    },
  },
})
