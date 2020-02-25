import {deleteSelected, groupSelected, ungroupSelected, undo, redo, duplicateSelection} from "../mutations"; // eslint-disable-line
const deleteKey = 46;
const dKeyCode = 68;
const gKeyCode = 71;
const zKeyCode = 90;
const shiftKeyCode = 16;
const metaKeyCode = 91;
// const spaceKeyCode = 32;
const ctrlKeyCode = 17;
// const arrowUpCode = 38;
// const arrowDownCode = 40;
// const arrowLeftCode = 37;
// const arrowRightCode = 39;

export default function keys(state: any, keys: {
        [key: string]: any; // tslint:disable-line
    }) {
    const ctrlMeta = state.keys[ctrlKeyCode] || state.keys[metaKeyCode];
    if (keys[deleteKey] && !state.keys[deleteKey]) {
        deleteSelected(state);
    }
    if (keys[gKeyCode] && !state.keys[gKeyCode] && ctrlMeta && state.keys[shiftKeyCode]) {
        keys.event.preventDefault();
        ungroupSelected(state);
    } else if (keys[gKeyCode] && !state.keys[gKeyCode] && ctrlMeta) {
        keys.event.preventDefault();
        groupSelected(state);
    }
    if (keys[zKeyCode] && !state.keys[zKeyCode] && ctrlMeta && state.keys[shiftKeyCode]) {
        redo(state);
        keys.event.preventDefault();
    } else if (keys[zKeyCode] && !state.keys[zKeyCode] && ctrlMeta) {
        undo(state);
    }
    if (keys[dKeyCode] && !state.keys[dKeyCode] && ctrlMeta && state.keys[shiftKeyCode]) {
        duplicateSelection(state);
    }
    state.keys = keys;
}
