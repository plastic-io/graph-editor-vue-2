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
import localStoreDataProvider from "./store/modules/localStoreDataProvider";
Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(Vuex);
const store = new Vuex.Store(storeConfig());
store.dispatch("setDataProviders", {
    publish: localStoreDataProvider,
    graph: localStoreDataProvider,
    preferences: localStoreDataProvider,
});
store.dispatch("getPreferences");
store.watch((state) => state.historyPosition, () => {
    store.dispatch("save");
});
const router = new VueRouter({
    mode: "history",
    routes: [
        {
            path: "/graphs",
            component: GraphManager,
            props: function (route) {
                return {route};
            },
        },
        {
            path: "/*",
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
