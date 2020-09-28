const deleteKey = 46;
const dKeyCode = 68;
const gKeyCode = 71;
const zKeyCode = 90;
const openBraceKeyCode = 219;
const closeBraceKeyCode = 221;
const arrowUp = 38;
const arrowDown = 40;
const arrowLeft = 37;
const arrowRight = 39;
const dashKeyCode = 189;
const equalKeyCode = 187;
const graveKeyCode = 192;
const tabKeyCode = 9;
const spaceKeyCode = 32;
import {keydown, keyup} from "@/store/keys.ts";
import {deleteSelected, groupSelected, ungroupSelected,
    undo, redo, duplicateSelection, bringForward, sendBackward,
    bringToFront, sendToBack, zoom, nudgeUp, nudgeDown,
    nudgeLeft, nudgeRight, togglePresentation, togglePanelVisibility} from "@/store/mutations"; // eslint-disable-line
jest.mock("@/store/mutations");
describe("Key mutations", () => {
    let state;
    let e;
    beforeEach(() => {
        e = {
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            preventDefault: jest.fn(),
            keyCode: spaceKeyCode,
        };
        state = {
            keys: {},
        };
    });
    it("Should register a key down and up event", () => {
        keydown(state, e);
        expect(state.keys[spaceKeyCode]).toEqual(true);
        keyup(state, e);
        expect(state.keys[spaceKeyCode]).toEqual(false);
    });
    it("Should zoom in when ctrl equalKeyCode is pressed", () => {
        e.keyCode = equalKeyCode;
        e.ctrlKey = true;
        keydown(state, e);
        expect(zoom).toHaveBeenCalledWith(state, 0.10);
    });
    it("Should zoom out when ctrl dashKeyCode is pressed", () => {
        e.keyCode = dashKeyCode;
        e.ctrlKey = true;
        keydown(state, e);
        expect(zoom).toHaveBeenCalledWith(state, -0.10);
    });
    it("Should nudge up 10 when arrowUp is pressed", () => {
        e.keyCode = arrowUp;
        keydown(state, e);
        expect(nudgeUp).toHaveBeenCalledWith(state, 10);
    });
    it("Should nudge up 50 when shift arrowUp is pressed", () => {
        e.keyCode = arrowUp;
        e.shiftKey = true;
        keydown(state, e);
        expect(nudgeUp).toHaveBeenCalledWith(state, 50);
    });
    it("Should nudge down 10 when arrowDown is pressed", () => {
        e.keyCode = arrowDown;
        keydown(state, e);
        expect(nudgeDown).toHaveBeenCalledWith(state, 10);
    });
    it("Should nudge down 50 when shift arrowDown is pressed", () => {
        e.keyCode = arrowDown;
        e.shiftKey = true;
        keydown(state, e);
        expect(nudgeDown).toHaveBeenCalledWith(state, 50);
    });
    it("Should nudge left 10 when arrowLeft is pressed", () => {
        e.keyCode = arrowLeft;
        keydown(state, e);
        expect(nudgeLeft).toHaveBeenCalledWith(state, 10);
    });
    it("Should nudge left 50 when shift arrowLeft is pressed", () => {
        e.keyCode = arrowLeft;
        e.shiftKey = true;
        keydown(state, e);
        expect(nudgeLeft).toHaveBeenCalledWith(state, 50);
    });
    it("Should nudge right 10 when arrowRight is pressed", () => {
        e.keyCode = arrowRight;
        keydown(state, e);
        expect(nudgeRight).toHaveBeenCalledWith(state, 10);
    });
    it("Should nudge right 50 when shift arrowRight is pressed", () => {
        e.keyCode = arrowRight;
        e.shiftKey = true;
        keydown(state, e);
        expect(nudgeRight).toHaveBeenCalledWith(state, 50);
    });
    it("Should bringToFront when closeBraceKeyCode and ctrl and shift are pressed", () => {
        e.keyCode = closeBraceKeyCode;
        e.shiftKey = true;
        e.ctrlKey = true;
        keydown(state, e);
        expect(bringToFront).toHaveBeenCalled();
    });
    it("Should bringToFront when openBraceKeyCode and ctrl and shift are pressed", () => {
        e.keyCode = openBraceKeyCode;
        e.shiftKey = true;
        e.ctrlKey = true;
        keydown(state, e);
        expect(sendToBack).toHaveBeenCalled();
    });
    it("Should bringForward when closeBraceKeyCode and ctrl are pressed", () => {
        e.keyCode = closeBraceKeyCode;
        e.ctrlKey = true;
        keydown(state, e);
        expect(bringForward).toHaveBeenCalled();
    });
    it("Should sendBackward when openBraceKeyCode and ctrl are pressed", () => {
        e.keyCode = openBraceKeyCode;
        e.ctrlKey = true;
        keydown(state, e);
        expect(sendBackward).toHaveBeenCalled();
    });
    it("Should delete when delete is pressed", () => {
        e.keyCode = deleteKey;
        keydown(state, e);
        expect(deleteSelected).toHaveBeenCalled();
    });
    it("Should ungroup selected when ctrl shift + G is pressed", () => {
        e.keyCode = gKeyCode;
        e.shiftKey = true;
        e.ctrlKey = true;
        keydown(state, e);
        expect(ungroupSelected).toHaveBeenCalled();
    });
    it("Should group selected when ctrl G is pressed", () => {
        e.keyCode = gKeyCode;
        e.ctrlKey = true;
        keydown(state, e);
        expect(groupSelected).toHaveBeenCalled();
    });
    it("Should redo selected when ctrl shift Z is pressed", () => {
        e.keyCode = zKeyCode;
        e.ctrlKey = true;
        e.shiftKey = true;
        keydown(state, e);
        expect(redo).toHaveBeenCalled();
    });
    it("Should undo selected when ctrl Z is pressed", () => {
        e.keyCode = zKeyCode;
        e.ctrlKey = true;
        keydown(state, e);
        expect(undo).toHaveBeenCalled();
    });
    it("Should duplicate selected when ctrl shift D is pressed", () => {
        e.keyCode = dKeyCode;
        e.ctrlKey = true;
        e.shiftKey = true;
        keydown(state, e);
        expect(duplicateSelection).toHaveBeenCalled();
    });
    it("Should toggle presentation when alt + ` is pressed", () => {
        e.keyCode = graveKeyCode;
        e.altKey = true;
        keydown(state, e);
        expect(togglePresentation).toHaveBeenCalled();
    });
    it("Should toggle presentation when tab is pressed", () => {
        e.keyCode = tabKeyCode;
        keydown(state, e);
        expect(togglePanelVisibility).toHaveBeenCalled();
    });
});