import kaboom from "kaboom";

export const kaboomCtx = kaboom({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
});