import { Developer } from "./Developer.js";
import { Helpers } from "./Helpers.js";

export class Point {
    constructor(Id,X, Y, Radius, Color) {
        this.Id         = Id;
        this.X          = X;
        this.Y          = Y;
        this.Radius     = Radius;
        this.Color      = Color;
    }
}

export class Rectangle {
    constructor(X, Y, Width, Height) {
        this.X      = X;
        this.Y      = Y;
        this.Width  = Width;
        this.Height = Height;
    }

    Intersects(point) {
        return !(
            point.X + point.Radius < this.X || 
            point.X - point.Radius > this.X + this.Width ||
            point.Y + point.Radius < this.Y || 
            point.Y - point.Radius > this.Y + this.Height
        );
    }
}

export class QuadTree {
    constructor(Boundary, Capacity) {
        this.Boundary  = Boundary; // {x, y, r}
        this.Capacity  = Capacity;
        this.Points    = [];
        this.IsDivided = false;

        this.NorthWest = null;
        this.NorthEast = null;
        this.SouthWest = null;
        this.SouthEast = null;
    }

    Query(range, found = []) {
        // Skip if this quad doesn't intersect the search area
        if (!this.Boundary.Intersects(range)) {
            return found;
        }

        // Check points at this level
        for (const point of this.Points) {
            if (range.Intersects(point)) {
                found.push(point);
            }
        }

        // Recurse if subdivided
        if (this.IsDivided) {
            this.NorthWest.Query(range, found);
            this.NorthEast.Query(range, found);
            this.SouthWest.Query(range, found);
            this.SouthEast.Query(range, found);
        }

        return found;
    }

    Insert(point) {
        // Don't insert if not in this boundary
        if (!this.Boundary.Intersects(point)) return false;

        // If not subdivided and has space, store here
        if (!this.IsDivided && this.Points.length < this.Capacity) {
            this.Points.push(point);
            return true;
        }

        // If not divided yet, divide and reinsert old points
        if (!this.IsDivided) {
            this.Subdivide();

            // Reinsert existing points into children
            for (const oldPoint of this.Points) {
                this._InsertIntoChildren(oldPoint);
            }

            // Clear current node's points
            this.Points = [];
        }

        // Insert into children
        return this._InsertIntoChildren(point);
    }

    // Helper method to keep child logic clean
    _InsertIntoChildren(point) {
        if (this.NorthWest.Insert(point)) return true;
        if (this.NorthEast.Insert(point)) return true;
        if (this.SouthWest.Insert(point)) return true;
        if (this.SouthEast.Insert(point)) return true;
        return false;
    }


    Subdivide() {
        let { X, Y, Width, Height } = this.Boundary;
        
        let NorthWest  = new Rectangle(X, Y , Width /2 , Height/2);
        let NorthEast  = new Rectangle(X + Width / 2, Y, Width /2, Height/2);
        let SouthWest  = new Rectangle(X, Y + Height / 2, Width /2, Height/2);
        let SouthEast  = new Rectangle(X + Width / 2, Y + Height / 2, Width /2, Height/2);

        this.NorthWest = new QuadTree(NorthWest, this.Capacity);
        this.NorthEast = new QuadTree(NorthEast, this.Capacity);
        this.SouthWest = new QuadTree(SouthWest, this.Capacity);
        this.SouthEast = new QuadTree(SouthEast, this.Capacity);  
        
        this.IsDivided = true;
    }

    DetectCollisions(handleCollision) {
        // 1. Check collisions within this node
        for (let i = 0; i < this.Points.length; i++) {
            for (let j = i + 1; j < this.Points.length; j++) {
                if (Helpers.CircleCollision(this.Points[i], this.Points[j])) {
                    handleCollision(this.Points[i], this.Points[j]);
                }
            }
        }

        // 2. Check collisions between this node’s points and children’s points (border overlap safety)
        if (this.IsDivided) {
            const children = [this.NorthWest, this.NorthEast, this.SouthWest, this.SouthEast];
            for (const child of children) {
                for (const point of this.Points) {
                    child._CheckPointAgainstSubtree(point, handleCollision);
                }
            }

            // 3. Recursively check collisions inside children
            for (const child of children) {
                child.DetectCollisions(handleCollision);
            }
        }
    }

