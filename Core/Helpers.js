import { Config } from "./Config.js";

export class Helpers {
    static RandomColor() {
        const randomHSL = Math.round(Math.random() * 360);
        return `hsl(${randomHSL}deg 80% 50% / 1)`;
    }

    static GetRandomPosition(Radius) {
        var obj =  {
            x: Math.random() * Config.Map.Width,
            y: Math.random() * Config.Map.Height
        };

        // Keep object within map bounds
        obj.x = Math.max(0 + Radius, Math.min(obj.x, Config.Map.Width - Radius));
        obj.y = Math.max(0 + Radius, Math.min(obj.y, Config.Map.Height - Radius));            

        return obj;
    }

    static CircleCollision(p1, p2) {
        let dx = p1.X - p2.X;
        let dy = p1.Y - p2.Y;
        let dist = Math.hypot(dx, dy);
        return dist < (p1.Radius + p2.Radius);
    }
}