import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png",{  
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

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

// first scene
k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;
    const map = k.add([
        k.sprite("map"),
        k.pos(0),
        k.scale(scaleFactor),
    ]);

    const player = k.make([
        k.sprite("spritesheet", {anim: "idle-down"}), 
        k.area({
            shape: new k.Rect(k.vec2(0, 3), 10, 10),
        }),
        k.body(),
        k.anchor("center"),
        k.pos(),
        k.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,
        },
        "player", 
    ]);

    for (const layer of layers) {
        if (layer.name === "boundaries") {
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                    }),
                    k.body({isStatic: true}),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);

                if (boundary.name) {
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        displayDialogue(
                          dialogueData[boundary.name] ?? "",
                          () => (player.isInDialogue = false)
                        );
                    });
                }
            }
            continue;
        }

        if (layer.name === "spawnpoints") {
            for (const entity of layer.objects) {
                if (entity.name === "player") {
                    player.pos = k.vec2(
                        (map.pos.x + entity.x) * scaleFactor,
                        (map.pos.y + entity.y) * scaleFactor,
                    );
                    k.add(player);
                    continue;
                }
            }
        }
    }

    setCamScale(k);
    k.onResize(() => setCamScale(k));

    // smooth camera follow
    const camOffset = k.vec2(0, -100);
    k.onUpdate(() => {
        const target = player.worldPos().add(camOffset);
        const current = k.camPos();
        const lerp = 0.08;
        k.camPos(
          current.x + (target.x - current.x) * lerp,
          current.y + (target.y - current.y) * lerp
        );
    });

    // one-time note hide and ripple click feedback
    const noteEl = document.querySelector('.note');
    function spawnRipple(pos) {
        const r = k.add([
          k.pos(pos),
          k.circle(4),
          k.color(255, 255, 255),
          k.opacity(0.8),
          k.z(1000),
          'ripple'
        ]);
        let t = 0;
        r.onUpdate(() => {
          t += k.dt();
          r.scale = 1 + t * 3;
          r.opacity = Math.max(0, 0.8 - t * 1.2);
          if (t > 0.6) r.destroy();
        });
    }

    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) return;

        const worldMousePos = k.toWorld(k.mousePos());
        spawnRipple(worldMousePos);
        if (noteEl) noteEl.style.display = 'none';
        player.moveTo(worldMousePos, player.speed);

        const mouseAngle = player.pos.angle(worldMousePos);

        const lowerBound = 50;
        const upperBound = 125;

        if (
          mouseAngle > lowerBound &&
          mouseAngle < upperBound &&
          player.curAnim() !== "walk-up"
        ) {
          player.play("walk-up");
          player.direction = "up";
          return;
        }

        if (
          mouseAngle < -lowerBound &&
          mouseAngle > -upperBound &&
          player.curAnim() !== "walk-down"
        ) {
          player.play("walk-down");
          player.direction = "down";
          return;
        }

        if (Math.abs(mouseAngle) > upperBound) {
          player.flipX = false;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "right";
          return;
        }

        if (Math.abs(mouseAngle) < lowerBound) {
          player.flipX = true;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "left";
          return;
        }
    });

    function stopAnims() {
        if (player.direction === "down") {
          player.play("idle-down");
          return;
        }
        if (player.direction === "up") {
          player.play("idle-up");
          return;
        }
        player.play("idle-side");
    }

    k.onMouseRelease(stopAnims);
    k.onKeyRelease(() => { stopAnims(); });

    k.onKeyDown((key) => {
        const run = k.isKeyDown('shift') ? 1.6 : 1;
        const keyMap = [
          k.isKeyDown("right"),
          k.isKeyDown("left"),
          k.isKeyDown("up"),
          k.isKeyDown("down"),
        ];

        let nbOfKeyPressed = 0;
        for (const pressed of keyMap) {
          if (pressed) nbOfKeyPressed++;
        }
        if (nbOfKeyPressed > 1) return;
        if (player.isInDialogue) return;

        if (keyMap[0]) {
          player.flipX = false;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "right";
          player.move(player.speed * run, 0);
          return;
        }
        if (keyMap[1]) {
          player.flipX = true;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "left";
          player.move(-player.speed * run, 0);
          return;
        }
        if (keyMap[2]) {
          if (player.curAnim() !== "walk-up") player.play("walk-up");
          player.direction = "up";
          player.move(0, -player.speed * run);
          return;
        }
        if (keyMap[3]) {
          if (player.curAnim() !== "walk-down") player.play("walk-down");
          player.direction = "down";
          player.move(0, player.speed * run);
        }
    });
});

k.go("main");