    // Helper method to check a single point against an entire subtree
    _CheckPointAgainstSubtree(point, handleCollision) {
        for (const other of this.Points) {
            if (point === other) continue;
            if (Helpers.CircleCollision(point, other)) {
                handleCollision(point, other);
            }
        }

        if (this.IsDivided) {
            this.NorthWest._CheckPointAgainstSubtree(point, handleCollision);
            this.NorthEast._CheckPointAgainstSubtree(point, handleCollision);
            this.SouthWest._CheckPointAgainstSubtree(point, handleCollision);
            this.SouthEast._CheckPointAgainstSubtree(point, handleCollision);
        }
    }

    Render(ctx, pointsRange = []) {
        var points = this.Points;

        if (pointsRange.length > 0)
            points = pointsRange;
        

        // Draw this node’s rectangle
        if(Developer.get("DrawQuads") == true) {
            this.#DrawRectangles(ctx,points);  
        }        

        // Draw points in this node
        for (const point of points) {
            if (Developer.get("DrawPoints") == true) {
                ctx.beginPath();
                ctx.arc(point.X, point.Y, point.Radius, 0, Math.PI * 2);
                ctx.fillStyle = point.Color;
                ctx.fill();
            }            
            
            if (Developer.get("PointCoords") == true) {
                // Draw centered text inside the circle
                ctx.fillStyle = "rgba(255,255,255,0.4)";
                ctx.font = "9px Arial";
                ctx.textAlign = "center";    
                ctx.textBaseline = "middle";
                ctx.fillText(`(${point.X.toFixed(0)},${point.Y.toFixed(0)})`, point.X, point.Y + point.Radius + 10);
                ctx.restore();
            }   
            
            // Draw Lines From Points To Quads Center
            if (Developer.get("DrawLines") == true) {
                ctx.beginPath();
                ctx.moveTo(point.X, point.Y);
                ctx.lineTo(this.Boundary.X + this.Boundary.Width / 2, this.Boundary.Y + this.Boundary.Height / 2);
                ctx.strokeStyle = Developer.get("QuadLineColor") == "#ffffff" ? "rgba(255, 255, 255,0.4)" : Developer.get("QuadLineColor");
                ctx.stroke();
            }

            // Draw Lines From Points To Another Points
            if (Developer.get("DrawLinesNeighbors") == true) {
                for (const point2 of points) {
                    ctx.beginPath();
                    ctx.moveTo(point.X, point.Y);
                    ctx.lineTo(point2.X, point2.Y);
                    ctx.strokeStyle = point2.Color.replace("/ 1", "/ " + Developer.get("NeighborsOpacity"));
                    ctx.stroke();       
                }
            }
        }

        // Recursively render children
        if (this.IsDivided && pointsRange.length == 0) {
            this.NorthWest.Render(ctx);
            this.NorthEast.Render(ctx);
            this.SouthWest.Render(ctx);
            this.SouthEast.Render(ctx);
        }
    }

    #DrawRectangles(ctx,points) {
        if (Developer.get("OnlyHavePoints") == true && points.length == 0) return;

        ctx.beginPath();
        ctx.rect(this.Boundary.X, this.Boundary.Y, this.Boundary.Width, this.Boundary.Height);
        if (Developer.get("QuadFlash") == true) {
            if (points.length > 0)
                ctx.strokeStyle = points[0].Color.replace("/ 1", "/ " + Developer.get("QuadOpacity"));

            // ctx.strokeStyle = (points.length < this.Capacity) ? 
            //     (points.length < this.Capacity / 2) ? 
            //     `rgba(43, 210, 219,${Developer.get("QuadOpacity")})` : 
            //     `rgba(255, 204, 0,${Developer.get("QuadOpacity")})` : 
            //     `rgba(234, 60, 60,${Developer.get("QuadOpacity")})`;
        } else {
            ctx.strokeStyle = `rgba(255, 255, 255,${Developer.get("QuadOpacity")})`; // White
        }

        ctx.stroke();
        ctx.restore();
    }
}