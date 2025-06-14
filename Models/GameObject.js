import { Config } from "../Core/Config.js";
import { Developer } from "../Core/Developer.js";
import { State } from "../Core/State.js";
import { Game } from "../Game.js";

export class GameObject {

    #MoveTimer;

    constructor(name, position = { x: 0, y: 0 },tag = "GameObject") {
        this.Id           = crypto.randomUUID();
        this.Tag          = tag;
        this.Name         = name;
        this.Position     = position;
        this.Components   = [];
        this.Color        = "white";
        this.Radius       = 10;
        this.IsAutopilot  = false; 
        this.Speed        = Developer.get("PointsSpeed");
        this.#MoveTimer   = 0;
        this.HasStroke    = false;
    }

    Update() {
        if (this.IsAutopilot === true) {            
            // If time's up, pick a new random direction and duration
            if (this.#MoveTimer <= 0) {
                this.Direction = this.#GetRandomDirection();
                this.#MoveTimer = 1000 + Math.random() * 1000;               
            }

            // Move in current direction
            this.Position.x += this.Direction.x * this.Speed;
            this.Position.y += this.Direction.y * this.Speed;

            // Decrease timer
            this.#MoveTimer -= Game.DeltaTime;

            // Keep object within map bounds
            const margins = 5;
            this.Position.x = Math.max(0 + this.Radius + margins, Math.min(this.Position.x, Config.Map.Width - this.Radius - margins));
            this.Position.y = Math.max(0 + this.Radius + margins, Math.min(this.Position.y, Config.Map.Height - this.Radius - margins));            
        }
    }

    Render(ctx) {
        ctx.save();

        // Draw the circle
        ctx.beginPath();
        ctx.arc(this.Position.x, this.Position.y, this.Radius, 0, Math.PI * 2);
        ctx.fillStyle = this.Color;

        if (this.HasStroke) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.fill();
        ctx.closePath();

        // Add Tag Text Above Object
        if (State.GameObjects.length < 1000) {
            ctx.fillStyle = "white";
            ctx.font = "9px Arial";
            ctx.textAlign = "center";   
            ctx.textBaseline = "middle";
            ctx.fillText(this.Tag, this.Position.x, this.Position.y + this.Radius + 10);
        }
        ctx.restore();
    }

    #GetRandomDirection() {
        const angle = Math.random() * 2 * Math.PI;
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

}