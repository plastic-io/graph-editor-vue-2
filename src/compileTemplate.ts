import Vue from "vue";
import {parseScript} from "meriyah";
import {Parser} from "htmlparser2";
import {DomHandler} from "domhandler";
import {getInnerHTML} from "domutils";
import {generate} from "escodegen";
// loaded: {}
// longLoadingTimer
// broken: null
// styles: []
export default function compileTemplate(hostComp: any, id: string, tmp: string, clearLoad: boolean) {
    if (clearLoad) {
        hostComp.loaded[id] = undefined;
    }
    if (hostComp.loaded[id] !== undefined) {
        return;
    }
    let script: any;
    let template: string|undefined = undefined;
    let style: any;
    const handler = new DomHandler(function(error: any, dom: any) {
        if (error) {
            // Handle error
        } else {
            // Parsing completed, do something
            dom.forEach((el: any) => {
                if (el.tagName === "script") {
                    if (script !== undefined) {
                        hostComp.$store.dispatch("error",
                            new Error(`Vector ${id} contains a Vue template with more than one script tag.`));
                        return;
                    }
                    script = getInnerHTML(el);
                }
                if (el.tagName === "template") {
                    if (template !== undefined) {
                        hostComp.$store.dispatch("error",
                            new Error(`Vector ${id} contains a Vue template with more than one template tag.`));
                        return;
                    }
                    template = getInnerHTML(el);
                }
                if (el.tagName === "style") {
                    if (style !== undefined) {
                        hostComp.$store.dispatch("error",
                            new Error(`Vector ${id} contains a Vue template with more than one style tag.`));
                        return;
                    }
                    style = getInnerHTML(el);
                }
            });
        }
    });
    const parser = new Parser(handler, {
        decodeEntities: true,
        recognizeSelfClosing: true,
    });
    parser.write(tmp);
    parser.end();
    if (script === undefined) {
        script = "export default {}";
    }
    // create a script that can use module imports and registers our vector's component
    // this seems jank, but it isn't.  There are other ways, but they lack features: es6 mport, ref leaking
    const scriptTemplate = script.replace("export default", "const c = {}; c.comp = ") + ";"
        + "c.comp.template = `" + template + "`;"
        + "c.comp.name = 'vector-" + id + "';"
        + "window.Vue.component(c.comp.name, c.comp);";
    const ast = parseScript(scriptTemplate, {
        globalReturn: true,
        module: true,
        next: true,
    });
    const astString = generate(ast);
    const scr = document.createElement("script");
    scr.crossOrigin = "anonymous";
    scr.async = true;
    scr.onerror = (err: any) => {
        console.error("Script load error", err);
        hostComp.broken = err;
    };
    window.Vue = Vue;
    scr.type = "module";
    hostComp.$el.appendChild(scr);
    hostComp.loaded[id] = false;
    try {
        scr.innerHTML = astString;
    } catch (err) {
        hostComp.$store.dispatch("raiseError", new Error(`Vector ${id} contains an error in the Vue script. ${err}.`));
    }
    const checkReg = () => {
        console.log("checkReg");
        if ((Vue as any).options.components["vector-" + id]) {
            hostComp.loaded[id] = true;
            // attempts were made to avoid memory leaks
            if (scr.parentNode) {
                scr.parentNode.removeChild(scr);
            }
            let allLoaded = true;
            Object.keys(hostComp.loaded).forEach((key) => {
                if (!hostComp.loaded[key]) {
                    allLoaded = false;
                }
            });
            if (allLoaded) {
                clearTimeout(hostComp.longLoadingTimer);
                hostComp.broken = false;
                try {
                    console.log("checkReg forceUpdate");
                    hostComp.$forceUpdate();
                } catch (err) {
                    console.error(`Vector ${id} error:`, err);
                    hostComp.broken = err;
                }
            }
            return;
        }
        setTimeout(checkReg, 10);
    };
    checkReg();
    // add styles on this component to the style list
    hostComp.styles.push(style);
}