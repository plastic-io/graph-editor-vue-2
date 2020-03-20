import bezier from "@/components/bezier";
describe("bezier curve drawing tests", () => {
    global.document.getElementById = () => {
        return {
            offsetHeight: 100,
            offsetWidth: 100,
            getBoundingClientRect() {
                return {
                    x: 10,
                    y: 10,
                    height: 100,
                    width: 100,
                    bottom: 110,
                    right: 110,
                };
            },
        };
    };
    it("Should instantiate", () => {
        expect(bezier).toBeTruthy();
    });
    it("Should draw a connector", () => {
        const e = {
            $store: {
                dispatch: jest.fn(),
            },
            view: {
                x: 0,
                y: 0,
                k: 1,
            },
            input: {
                vector: {
                    id: "3234",
                },
                field: {
                    name: "foo",
                },
            },
            output: {
                vector: {
                    id: "3234",
                },
                field: {
                    name: "foo",
                },
            },
            translating: {
                mouse: {
                    x: 0,
                    y: 0,
                },
            },
            mouse: {
                x: 0,
                y: 0,
            },
            ctx: {
                arc: jest.fn(),
                beginPath: jest.fn(),
                fill: jest.fn(),
                closePath: jest.fn(),
                stroke: jest.fn(),
                moveTo: jest.fn(),
                bezierCurveTo: jest.fn(),
                clearRect: jest.fn(),
                translate: jest.fn(),
                setTransform: jest.fn(),
            },
            watchConnectors: [],
            errorConnectors: [],
            selectedConnectors: [],
            hoveredConnector: null,
            vector: {
                id: "2345",
            },
            connector: {
                id: "1234",
            },
            preferences: {
                appearance: {
                    connectors: {
                        strokeStyle: "red",
                        watchStrokeStyle: "red",
                        activityStrokeStyle: "red",
                        errorStrokeStyle: "red",
                        selectedStrokeStyle: "red",
                        hoverStrokeStyle: "red",
                        controlFillStyle: "red",
                    },
                },
            },
        };
        bezier(e);
        expect(e.ctx.bezierCurveTo).toBeCalledWith(210, 15, -190, 15, 10, 15);
    });
});