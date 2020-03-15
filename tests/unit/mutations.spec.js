import mutations from "@/store/mutations.ts";
let state;
beforeEach(() => {
    state = {
        foo: "bar"
    };
});

it("should change foo state to john", () => {
    mutations.applyGraphChanges(state);
    expect(state).toEqual({
        foo: "john",
    });
});
