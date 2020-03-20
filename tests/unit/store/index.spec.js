import index from "@/store/index";
describe("Main instantiation", () => {
    it("Should exist and should return a state object.", () => {
        expect(index).toBeTruthy();
        const store = index();
        expect(store).toBeTruthy();
    });
    it("Should exist and should return a state object.", () => {
        expect(index().actions).toBeTruthy();
        expect(index().state.vectorMimeType).toBeTruthy();
    });
    it("Should fetch an artifact by URL when calling getArtifactByUrl.", () => {
        const store = index();
        store.state.artifacts.foo = "bar";
        const artifact = store.getters.getArtifactByUrl(store.state)("foo");
        expect(artifact).toEqual("bar");
    });
    it("Should fetch an artifact by URL when calling getArtifactByUrl, but warn in the console if it deos not exist.", () => {
        const store = index();
        global.console.warn = jest.fn();
        const artifact = store.getters.getArtifactByUrl(store.state)("foo");
        expect(artifact).toEqual(undefined);
        expect(global.console.warn).toHaveBeenCalledWith("Cannot find artifact ", "foo");
    });
    it("Should project a an empty loading status by key when calling getLoadingStatus.", () => {
        const store = index();
        store.state.loading = {
            foo: {
                bar: [],
            },
        };
        const s = store.getters.getLoadingStatus(store.state)("foo", "bar");
        expect(s).toEqual({"count": 0, "events": [], "loading": false});
    });
    it("Should project a an empty loading status by key when calling getLoadingStatus.", () => {
        const store = index();
        store.state.loading = {
            foo: {
                bar: [
                    {
                        time: 0,
                        event: "foo",
                        loading: true,
                    },
                    {
                        time: 1,
                        event: "bar",
                        loading: false,
                    },
                ],
            },
        };
        const s = store.getters.getLoadingStatus(store.state)("foo", "bar");
        expect(s.loading).toEqual(false);
        expect(s.events.length).toEqual(2);
    });
    it("Should fetch a vector by id when calling getVectorById.", () => {
        const store = index();
        store.state.graph = {
            vectors: [
                {
                    id: "bar",
                }
            ],
        };
        const v = store.getters.getVectorById(store.state)("bar");
        expect(v).toEqual({id: "bar"});
    });
});
