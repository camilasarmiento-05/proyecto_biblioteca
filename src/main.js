import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog } from 'quasar'
import es from 'quasar/lang/es'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import '@/css/app.css'
import App from '@/App.vue'
import router from '@/router'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(Quasar, {
    plugins: { Notify, Dialog },
    lang: es,
    config: { notify: { position: 'bottom-right', timeout: 3500 } }
  })
  .mount('#app')
