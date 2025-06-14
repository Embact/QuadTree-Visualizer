import { State } from "./State.js";
import { GameObject } from "../Models/GameObject.js";
import { Helpers } from "./Helpers.js";
import { Developer } from "./Developer.js";

export class Builder {

    SetRadius(radius) {
        this.Radius = radius;
        return this;
    }

    SetRandomRadius() {
        this.IsRandomRadius = true;
        this.Radius = 1;
        return this;
    }

    SetColor(color) {
        this.Color = color;
        return this;
    }

    SetRandomColor() {
        this.IsRandomColor = true;
        this.Color = "#FFF"
        return this;
    }

    SetSpeed(speed) {
        this.Speed = speed;
        return this;
    }

    SetPosition(x, y) {
        this.Position = { x, y };
        return this;
    }
    
    SetRandomPosition() {
        this.RandomPosition = true;
        this.Position = { x: 0, y: 0 };
        return this;
    }
    
    SetTag(tag) {
        if (typeof tag === 'function') {
            this.Tag = tag.name;
        } else if (typeof tag === 'object') {
            this.Tag = tag.constructor.name;
        }else {
            this.Tag = tag;
        }
        return this;
    }

    SetCount(count) {
        this.Count = count;
        return this;
    }

    IsAutopilot(isAutopilot) {
        this.IsAutopilot = isAutopilot;
        return this;
    }    

    Build() {
        if (!this.Tag || !this.Count || !this.Position || !this.Color || !this.Radius) {
            throw new Error("Missing required properties to build the game object.");
        }
        const gameObjects = [];
        for (let i = 0; i < this.Count; i++) {
            const gameObject       = new GameObject(`GameObject${i}`, this.Position, this.Tag);
            gameObject.Speed       = Developer.get("PointsSpeed"); //this.Speed || 1;
            gameObject.Color       = this.IsRandomColor ? Helpers.RandomColor() : this.Color;
            gameObject.Radius      = this.IsRandomRadius ? Math.floor(Math.random() * 3) + 2 : this.Radius;
            gameObject.IsAutopilot = this.IsAutopilot; 
            if (this.RandomPosition) {
                gameObject.Position = Helpers.GetRandomPosition(this.Radius);
            }
            gameObjects.push(gameObject);
        }

        if (gameObjects.length === 0) {
            throw new Error("No game objects were created. Check the Count property.");
        }

        // Set GameObject State
        State.GameObjects.push(...gameObjects);
    }
}