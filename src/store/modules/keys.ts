import {deleteSelected, groupSelected, ungroupSelected,
    undo, redo, duplicateSelection, bringForward, sendBackward,
    bringToFront, sendToBack, zoom, nudgeUp, nudgeDown,
    nudgeLeft, nudgeRight, togglePresentation, togglePanelVisibility} from "../mutations"; // eslint-disable-line
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
// const shiftKeyCode = 16;
// const metaKeyCode = 91;
// const spaceKeyCode = 32;
// const ctrlKeyCode = 17;
// const arrowUpCode = 38;
// const arrowDownCode = 40;
// const arrowLeftCode = 37;
// const arrowRightCode = 39;
interface UIEvent {
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    keyCode: number;
    preventDefault: Function;
}
function keys(state: any, keys: {
        [key: string]: any; // tslint:disable-line
    }, e: UIEvent) {
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;
    // zoom
    // BUG in chrome?: in key interface. - and + do not "keyup" when command is held down
    if (keys[equalKeyCode] && ctrl) {
        e.preventDefault();
        zoom(state, 0.10);
        keys[equalKeyCode] = false;
    }
    if (keys[dashKeyCode] && ctrl) {
        e.preventDefault();
        zoom(state, -0.10);
        keys[dashKeyCode] = false;
    }
    // nudges
    if (keys[arrowUp]) {
        nudgeUp(state, shift ? 50 : 10);
    }
    if (keys[arrowDown]) {
        nudgeDown(state, shift ? 50 : 10);
    }
    if (keys[arrowLeft]) {
        nudgeLeft(state, shift ? 50 : 10);
    }
    if (keys[arrowRight]) {
        nudgeRight(state, shift ? 50 : 10);
    }
    // move z
    if (keys[closeBraceKeyCode] && ctrl && shift) {
        bringToFront(state);
    } else if (keys[closeBraceKeyCode] && ctrl) {
        bringForward(state);
    }
    if (keys[openBraceKeyCode] && ctrl && shift) {
        sendToBack(state);
    } else if (keys[openBraceKeyCode] && ctrl) {
        sendBackward(state);
    }
    // delete
    if (keys[deleteKey]) {
        deleteSelected(state);
    }
    // group ungroup
    if (keys[gKeyCode] && ctrl && shift) {
        ungroupSelected(state);
    } else if (keys[gKeyCode] && ctrl) {
        groupSelected(state);
    }
    // undo / redo
    // BUG in chrome?: in key interface.  Z does not "keyup" when command is held down
    if (keys[zKeyCode] && ctrl && shift) {
        redo(state);
        state.keys[zKeyCode] = false;
    } else if (keys[zKeyCode] && ctrl) {
        undo(state);
        state.keys[zKeyCode] = false;
    }
    // duplicate
    if (keys[dKeyCode] && ctrl && shift) {
        duplicateSelection(state);
    }
    if (keys[graveKeyCode] && alt) {
        togglePresentation(state);
    }
    if (keys[tabKeyCode]) {
        e.preventDefault();
        togglePanelVisibility(state);
    }
}
export function keyup(state: any, e: UIEvent) {
    state.keys[e.keyCode] = false;
    keys(state, state.keys, e);
}
export function keydown(state: any, e: UIEvent) {
    state.keys[e.keyCode] = true;
    keys(state, state.keys, e);
}
