// =====================================================================
// Pixel character renderer. Characters are 16x24 pixels, drawn in code
// so every combination of skin / hair / outfit works without image files.
// =====================================================================
(function () {
  const W = 16, H = 24;

  const SKIN = ["#ffe0c4", "#f5c9a0", "#e0a878", "#c68650", "#a0643a", "#7a4a2a", "#5a341c", "#3e2414"];
  const HAIR_COLORS = ["#1b1b1b", "#4a2c17", "#8a5a2b", "#d9a441", "#b8442c", "#e8e2d4", "#5b3fa0", "#2f6fd6"];
  const HAIR_STYLES = ["short", "long", "afro", "bun", "braids", "hijab", "buzz", "curly"];
  const OUTFITS = ["hoodie", "smart", "casual", "sporty", "dress"];
  const OUTFIT_COLORS = ["#1f2f6b", "#c0392b", "#2e8b57", "#7d3c98", "#e67e22", "#2c3e50", "#d35d8c", "#16a085"];
  const ACCESSORIES = ["none", "glasses", "headphones", "cap", "earrings"];

  const NPC_LOOKS = {
    max: { skin: 3, hair: "short", hairColor: 0, outfit: "hoodie", outfitColor: 0, accessory: "none", lanyard: true },
    professor: { skin: 1, hair: "short", hairColor: 5, outfit: "smart", outfitColor: 5, accessory: "glasses", beard: true },
    librarian: { skin: 5, hair: "bun", hairColor: 0, outfit: "dress", outfitColor: 3, accessory: "glasses" },
    barista: { skin: 2, hair: "curly", hairColor: 1, outfit: "casual", outfitColor: 2, accessory: "cap", apron: true },
    adviser: { skin: 4, hair: "long", hairColor: 0, outfit: "smart", outfitColor: 0, accessory: "earrings" },
    mystery: { mystery: true },
  };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // pose: idle | walk | jump | wave | talk | celebrate | sit
  function draw(ctx, look, pose, frame) {
    ctx.clearRect(0, 0, W, H);
    const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    if (look.mystery) {
      const c = "#5c6378", d = "#3c4152";
      const bob = pose === "idle" && frame % 2 ? 1 : 0;
      px(4, 3 + bob, 8, 8, c); px(3, 11 + bob, 10, 7, c); px(5, 18, 2, 4, d); px(9, 18, 2, 4, d);
      px(4, 22, 3, 2, d); px(9, 22, 3, 2, d);
      ctx.fillStyle = "#fff"; px(7, 5 + bob, 2, 1, "#fff"); px(8, 6 + bob, 1, 2, "#fff"); px(8, 9 + bob, 1, 1, "#fff");
      return;
    }

    const skin = SKIN[look.skin] || SKIN[2];
    const skinD = shade(skin, -30);
    const hair = HAIR_COLORS[look.hairColor] || HAIR_COLORS[0];
    const hairD = shade(hair, -25);
    const cloth = OUTFIT_COLORS[look.outfitColor] || OUTFIT_COLORS[0];
    const clothD = shade(cloth, -35);
    const pants = look.outfit === "smart" ? "#22252e" : look.outfit === "sporty" ? shade(cloth, -50) : "#34495e";
    const shoe = "#151515";

    let bob = 0;
    if (pose === "idle" || pose === "talk" || pose === "sit") bob = frame % 2 ? 1 : 0;
    if (pose === "walk") bob = frame % 2;
    if (pose === "celebrate") bob = frame % 2 ? -2 : 0;
    const y0 = bob;

    // ---- legs ----
    const legY = 18;
    let lOff = 0, rOff = 0;
    if (pose === "walk") { const f = frame % 4; lOff = f === 1 ? -1 : f === 3 ? 1 : 0; rOff = -lOff; }
    if (pose === "jump") { lOff = -2; rOff = -1; }
    if (look.outfit === "dress") {
      px(4, 16 + y0, 8, 4, cloth); px(3, 19 + y0, 10, 1, clothD);
      px(5, 20, 2, 2 + Math.min(0, lOff), skin); px(9, 20, 2, 2 + Math.min(0, rOff), skin);
    } else {
      px(5, legY + y0 + Math.min(0, lOff), 3, 4 - Math.abs(lOff), pants);
      px(8, legY + y0 + Math.min(0, rOff), 3, 4 - Math.abs(rOff), pants);
    }
    px(4 + (lOff > 0 ? -1 : 0), 22 + Math.min(0, lOff), 4, 2, shoe);
    px(8 + (rOff > 0 ? 1 : 0), 22 + Math.min(0, rOff), 4, 2, shoe);

    // ---- torso ----
    px(4, 11 + y0, 8, 7, cloth);
    px(4, 17 + y0, 8, 1, clothD);
    if (look.outfit === "hoodie") { px(6, 11 + y0, 4, 1, clothD); px(7, 12 + y0, 1, 3, "#dfe6f5"); px(8, 12 + y0, 1, 2, "#dfe6f5"); px(5, 15 + y0, 6, 2, clothD); }
    if (look.outfit === "smart") { px(7, 11 + y0, 2, 5, "#f4f4f4"); px(7, 12 + y0, 2, 4, "#b03030"); px(7, 12 + y0, 2, 1, "#f4f4f4"); }
    if (look.outfit === "sporty") { px(4, 13 + y0, 8, 1, "#ffffff"); }
    if (look.outfit === "casual") { px(6, 11 + y0, 4, 1, skin); }
    if (look.apron) { px(5, 13 + y0, 6, 5, "#f1e3c8"); px(5, 13 + y0, 6, 1, "#c9b28a"); }
    if (look.lanyard) { px(6, 11 + y0, 1, 3, "#ffffff"); px(9, 11 + y0, 1, 3, "#ffffff"); px(6, 14 + y0, 4, 3, "#ffffff"); px(7, 15 + y0, 2, 1, "#1f2f6b"); }

    // ---- arms ----
    const armColor = look.outfit === "casual" ? skin : cloth;
    if (pose === "wave" || pose === "celebrate") {
      const up = frame % 2;
      px(2, 11 + y0, 2, 5, armColor); px(2, 16 + y0, 2, 1, skin);
      px(12, 6 + y0 + up, 2, 5, armColor); px(12, 5 + y0 + up, 2, 1, skin);
      if (pose === "celebrate") { px(2, 6 + y0 + up, 2, 5, armColor); px(2, 5 + y0 + up, 2, 1, skin); }
    } else if (pose === "jump") {
      px(2, 8 + y0, 2, 5, armColor); px(2, 7 + y0, 2, 1, skin);
      px(12, 8 + y0, 2, 5, armColor); px(12, 7 + y0, 2, 1, skin);
    } else {
      const swing = pose === "walk" ? (frame % 2 ? 1 : -1) : 0;
      px(2, 11 + y0 + swing, 2, 5, armColor); px(2, 16 + y0 + swing, 2, 1, skin);
      px(12, 11 + y0 - swing, 2, 5, armColor); px(12, 16 + y0 - swing, 2, 1, skin);
    }

    // ---- head ----
    px(7, 10 + y0, 2, 1, skinD); // neck
    px(4, 3 + y0, 8, 8, skin);
    px(4, 10 + y0, 8, 1, skinD);

    // eyes (blink every so often)
    const blink = frame % 17 === 0;
    if (blink) { px(5, 7 + y0, 2, 1, "#2a1a10"); px(9, 7 + y0, 2, 1, "#2a1a10"); }
    else { px(6, 6 + y0, 1, 2, "#1a1a1a"); px(9, 6 + y0, 1, 2, "#1a1a1a"); }
    // mouth
    if (pose === "talk" && frame % 2) px(7, 9 + y0, 2, 1, "#7a2a2a");
    else if (pose === "celebrate" || pose === "wave") { px(6, 9 + y0, 4, 1, "#7a2a2a"); }
    else px(7, 9 + y0, 2, 1, skinD);
    if (look.beard) { px(4, 9 + y0, 8, 2, HAIR_COLORS[5]); px(7, 9 + y0, 2, 1, "#7a2a2a"); }

    // ---- hair ----
    const h = look.hair;
    if (h === "short") { px(4, 2 + y0, 8, 2, hair); px(4, 4 + y0, 1, 2, hair); px(11, 4 + y0, 1, 2, hair); px(5, 4 + y0, 3, 1, hair); }
    if (h === "buzz") { px(4, 3 + y0, 8, 1, hairD); }
    if (h === "long") { px(4, 2 + y0, 8, 2, hair); px(3, 3 + y0, 2, 10, hair); px(11, 3 + y0, 2, 10, hair); px(5, 4 + y0, 2, 1, hair); }
    if (h === "afro") { px(3, 0 + y0, 10, 4, hair); px(2, 2 + y0, 2, 6, hair); px(12, 2 + y0, 2, 6, hair); px(4, 4 + y0, 8, 1, hairD); }
    if (h === "bun") { px(4, 2 + y0, 8, 2, hair); px(6, 0 + y0, 4, 2, hair); px(4, 4 + y0, 1, 2, hair); px(11, 4 + y0, 1, 2, hair); }
    if (h === "curly") { px(3, 1 + y0, 10, 3, hair); px(3, 4 + y0, 2, 3, hair); px(11, 4 + y0, 2, 3, hair); px(4, 1 + y0, 1, 1, hairD); px(8, 1 + y0, 1, 1, hairD); px(11, 2 + y0, 1, 1, hairD); }
    if (h === "braids") { px(4, 2 + y0, 8, 2, hair); px(3, 3 + y0, 1, 11, hair); px(12, 3 + y0, 1, 11, hair); px(3, 6 + y0, 1, 1, hairD); px(12, 6 + y0, 1, 1, hairD); px(3, 10 + y0, 1, 1, hairD); px(12, 10 + y0, 1, 1, hairD); }
    if (h === "hijab") {
      px(3, 2 + y0, 10, 2, hair); px(3, 4 + y0, 2, 8, hair); px(11, 4 + y0, 2, 8, hair);
      px(4, 10 + y0, 8, 2, hair); px(3, 12 + y0, 10, 1, hairD);
    }

    // ---- accessories ----
    const a = look.accessory;
    if (a === "glasses") { px(5, 6 + y0, 3, 1, "#111"); px(8, 6 + y0, 3, 1, "#111"); px(5, 6 + y0, 1, 2, "#111"); px(10, 6 + y0, 1, 2, "#111"); }
    if (a === "headphones") { px(4, 1 + y0, 8, 1, "#222"); px(3, 2 + y0, 1, 4, "#222"); px(12, 2 + y0, 1, 4, "#222"); px(2, 5 + y0, 2, 3, "#e74c3c"); px(12, 5 + y0, 2, 3, "#e74c3c"); }
    if (a === "cap") { px(4, 1 + y0, 8, 3, cloth === "#ffffff" ? "#333" : shade(cloth, 20)); px(10, 3 + y0, 4, 1, shade(cloth, -20)); }
    if (a === "earrings") { px(3, 8 + y0, 1, 1, "#f1c40f"); px(12, 8 + y0, 1, 1, "#f1c40f"); }
  }

  // A Sprite is a <canvas> element that redraws itself on a shared clock.
  const all = new Set();
  class Sprite {
    constructor(look, scale) {
      this.look = Object.assign({}, look);
      this.pose = "idle";
      this.frame = 0;
      this.el = document.createElement("canvas");
      this.el.width = W; this.el.height = H;
      this.el.className = "sprite";
      this.el.style.setProperty("--scale", scale || 4);
      this.ctx = this.el.getContext("2d");
      this.flip = false;
      all.add(this);
      this.render();
    }
    set(pose) { if (this.pose !== pose) { this.pose = pose; this.frame = 0; this.render(); } return this; }
    setLook(look) { this.look = Object.assign({}, look); this.render(); }
    face(left) { this.flip = left; this.el.classList.toggle("flip", left); }
    render() { draw(this.ctx, this.look, this.pose, this.frame); }
    destroy() { all.delete(this); this.el.remove(); }
  }
  setInterval(() => {
    for (const s of all) {
      if (!s.el.isConnected) { if (s.seen) all.delete(s); continue; }
      s.seen = true;
      s.frame++;
      s.render();
    }
  }, 160);

  window.Pixel = { Sprite, draw, W, H, SKIN, HAIR_COLORS, HAIR_STYLES, OUTFITS, OUTFIT_COLORS, ACCESSORIES, NPC_LOOKS };
})();
