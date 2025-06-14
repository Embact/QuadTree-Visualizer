import { Config } from "./Core/Config.js";
import { State } from "./Core/State.js";
import { Initialize } from "./Init.js";
import { QuadTree,Point,Rectangle } from "./Core/QuadTree.js";
import { Developer } from "./Core/Developer.js";
import { Helpers } from "./Core/Helpers.js";
import { GameObject } from "./Models/GameObject.js";

new Developer();



export class Game {
    static ctx       = null;
    static DeltaTime = 0;
    static LastTime  = performance.now();
    static Quad      = null;
    static Mouse     = {
                        X: 0,
                        Y: 0
                    };

    #fpsLastTime     = 0;
    #insertInterval  = null;

    constructor() {  
        Initialize();      
        this.Init();             
    }

    Init() {
        const canvas  = document.getElementById("Game");
        canvas.width  = Config.Map.Width;
        canvas.height = Config.Map.Height;

        Game.ctx      = canvas.getContext("2d");        

        canvas.addEventListener('mousemove', (e) => {
            Game.Mouse.X = e.clientX ;
            Game.Mouse.Y = e.clientY ;
        });

        canvas.addEventListener("mousedown",(e) => {
            this.#insertInterval = setInterval(() => {
                if (Developer.get("InsertPoints") == true) this.InertByClick(e);
            },50);
        });

        canvas.addEventListener("mouseup", () => {
            clearInterval(this.#insertInterval);
            this.#insertInterval = null;
        });
    }

    InertByClick(e) {
        document.querySelector("#PointsCount").value ++;
        var go         = new GameObject("GameObject", { x: Game.Mouse.X, y: Game.Mouse.Y }, "GameObject");
        go.Color       = Helpers.RandomColor();
        go.Radius      = Developer.get("PointsRadius");
        go.Speed       = Developer.get("PointsSpeed");
        go.IsAutopilot = true;
        State.GameObjects.push(go);
        const slider = document.querySelector("#PointsCount");
        slider.value++;
        slider.dispatchEvent(new Event("input"));
    }

    Loop(currentTime = performance.now()) {
        // Calculate DeltaTime (in milliseconds)
        Game.DeltaTime = currentTime - Game.LastTime;
        Game.LastTime = currentTime;        

        // Clear the canvas
        Game.ctx.clearRect(0, 0, Config.Map.Width, Config.Map.Height);

        // Update the game state
        this.Quad();

        // Update the game state
        this.Update();        

        // Render the game state
        this.Render();    
        
        // Set FPS
        // ✅ Update FPS every 2 seconds
        if (currentTime - this.#fpsLastTime > 500) {
            const fps = 1000 / Game.DeltaTime;
            document.querySelector("#FPSCounter").innerHTML = fps.toFixed(0);
            this.#fpsLastTime = currentTime;

            // Set Counter
            document.querySelector("#PointsCounter").innerHTML = State.GameObjects.length.toLocaleString();
        }

        // Call the next frame    
        requestAnimationFrame(this.Loop.bind(this));
    }

    Quad() {
        var scanedPoints = [];
        Game.Quad = new QuadTree(
            new Rectangle(0,0, Config.Map.Width, Config.Map.Height)
            ,Developer.get("QuadCapacity"));

        // Insert Points
        State.GameObjects.forEach(obj => {
            Game.Quad.Insert(new Point(obj.Id,obj.Position.x, obj.Position.y, obj.Radius,obj.Color))
        });
        
        if (Developer.get("CollisionDetection") == true) {
            Game.Quad.DetectCollisions((obj1, obj2) => {
                var id1  = State.GameObjects.findIndex(obj => obj.Id === obj1.Id);
                var id2  = State.GameObjects.findIndex(obj => obj.Id === obj2.Id);
                State.GameObjects = [...State.GameObjects.filter((obj, index) => ![id1,id2].includes(index))];
            });
        }

        if (Developer.get("ActiveLens") == true) {
            document.querySelector("#Game").style.cursor = "none";

            var range = new Rectangle(Game.Mouse.X,Game.Mouse.Y, parseInt(Developer.get("LensWidening")),parseInt(Developer.get("LensWidening")))
            scanedPoints = this.Scanner(range)            
        } else {
            document.querySelector("#Game").style.cursor = "default";
        }

        if (Developer.get("FOV") == true && Developer.get("ActiveLens") == true) {
            Game.Quad.Render(Game.ctx, scanedPoints);
        } else { 
            Game.Quad.Render(Game.ctx);
        }

        window.Quad = Game.Quad;
    }


    Update() {
        console.log(State.GameObjects.length);
        
        // Update all game objects
        State.GameObjects.forEach(gameObject => {
            gameObject.Update(this.DeltaTime);
        });
    }

    Render() {        
    }

    Scanner(rectangle) {
        const ctx = Game.ctx;
        //Draw Stroke Rectangle 
        var rect   = new Rectangle(Game.Mouse.X - rectangle.Width / 2 , Game.Mouse.Y - rectangle.Height / 2, rectangle.Width, rectangle.Height);

        var points = Game.Quad.Query(rect);
        points.forEach(point => {
            point.Color = Developer.get("FOV") == true ? "#FFF" : "#000";
        });

        ctx.beginPath();
        ctx.rect(Game.Mouse.X - rectangle.Width / 2 , Game.Mouse.Y - rectangle.Height / 2, rectangle.Width, rectangle.Height);
        ctx.strokeStyle = `#0D6EFD`;
        ctx.fillStyle = Developer.get("FOV") == true ? "#0D6EFD" : "#FFF";
        ctx.stroke();
        ctx.fill();
        

        // Add Text Below Rectangle
        ctx.fillStyle = "#FFF";
        ctx.font = "9px Arial";
        ctx.textAlign = "center";   
        ctx.textBaseline = "middle";
        ctx.fillText("X: " + Game.Mouse.X.toFixed(0) + " Y: " + Game.Mouse.Y.toFixed(0), Game.Mouse.X, Game.Mouse.Y + rectangle.Height / 2 + 15);

        // Total Points
        ctx.fillStyle = "#FFF";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";   
        ctx.textBaseline = "middle";
        ctx.fillText(`Points: ${points.length}`, Game.Mouse.X, Game.Mouse.Y - rectangle.Height / 2 - 10);
        
        return points;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var game = new Game();
game.Loop();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
var lastValues = {
    Speed         : 0,
    Radius        : 0,
    Color         : "",
    IsRandomColor : false
};

Developer.onInit(() => GameLoop(null,null));
Developer.onChange((id,value) => GameLoop(id,value));


function GameLoop(id,value) {
    var newPoints = 0;    

    console.log(Developer.get("PointsCount"));
    
    if (State.GameObjects.length >= Developer.get("PointsCount")) {
        State.GameObjects = State.GameObjects.slice(0, Developer.get("PointsCount"));
    } else {
        if (Developer.get("AutoGeneratePoints") == true) {
            newPoints = Math.min(Developer.get("PointsCount"), Developer.get("PointsCount") - State.GameObjects.length);
            Initialize(newPoints);
        }
    }

    // Update All Objects
    const randomColors  = Developer.get("RandomColors");
    const colorChanged  = Developer.get("PointColor") !== lastValues.Color;
    const speedChanged  = Developer.get("PointsSpeed") !== lastValues.Speed;
    const radiusChanged = Developer.get("PointsRadius") !== lastValues.Radius;
    const toggleChanged = randomColors !== lastValues.IsRandomColor;

    if (speedChanged || radiusChanged || colorChanged || toggleChanged || newPoints > 0) {

        const points = newPoints > 0 
                        ? State.GameObjects.slice(-newPoints) 
                        : State.GameObjects;

        points.forEach(obj => {
            obj.Speed = Developer.get("PointsSpeed");
            obj.Radius = Developer.get("PointsRadius");

            if (randomColors) {
                // Only apply random color ONCE when toggled from false → true
                if (!lastValues.IsRandomColor) {
                    obj.Color = Helpers.RandomColor();
                }
            } else {
                obj.Color = Developer.get("PointColor");
            }
        });

        // Update last values
        lastValues.Speed         = Developer.get("PointsSpeed");
        lastValues.Radius        = Developer.get("PointsRadius");
        lastValues.Color         = Developer.get("PointColor");
        lastValues.IsRandomColor = randomColors;
    }
}
