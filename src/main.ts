import Vue from "vue";
// Plugins
import vuetify from "./plugins/vuetify";
import Preferences from "./plugins/Preferences";
import Auth0Provider from "./plugins/Auth0Provider";
import AwsProvider from "./plugins/AwsProvider";
import MochaTestProvider from "./plugins/MochaTestProvider";
// Core libs
import storeConfig from "./store";
import App from "./App.vue";
import GraphEditor from "./components/GraphEditor.vue";
import ErrorPage from "./components/ErrorPage.vue";
import GraphManager from "./components/GraphManager.vue";
import ProviderSettings from "./components/ProviderSettings.vue";
import GraphVector from "./components/GraphVector.vue";
import VueRouter from "vue-router";
import {sync} from "vuex-router-sync";
import Vuex from "vuex";
import "@babel/polyfill";
import PortalVue from "portal-vue";
import {diff, applyChange} from "deep-diff";
let saveDiffDebounceTimer: any;
Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(PortalVue);
Vue.component("graph-vector", GraphVector);
const store = new Vuex.Store(storeConfig()) as any;
// ------------ ADD PLUGINS BETWEEN THESE LINES ---------------
// Preferences must be loaded first
Vue.use(Preferences(store));
// next auth
Vue.use(Auth0Provider(store));
// next data/event provider
Vue.use(AwsProvider(store));
// next any addtional plugins
Vue.use(MochaTestProvider(store));
// ------------------------------------------------------------
store.watch((state: any) => state.historyPosition, () => {
    store.dispatch("save");
});
store.watch((state: any) => state.preferences, (e: any) => {
    if (e) {
        store.dispatch("preferences", e);
    }
}, {
    deep: true,
});
store.watch((state: any) => state.identity, (identity: any) => {
    if (identity.user) {
        store.dispatch("getToc");
        store.dispatch("subscribeToc");
        store.dispatch("subscribePreferences");
    } else if (identity === false) {
        localStorage.setItem("redirectAfterLogin", window.location.href.toString());
        store.dispatch("login");
    }
});
store.watch((state: any) => state.graphSnapshot, () => {
    clearTimeout(saveDiffDebounceTimer);
    saveDiffDebounceTimer = setTimeout(() => {
        if (!store.state.graphSnapshot || !store.state.graph) {
            return;
        }
        const changes = diff(store.state.graph.properties, store.state.graphSnapshot.properties);
        if (changes || store.state.graph.url !== store.state.graphSnapshot.url) {
            store.state.graph.url = store.state.graphSnapshot.url;
            if (changes) {
                changes.forEach((change: any) => {
                    applyChange(store.state.graph.properties, true, change);
                });
            }
            store.dispatch("save");
        }
    }, 250);
}, {
    deep: true,
});
store.watch((state: any) => state.graph, () => {
    store.commit("updateBoundingRect");
}, {
    deep: true,
});
const router = new VueRouter({
    mode: "history",
    routes: [
        {
            path: "/graph-editor/auth-callback",
            redirect: () => {
                const rdr = localStorage.getItem("redirectAfterLogin")
                    || "/graph-editor/graphs";
                return rdr.replace(window.location.origin, "");
            },
        },
        {
            path: "/graph-editor/",
            redirect: "/graph-editor/graphs",
        },
        {
            path: "/graph-editor/provider-settings",
            component: ProviderSettings,
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
        {
            path: "/*",
            component: ErrorPage,
            props: function () {
                return { error: {
                    statusCode: 404
                } };
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
