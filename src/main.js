import { kaboomCtx } from "./kaboomCtx";
import { scaleFactor } from "./constants";

kaboomCtx.loadSprite("spritesheet", "./spritesheet.png",{  
    sliceX: 39,
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": {from: 936, to: 939, loop: true, speed: 8},
        "idle-side": 975,
        "walk-side": {from: 975, to: 978, loop: true, speed: 8},
        "idle-up": 1014,
        "walk-up": {from: 1014, to: 1017, loop: true, speed: 8},
    }
 });

kaboomCtx.loadSprite("map", "./map.png");

kaboomCtx.setBackground(kaboomCtx.Color.fromHex("#311047"));

// first scene
kaboomCtx.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;
    const map = kaboomCtx.make([
        kaboomCtx.sprite("map"),
        kaboomCtx.pos(0),
        kaboomCtx.scale(scaleFactor),
    ]);

    const player = kaboomCtx.make([
        kaboomCtx.sprite("spritesheet", {anim: "idle-down"}), 
        kaboomCtx.area({
            shape: new kaboomCtx.Rect(kaboomCtx.vec2(0, 3), 10, 10),
        }),
        kaboomCtx.body(),
        kaboomCtx.anchor("center"),
        kaboomCtx.pos(),
        kaboomCtx.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,

        },
        "player", 

    ]);

    for (const layer of layers) {
        if (layer.type === "boundaries") {
            for (const boundary of layer.objects) {
                map.add([
                    kaboomCtx.area({
                        shape: new kaboomCtx.Rect(kaboomCtx.vec2(0), boundary.width, boundary.height),
                    }),
                    kaboomCtx.body({isStatic: true}),
                    kaboomCtx.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);

                if (boundary.name) {
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        
                    });
                }
            }
        }
    }
});

kaboomCtx.go("main");
