import {applyChange} from "deep-diff";
import LocalStoreDataProvider from "../LocalStoreDataProvider";
import WSSDataProvider from "./WssDataProvider";
import HTTPDataProvider from "./HTTPDataProvider";
import AwsGraphProperties from "./AwsGraphProperties.vue";
export default function (context: any) {
    return {
        install() {
            context.commit("addPlugin", {
                type: "graphProperties",
                icon: "mdi-aws",
                component: AwsGraphProperties,
            });
            const store = {
                actions: {
                    async deploy(context: any, args: any) {
                        await context.rootState.dataProviders.publish.deploy(args);
                    },
                },
            };
            context.registerModule("aws-provider", store);
            const localStoreDataProvider = new LocalStoreDataProvider();
            if (context.state.preferences.useLocalStorage) {
                context.dispatch("setDataProviders", {
                    artifact: localStoreDataProvider,
                    toc: localStoreDataProvider,
                    publish: localStoreDataProvider,
                    notification: localStoreDataProvider,
                    graph: localStoreDataProvider,
                    preferences: localStoreDataProvider,
                });
                context.commit("setIdentity", {
                    provider: "local",
                    token: "",
                    user: {
                        userName: context.state.preferences.userName,
                        email: context.state.preferences.email,
                        emailVerified: false,
                        avatar: context.state.preferences.avatar,
                        updated: new Date().toISOString(),
                        sub: "",
                    },
                });
            } else {
                const wsOpen = () => {
                    context.dispatch("setConnectionState", {
                        state: "open",
                    });
                };
                const wsClose = () => {
                    context.dispatch("setConnectionState", {
                        state: "closed",
                    });
                };
                const wsMessage = (e: any) => {
                    context.commit("clearPendingMessage", e);
                    if (context.state.queuedEvent) {
                        context.state.queuedEvent.changes.forEach((change: any) => {
                            applyChange(context.state.graph, true, change);
                        });
                        context.commit("dequeueEvent");
                        context.dispatch("save");
                    }
                    if (context.state.resyncRequired) {
                        context.commit("clearResync");
                        console.warn("Resyncing due to remote state mismatch.", context.pendingEvents);
                        context.dispatch("open", {
                            graphId: context.state.graph.id,
                        });
                    }
                };
                const wssDataProvider = new WSSDataProvider(context.state.preferences.graphWSSServer,
                    context.state.preferences.graphHTTPServer,
                    wsMessage,
                    wsOpen,
                    wsClose);
                const httpDataProvider = new HTTPDataProvider(context.state.preferences.graphHTTPServer);
                context.dispatch("setDataProviders", {
                    artifact: httpDataProvider,
                    toc: httpDataProvider,
                    publish: wssDataProvider,
                    notification: wssDataProvider,
                    graph: wssDataProvider,
                    preferences: localStoreDataProvider,
                });
                wssDataProvider.setToken(context.state.identity.token);
                httpDataProvider.setToken(context.state.identity.token);
            }
        },
    };
}
