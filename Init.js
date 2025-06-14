import { Builder } from "./Core/Builder.js";
import { Developer } from "./Core/Developer.js";

export const Initialize = (count) => {

    var map = [
        // { Tag: "Animal", Color: "#e28d3d",  Speed: 0.2,   Radius: 5,   Count: 40,   IsAutopilot: true , IsRandomColor: false,IsRandomRadius: false},
        // { Tag: "Tree",   Color: "#61e23d",  Speed: 1,     Radius: 5,   Count: 150,  IsAutopilot: false , IsRandomColor: false,IsRandomRadius: false},
        // { Tag: "Rock",   Color: "#FFFFFF",  Speed: 1,     Radius: 8,   Count: 30,   IsAutopilot: false , IsRandomColor: false,IsRandomRadius: false},
        // { Tag: "House",  Color: "#3dd5e2",  Speed: 1,     Radius: 20,  Count: 10,   IsAutopilot: false , IsRandomColor: false,IsRandomRadius: false},
        // { Tag: Player,   Color: "#a35af2",  Speed: 0.7,   Radius: 8,   Count: 1,    IsAutopilot: true , IsRandomColor: false,IsRandomRadius: false},
        // { Tag: "Enemy",  Color: "#e23d3d",  Speed: 0.7,   Radius: 5,   Count: 20,   IsAutopilot: true , IsRandomColor: false,IsRandomRadius: false},
        { Tag: "Point",  Color: "Gold",    Speed: parseFloat(Developer.get("PointsSpeed")),   Radius: parseInt(Developer.get("PointsRadius")),   Count: count ?? parseInt(Developer.get("PointsCount")),   IsAutopilot: true , IsRandomColor: true,IsRandomRadius: false},
    ];

    for (const item of map) {
        var builder = new Builder()
                            .SetTag(item.Tag)
                            .SetRandomPosition()
                            .SetSpeed(item.Speed)
                            .SetRadius(item.Radius)
                            .SetCount(item.Count)
                            .IsAutopilot(item.IsAutopilot);
                            
        // Set Random Color
        if (item.IsRandomColor == true) {
            builder.SetRandomColor();
        } else {
            builder.SetColor(item.Color);
        }

        // Set Random Radius
        if (item.IsRandomRadius == true) {
            builder.SetRandomRadius();
        } else {
            builder.SetRadius(item.Radius);
        }

        builder.Build();
    }
};
    
