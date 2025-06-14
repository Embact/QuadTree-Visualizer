
import { Helpers } from "./Helpers.js";

export class LerpAnimator {
    constructor(from, to, duration) {
        this.from     = from;
        this.to       = to;
        this.duration = duration; // in milliseconds
        this.elapsed  = 0;
        this.done     = false;
        this.value    = from;
    }

    update(deltaTime) {
        if (this.done) return this.value;
        
        this.elapsed += deltaTime;

        let t = Math.min(this.elapsed / this.duration, 1); // clamp t between 0 and 1
        
        this.value = Helpers.Lerp(this.from, this.to, t);

        if (t >= 1) {
            this.done = true;
        }

        return this.value;
    }

    reset() {
        this.elapsed = 0;
        this.done = false;
        this.value = this.from;
    }
}