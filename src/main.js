import { createApp } from 'vue';
import App from './App.vue';
const app = createApp(App);
app.config.errorHandler = (err, instance, info) => {
    document.body.innerHTML = `<pre style="color:red;padding:20px;font-size:14px">
Vue Error: ${err}
Info: ${info}
Stack: ${err?.stack ?? ''}
</pre>`;
    console.error('[Vue Error]', err, info);
};
app.mount('#app');
