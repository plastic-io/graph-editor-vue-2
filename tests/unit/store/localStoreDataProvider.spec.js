import provider from "@/store/modules/localStoreDataProvider";
// NOTE: This was VERY complex for some reason.  Jest + Async = hard.
// Could not use beforeEach, caused problems with shared localStorage
describe("Local storage data provider tests", () => {
    let returns;
    let localStorage;
    beforeAll((done) => {
        returns = {
            getItem: undefined,
        };
        localStorage = {
            setItem: jest.fn(),
            removeItem: jest.fn(),
            getItem: () => {
                return returns.getItem;
            },
        };
        Object.defineProperty(window, "localStorage", {
            value: localStorage,
        });
        done();
    });
    // this test must come first, I don't know why
    it("Should delete items then update the TOC.", async (done) => {
        returns.getItem = JSON.stringify({"1234": "foo"});
        provider.delete("1234").then(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith("toc.json", "{}");
            expect(localStorage.removeItem).toHaveBeenCalledWith("1234");
            done();
        });
    });
    it("Should get a resource, parse it, and return it if it exists.", (done) => {
        returns.getItem = JSON.stringify({id: "123", version: 0});
        provider.get("item").then((i) => {
            expect(i).toEqual({"id": "123", "version": 0});
            done();
        });
    });
    it("Should kick out an error if a resource does not exist.", (done) => {
        returns.getItem = undefined;
        provider.get("item").catch((err) => {
            expect(err.toString()).toMatch(/Resource not found/);
            done();
        });
    });
    it("Should kick out an error if a resource cannot be parsed.", (done) => {
        returns.getItem = "notjson";
        provider.get("item").catch((err) => {
            expect(err.toString()).toMatch(/Cannot parse resource/);
            done();
        });
    });
    it("Should delete items then update the TOC, but if TOC is missing kick out an error.", (done) => {
        returns.getItem = undefined;
        provider.delete("1234").catch((err) => {
            expect(err.toString()).toMatch(/Cannot find TOC/);
            done();
        });
    });
    it("Should delete items then update the TOC, but if TOC is not JSON kick out an error.", (done) => {
        returns.getItem = "notjson";
        provider.delete("1234").catch((err) => {
            expect(err.toString()).toMatch(/Cannot parse toc/);
            done();
        });
    });
    it("Should set preferences", (done) => {
        const setvalue = {};
        localStorage.setItem = (key, value) => {
            setvalue.value = {key, value};
        };
        provider.set("preferences", {
            preferences: {foo: "bar"},
        }).then(() => {
            expect(setvalue.value).toEqual({"key": "preferences", "value": "{\"foo\":\"bar\"}"});
            done();
        });
    });
    it("Should set a vector artifact", (done) => {
        const setvalue = {};
        returns.getItem = "{}";
        localStorage.setItem = (key, value) => {
            setvalue.value = {key, value};
        };
        provider.set("vector", {
            vector: {
                id: "1234",
                properties: {
                    description: "Some Vector",
                    icon: "mdi-not-an-icon",
                    name: "Fakey Vector",
                },
                version: 0,
            },
        }).then(() => {
            expect(JSON.stringify(setvalue.value)).toMatch(/publishedVector/);
            done();
        });
    });
    it("Should set a graph artifact", (done) => {
        const setvalue = {};
        returns.getItem = "{}";
        localStorage.setItem = (key, value) => {
            setvalue.value = {key, value};
        };
        provider.set("graph", {
            graph: {
                id: "1234",
                properties: {
                    description: "Some Graph",
                    icon: "mdi-not-an-icon",
                    name: "Fakey Graph",
                },
                version: 0,
            },
        }).then(() => {
            expect(JSON.stringify(setvalue.value)).toMatch(/publishedGraph/);
            done();
        });
    });
    it("Should set graph changes, project graph, then save graph state as well as events: new events.", (done) => {
        const setvalue = {};
        returns.getItem = "";
        localStorage.setItem = (key, value) => {
            setvalue.value = {key, value};
        };
        // TODO: Stub jshashes
        // to recalculate this CRC, just watch the error message.
        provider.set("graph", {
            crc: 3534553175,
            changes: [
                {kind: "N", path: ["version"], rhs: 0},
                {kind: "N", path: ["properties"], rhs: {description: "foo", icon: "bar", name: "baz"}},
            ],
        }).then(() => {
            expect(JSON.stringify(setvalue.value)).toMatch(/toc.json/);
            expect(JSON.stringify(setvalue.value)).toMatch(/\\"description\\":\\"foo\\"/);
            done();
        });
    });
    it("Should set graph changes, project graph, then save graph state as well as events: existing events.", (done) => {
        const setItems = [];
        returns.getItem = JSON.stringify([{
            time: 0,
            changes: [{kind: "N", path: ["version"], rhs: 0}],
        }]);
        localStorage.setItem = (key, value) => {
            setItems.push({key, value});
        };
        provider.set("graph", {
            crc: 3534553175,
            changes: [
                {kind: "N", path: ["properties"], rhs: {description: "foo", icon: "bar", name: "baz"}},
            ],
        }).then(() => {
            expect(JSON.stringify(setItems[0])).toMatch(/\\"description\\":\\"foo\\"/);
            done();
        });
    });
    it("Should throw an error if set is called with an unrecognized type (by top level key check).", (done) => {
        provider.set("graph", {
            foo: {},
        }).catch((err) => {
            expect(err.toString()).toMatch(/Set called without a recognized type/);
            done();
        });
    });
    it("Should subscribe to the document, toc, and preferences and emit changes when the store changes", (done) => {
        ["mydocument", "toc.json", "preferences"].forEach((key) => {
            let watcher;
            let asyncDidRun = false;
            returns.getItem = JSON.stringify([1]);
            window.addEventListener = (eventName, fn) => {
                watcher = fn;
            };
            provider.subscribe(key, (e) => {
                asyncDidRun = true;
                expect(e).toBeTruthy();
            });
            returns.getItem = JSON.stringify([1, 2]);
            watcher();
            returns.getItem = JSON.stringify([1, 2, 3]);
            watcher();
            setTimeout(() => {
                expect(asyncDidRun).toEqual(true);
                done();
            }, 10);
        });
    });
});