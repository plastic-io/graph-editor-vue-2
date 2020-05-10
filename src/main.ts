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
import LocalStoreDataProvider from "./store/modules/LocalStoreDataProvider";
import WSSDataProvider from "./store/modules/WSSDataProvider";
import HTTPDataProvider from "./store/modules/HTTPDataProvider";
const graphHTTPServer = process.env.VUE_APP_GRAPH_HTTP_SERVER;
const graphWSSServer = process.env.VUE_APP_GRAPH_WSS_SERVER;
Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(PortalVue);
const store = new Vuex.Store(storeConfig());
const localStoreDataProvider = new LocalStoreDataProvider();
if (graphWSSServer && graphHTTPServer) {
    const wssDataProvider = new WSSDataProvider(graphWSSServer, () => {
        return;
    }, () => {
        store.dispatch("setConnectionState", {
            state: "open",
        });
    }, 
    () => {
        store.dispatch("setConnectionState", {
            state: "closed",
        });
    });
    const httpDataProvider = new HTTPDataProvider(graphHTTPServer);
    store.dispatch("setDataProviders", {
        publish: httpDataProvider,
        notification: wssDataProvider,
        graph: wssDataProvider,
        preferences: localStoreDataProvider,
    });
} else {
    store.dispatch("setDataProviders", {
        publish: localStoreDataProvider,
        notification: localStoreDataProvider,
        graph: localStoreDataProvider,
        preferences: localStoreDataProvider,
    });
}
store.dispatch("getPreferences");
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
