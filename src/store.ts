import acidGraph from "../graphs/acid.json";
export default function () {
    return {
        strict: true,
        state: {
            graph: acidGraph,
            events: [],
        },
        actions: {
            update(context: any, e: object) {
                // add to events

                // set new state
                context.commit("update", e);
            },
        },
        mutations: {
            update(state: any, e: object) {
                state.graph = e;
            }
        },
    };
}
