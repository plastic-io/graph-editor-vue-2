import Vue from "vue";
import vuetify from "./plugins/vuetify";
import storeConfig from "./store";
import App from "./App.vue";
import GraphEditor from "./components/GraphEditor.vue";
import VueRouter from "vue-router";
import {sync} from "vuex-router-sync";
import Vuex from "vuex";
import "@babel/polyfill";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(Vuex);
const store = new Vuex.Store(storeConfig());
const router = new VueRouter({
    mode: "history",
    routes: [
        {
            path: "/",
            component: GraphEditor,
        },
    ],
});
sync(store, router);
new Vue({
    router,
    vuetify,
    store,
    render: h => h(App)
}).$mount("#app");
