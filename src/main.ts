import Vue from "vue";
import vuetify from "./plugins/vuetify";
import storeConfig from "./store";
import App from "./App.vue";
import GraphEditor from "./components/GraphEditor.vue";
import GraphManager from "./components/GraphManager.vue";
import VueRouter from "vue-router";
import {sync} from "vuex-router-sync";
import Vuex from "vuex";
import "@babel/polyfill";
import PortalVue from "portal-vue";
Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(PortalVue);
const store = new Vuex.Store(storeConfig());
store.dispatch("setupDataProvider");
store.watch((state) => state.historyPosition, () => {
    store.dispatch("save");
});
const router = new VueRouter({
    mode: "history",
    routes: [
        {
            path: "/graph-editor/",
            redirect: "/graph-editor/graphs",
        },
        {
            path: "/graph-editor/graphs",
            component: GraphManager,
            props: function (route) {
                return {route};
            },
        },
        {
            path: "/graph-editor/*",
            component: GraphEditor,
            props: function (route) {
                return {route};
            },
        },
    ],
});
sync(store, router);
export default new Vue({
    router,
    vuetify,
    store,
    render: h => h(App)
}).$mount("#app");
