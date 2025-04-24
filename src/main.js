import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: '#45546e', // Button color
                    'on-primary': '#ffffff', // Text color on primary
                    'on-surface': '#1e1e1e', // Text color
                    background: '#f5f5f5', // Background color for container
                }
            }
        }
    }
})

createApp(App).use(vuetify).mount('#app')