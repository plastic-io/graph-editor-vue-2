import bezier from "bezier-js";
export default class NormalSplines {
    options: object;
    constructor(options: object) {
        this.options = options;
    }
    draw(ctx: object, source: object, target: object) {
        console.log(ctx, source, target, bezier);
        // ctx.beginPath();
    }
}
