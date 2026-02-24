import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import dateForm from './plugins/dateForm';
import '@/scss/style.scss';
//import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueTablerIcons from 'vue-tabler-icons';
import Antd from 'ant-design-vue'; 
import 'ant-design-vue/dist/reset.css';
import VueApexCharts from "vue3-apexcharts";


// google-fonts
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';

//Mock Api data


//i18
import { createI18n } from 'vue-i18n';
import messages from '@/utils/locales/messages';

const i18n = createI18n({
  locale: 'en',
  messages: messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true
});



const app = createApp(App);

// 1. Registrar Plugins
app.use(VueApexCharts);
app.use(router);
app.use(PerfectScrollbarPlugin);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(Antd);
app.use(i18n);
app.use(dateForm);
app.use(vuetify); // Registra vuetify pero NO montes todavía

// 2. Registrar Directivas Personalizadas
app.directive('solo-enteros', {
  mounted(el: HTMLElement) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input');
    if (input) {
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        const teclasProhibidas = ['.', ',', 'e', 'E', '+', '-'];
        if (teclasProhibidas.includes(e.key)) {
          e.preventDefault();
        }
      });
    }
  }
});

// 3. MONTAR (Siempre al final)
app.mount('#app');