import mutations, {applyGraphChanges} from "@/store/mutations.ts";
let state;
beforeEach(() => {
    state = {
        historyPosition: 0,
        graph: {},
        events: [],
    };
});

it("should change foo state to john", () => {
    state.graphSnapshot = {foo: "bar"};
    applyGraphChanges(state);
    expect(state.graph).toEqual({foo: "bar"});
});
