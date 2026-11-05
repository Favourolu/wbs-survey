// =====================================================================
// WBS Survey Game — scenes & flow
// =====================================================================
(function () {
  "use strict";

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFast = () => reduced || document.body.classList.contains("fast");
  const sleep = (ms) => new Promise((r) => setTimeout(r, isFast() ? Math.min(ms, 40) : ms));
  const subtitle = (x) => x.replace(/W\.B\.S\./g, "WBS").replace(/S\.S\.L\.C\./g, "SSLC").replace(/W B S/g, "WBS").replace(/S S L C/g, "SSLC");
  const params = new URLSearchParams(location.search);

  // ---------- language ----------
  const EN = LANG_PACKS.en;
  let L = EN;
  const dig = (o, path) => path.split(".").reduce((x, k) => (x == null ? x : x[k]), o);
  function t(path, vars) {
    let v = dig(L, path);
    if (v == null || v === "") v = dig(EN, path);
    if (v == null) return path;
    if (vars && typeof v === "string") v = v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return v;
  }
  const opt = (o) => { const v = dig(L, "options." + o) || dig(EN, "options." + o); return v || o; };
  const roomName = (id) => t("rooms." + id);
  const VOtext = (n) => t("vo." + n);
  window.__t = t;

  function tween(ms, fn) {
    return new Promise((res) => {
      if (isFast() || ms <= 0) { fn(1); return res(); }
      const t0 = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - t0) / ms);
        fn(t);
        if (t < 1) requestAnimationFrame(step); else res();
      })(t0);
    });
  }

  // ---------- DOM ----------
  const app = $("#app"), hud = $("#hud"), stage = $("#stage"), bgEl = $("#bg"),
    scenery = $("#scenery"), actors = $("#actors"), fx = $("#fx"), panel = $("#panel");

  // ---------- state ----------
  const state = {
    session: Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3),
    gender: null, course: null, courseCode: null,
    look: { skin: 2, hair: "short", hairColor: 0, outfit: "hoodie", outfitColor: 0, accessory: "none" },
    answers: {},
    done: new Set(),
  };
  const MAX_LOOK = Pixel.NPC_LOOKS.max;

  // ---------- saving (Google Sheet via Apps Script) ----------
  const Saver = {
    pending: null,
    save(status) {
      const payload = Object.assign({
        session: state.session,
        status,
        updated: new Date().toISOString(),
        gender: state.gender,
        course: state.course,
        course_code: state.courseCode || "",
        language: L.meta.code,
      }, state.answers);
      this.pending = payload;
      try { localStorage.setItem("wbs_pending", JSON.stringify(payload)); } catch (e) {}
      this.flush();
    },
    async flush() {
      const p = this.pending;
      if (!p) return;
      if (!CONFIG.SHEET_URL) { console.info("[WBS survey] would save:", p); this.pending = null; return; }
      try {
        await fetch(CONFIG.SHEET_URL, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(p),
        });
        if (this.pending === p) { this.pending = null; try { localStorage.removeItem("wbs_pending"); } catch (e) {} }
      } catch (e) {
        setTimeout(() => this.flush(), 4000); // weak signal: retry quietly
      }
    },
  };
  window.addEventListener("online", () => Saver.flush());
  // resend anything left over from a previous visit (e.g. lost signal)
  try {
    const left = JSON.parse(localStorage.getItem("wbs_pending") || "null");
    if (left) { Saver.pending = left; Saver.flush(); }
  } catch (e) {}

  // ---------- HUD ----------
  let progressSteps = ["About you", "Lecture Theatre", "Library", "Café", "Careers Office", "Suggestion Box"];
  function setProgress(name) {
    const i = progressSteps.indexOf(name);
    const p = $("#progress");
    p.innerHTML = "";
    p.append(el("span", null, t("ui.floor") + " " + Math.max(1, i + 1) + "/" + progressSteps.length));
    const bar = el("div", "bar");
    progressSteps.forEach((_, k) => bar.append(el("i", "seg" + (k < i ? " done" : k === i ? " now" : ""))));
    p.append(bar);
  }
  function showHud(on) { hud.hidden = !on; }
  $("#btn-voice").onclick = (e) => { e.currentTarget.classList.toggle("off", !Sound.toggleVoice()); };
  $("#btn-music").onclick = (e) => { e.currentTarget.classList.toggle("off", !Sound.toggleMusic()); };
  $("#btn-fast").onclick = (e) => {
    const on = document.body.classList.toggle("fast");
    e.currentTarget.classList.toggle("off", !on);
    toast(on ? t("ui.fastOn") : t("ui.fastOff"));
  };
  $("#btn-fast").classList.add("off");
  function toast(text) {
    const b = el("div", "bubble", esc(text));
    b.style.left = "50%"; b.style.top = "10px"; b.style.transform = "translateX(-50%)";
    fx.append(b); setTimeout(() => b.remove(), 1400);
  }

  // ---------- stage ----------
  let bgRedraw = null;
  function setBg(src) {
    bgEl.innerHTML = ""; bgRedraw = null;
    if (typeof src === "function") {
      bgEl.style.backgroundImage = "none";
      const draw = () => {
        bgEl.innerHTML = "";
        const c = document.createElement("canvas");
        const w = Math.ceil(stage.clientWidth / 4), h = Math.ceil(stage.clientHeight / 4);
        c.width = Math.max(40, w); c.height = Math.max(40, h);
        const g = c.getContext("2d");
        src(g, c.width, c.height);
        bgEl.append(c);
      };
      bgRedraw = draw; draw();
    } else {
      bgEl.style.backgroundImage = src ? "url(" + src + ")" : "none";
    }
  }
  window.addEventListener("resize", () => bgRedraw && bgRedraw());
  function clearStage() { scenery.innerHTML = ""; actors.innerHTML = ""; fx.innerHTML = ""; }
  function setPanel(...nodes) { panel.innerHTML = ""; nodes.forEach((n) => n && panel.append(n)); panel.scrollTop = 0; }

  function addActor(look, opts = {}) {
    const sprite = new Pixel.Sprite(look, opts.scale || 4);
    const wrap = el("div", "actor");
    wrap.append(sprite.el);
    if (opts.name) wrap.append(el("span", "name-tag", esc(opts.name)));
    wrap.style.left = (opts.x ?? 50) + "%";
    if (opts.bottom != null) wrap.style.bottom = opts.bottom;
    if (opts.hidden) wrap.style.opacity = 0;
    actors.append(wrap);
    if (opts.flip) sprite.face(true);
    const a = { sprite, wrap, x: opts.x ?? 50 };
    return a;
  }
  async function walk(a, x, pctPerSec = 28) {
    const dist = Math.abs(x - a.x);
    if (!dist) return;
    const ms = isFast() ? 1 : (dist / pctPerSec) * 1000;
    a.sprite.face(x < a.x);
    a.sprite.set("walk");
    a.wrap.style.transitionDuration = ms + "ms";
    a.wrap.style.left = x + "%";
    a.x = x;
    const steps = setInterval(() => Sound.sfx("step"), 280);
    await sleep(ms);
    clearInterval(steps);
    a.wrap.style.transitionDuration = "0ms";
    a.sprite.set("idle");
  }
  function fadeActor(a, on) { a.wrap.style.transitionDuration = "300ms"; a.wrap.style.opacity = on ? 1 : 0; }

  // speech bubble above an actor (or top of stage)
  function bubble(a, text, speaker, ms = 2600) {
    fx.querySelectorAll(".bubble.stage-b").forEach((b) => b.remove());
    const b = el("div", "bubble stage-b", (speaker ? "<b>" + esc(speaker) + "</b>" : "") + esc(text));
    fx.append(b);
    const sw = stage.clientWidth, sh = stage.clientHeight;
    let left = 10, top = 10;
    if (a) {
      const r = a.wrap.getBoundingClientRect(), s = stage.getBoundingClientRect();
      left = r.left - s.left + r.width / 2 - 24;
      top = r.top - s.top - b.offsetHeight - 16;
    }
    left = Math.max(6, Math.min(sw - b.offsetWidth - 6, left));
    top = Math.max(6, Math.min(sh - b.offsetHeight - 6, top));
    b.style.left = left + "px"; b.style.top = top + "px";
    const t = setTimeout(() => b.remove(), isFast() ? Math.max(ms, 1500) : ms);
    return { remove() { clearTimeout(t); b.remove(); } };
  }

  async function wipe(mid) {
    const w = el("div", "wipe");
    for (let i = 0; i < 8 * 12; i++) { const c = el("i"); c.style.animationDelay = (Math.random() * 0.25).toFixed(2) + "s"; w.append(c); }
    app.append(w);
    Sound.sfx("whoosh");
    await sleep(600);
    if (mid) await mid();
    w.classList.add("out");
    await sleep(600);
    w.remove();
  }

  // ---------- dialogue ----------
  function say(speaker, text, opts = {}) {
    return new Promise((resolve) => {
      const box = el("div", "box tap-anywhere");
      box.append(el("span", "speaker", esc(speaker)));
      const p = el("div", "dialogue-text");
      box.append(p);
      const hint = el("span", "next-hint", "▶");
      hint.hidden = true;
      box.append(hint);
      const extra = opts.after ? opts.after : null;
      setPanel(box, extra);
      const full = subtitle(text);
      let i = 0, typing = true;
      if (opts.talker) opts.talker.sprite.set("talk");
      if (opts.vo) Sound.speak(opts.vo);
      const tick = () => {
        if (!typing) return;
        i += 1;
        p.textContent = full.slice(0, i);
        if (i % 3 === 0 && !opts.vo) Sound.sfx("type");
        if (i >= full.length) finish(); else setTimeout(tick, isFast() ? 0 : 22);
      };
      const finish = () => {
        typing = false; p.textContent = full; hint.hidden = false;
        if (opts.talker) setTimeout(() => opts.talker.sprite.set(opts.endPose || "idle"), 400);
      };
      tick();
      const onTap = () => {
        if (!box.isConnected) { panel.removeEventListener("click", onTap); return resolve(); }
        if (typing) { finish(); return; }
        panel.removeEventListener("click", onTap);
        Sound.sfx("blip");
        if (opts.vo && !opts.keepVoice) Sound.stopVoice();
        resolve();
      };
      setTimeout(() => panel.addEventListener("click", onTap), 150);
    });
  }

  // ---------- question UI ----------
  let idleTimer = null, maxActor = null;
  function armIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (maxActor && maxActor.wrap.isConnected) {
        bubble(maxActor, pick(t("idleQuips")), CONFIG.GUIDE_NAME, 3500);
        maxActor.sprite.set("talk"); setTimeout(() => maxActor.sprite.set("idle"), 1500);
      }
    }, 15000);
  }

  const HEART_SVG = '<svg viewBox="0 0 10 9" shape-rendering="crispEdges"><path d="M1 0h3v1h2V0h3v1h1v4H9v1H8v1H7v1H6v1H4V8H3V7H2V6H1V5H0V1h1z" fill="#000"/><path class="fill" d="M1 1h3v1h2V1h3v4H8v1H7v1H6v1H4V7H3V6H2V5H1z" fill="#f3ead6"/><path d="M2 2h1v1H2z" fill="#fff"/></svg>';

  function qText(q) {
    const tr = q.id ? dig(L, "questions." + q.id) || dig(EN, "questions." + q.id) : null;
    return fill(tr || q.text);
  }
  function fill(text) {
    const spec = state.courseCode && MODULE_COURSES[state.courseCode];
    return text.replace(/\{course\}/g, state.course || "your course")
      .replace(/\{specialism\}/g, spec ? spec.module : "your specialism module")
      .replace(/\{specIcon\}/g, spec ? spec.icon : "⭐");
  }

  // The avatar runs to an answer and jumps on it.
  function makeChooser(arena, look) {
    const s = new Pixel.Sprite(look, 3);
    const w = el("div", "chooser"); w.append(s.el); arena.append(w);
    const SW = 48, SH = 72;
    const pos = { x: 0, y: 0 };
    let token = 0;
    const place = () => { w.style.transform = `translate(${pos.x}px, ${pos.y}px)`; };
    const floorY = () => arena.clientHeight - SH - 6;
    pos.x = 6; pos.y = floorY(); place();
    async function arc(tx, ty, ms, height, my) {
      const sx = pos.x, sy = pos.y;
      const peak = Math.min(sy, ty) - height;
      s.set("jump"); Sound.sfx("jump");
      await tween(ms, (t) => {
        if (my !== token) return;
        pos.x = sx + (tx - sx) * t;
        // quadratic through peak
        const lin = sy + (ty - sy) * t;
        const bump = (peak - Math.min(sy, ty)) * 4 * t * (1 - t);
        pos.y = lin + bump; place();
      });
    }
    return {
      sprite: s,
      async jumpTo(btn) {
        const my = ++token;
        const tx = btn.offsetLeft + btn.offsetWidth / 2 - SW / 2;
        const top = btn.offsetTop - SH + 8;
        if (isFast()) { pos.x = tx; pos.y = floorY(); place(); btn.classList.add("squash"); Sound.sfx("boing"); setTimeout(() => btn.classList.remove("squash"), 400); return; }
        // run along the floor if we're on it
        if (Math.abs(pos.y - floorY()) < 4 && Math.abs(tx - pos.x) > 6) {
          s.face(tx < pos.x); s.set("walk");
          const sx = pos.x, d = Math.abs(tx - sx);
          const stepT = setInterval(() => Sound.sfx("step"), 150);
          await tween(Math.min(450, d * 1.6), (t) => { if (my === token) { pos.x = sx + (tx - sx) * t; place(); } });
          clearInterval(stepT);
          if (my !== token) return;
          if (Math.random() < 0.12) { s.set("jump"); await sleep(120); } // a little stumble
        }
        await arc(tx, top, 380, 34, my);
        if (my !== token) return;
        s.set("idle");
        btn.classList.remove("squash"); void btn.offsetWidth; btn.classList.add("squash");
        Sound.sfx("boing");
        await sleep(260);
        if (my !== token) return;
        await arc(tx, floorY(), 320, 18, my);
        if (my !== token) return;
        s.set("idle");
      },
      reset() { pos.y = floorY(); place(); },
    };
  }

  // Shows one question; resolves with the answer (null if skipped)
  function ask(q, speaker, npc) {
    return new Promise((resolve) => {
      armIdle();
      const box = el("div", "box");
      box.append(el("span", "speaker", esc(speaker)));
      box.append(el("div", "dialogue-text q", esc(qText(q))));
      if (npc) { npc.sprite.set("talk"); setTimeout(() => npc.sprite.set("idle"), 1200); }
      const arena = el("div", "arena");
      const nextRow = el("div", "next-row");
      let value = null;

      const done = (v) => { clearTimeout(idleTimer); resolve(v); };
      const showNext = () => {
        if (nextRow.childElementCount) return;
        const b = el("button", "btn primary", t("ui.next"));
        b.onclick = () => { Sound.sfx("select"); done(value); };
        nextRow.append(b);
        arena.after(nextRow);
        setTimeout(() => b.scrollIntoView({ block: "nearest", behavior: "smooth" }), 30);
      };

      if (q.type === "text") {
        setPanel(box, arena);
        runTextQuestion(arena, q).then(done);
        return;
      }

      let group;
      if (q.type === "yesno" || q.type === "choice") {
        const opts = q.type === "yesno" ? ["Yes", "No"] : q.options;
        group = el("div", q.type === "yesno" || opts.every((o) => o.length < 10) && opts.length <= 2 ? "grid-yesno" : "");
        opts.forEach((o) => {
          const b = el("button", "btn", esc(opt(o)));
          b.onclick = () => choose(b, o);
          group.append(b);
        });
      } else if (q.type === "hearts") {
        group = el("div", "hearts");
        for (let n = 1; n <= 10; n++) {
          const b = el("button", "heart", HEART_SVG + "<span>" + n + "</span>");
          b.setAttribute("aria-label", t("ui.outOf10", { n }));
          b.onclick = () => choose(b, n);
          group.append(b);
        }
      }
      arena.append(group);
      if (q.type === "hearts") arena.append(el("div", "scale-labels", "<span>" + esc(t("ui.veryPoor")) + "</span><span>" + esc(t("ui.excellent")) + "</span>"));
      setPanel(box, arena);
      const chooser = makeChooser(arena, state.look);

      function choose(b, v) {
        armIdle();
        value = v;
        Sound.sfx("blip");
        group.querySelectorAll(".btn").forEach((x) => x.classList.toggle("chosen", x === b));
        if (q.type === "hearts") group.querySelectorAll(".heart").forEach((h, k) => h.classList.toggle("on", k < v));
        chooser.jumpTo(b).then(() => { if (value === v) showNext(); });
        if (isFast()) showNext();
      }
    });
  }

  async function runTextQuestion(arena, q) {
    const zone = el("div", "pencil-zone");
    arena.style.paddingBottom = "8px";
    arena.append(zone);
    const s = new Pixel.Sprite(state.look, 3);
    const w = el("div", "chooser"); w.append(s.el); zone.append(w);
    const pencil = el("div", "pencil"); zone.append(pencil);
    const zw = () => zone.clientWidth;
    let x = -50;
    const place = () => { w.style.transform = `translate(${x}px, 12px)`; pencil.style.transform = `translate(${x - 24}px, 4px) rotate(-20deg)`; pencil.style.left = "0"; };
    place();
    // walk in wobbling with a giant pencil
    if (!isFast()) {
      s.set("walk");
      const stepT = setInterval(() => Sound.sfx("step"), 170);
      await tween(900, (t) => { x = -50 + (zw() / 2 - 24 + 50) * t; place(); pencil.style.transform += ` rotate(${Math.sin(t * 20) * 6}deg)`; });
      clearInterval(stepT);
      s.set("idle");
      await sleep(150);
    } else { x = zw() / 2 - 24; place(); }
    // drop it! CLONK
    pencil.style.left = "50%";
    pencil.style.transform = "";
    pencil.classList.add("drop");
    await sleep(320);
    Sound.sfx("clonk");
    for (let i = 0; i < 6; i++) {
      const d = el("i", "dust");
      d.style.left = (zw() / 2 - 30 + i * 12) + "px"; d.style.top = "64px";
      d.style.setProperty("--dx", (i - 3) * 6 + "px");
      zone.append(d); setTimeout(() => d.remove(), 600);
    }
    if (maxActor && maxActor.wrap.isConnected && Math.random() < 0.6) bubble(maxActor, pick(t("pencilQuips")), CONFIG.GUIDE_NAME, 2200);
    // avatar sits on the pencil swinging its legs
    s.set("sit");
    // text box springs up out of the floor
    const ta = el("textarea", "note");
    ta.placeholder = t("ui.startWriting");
    ta.maxLength = 2000;
    ta.setAttribute("aria-label", qText(q));
    arena.append(ta);
    const row = el("div", "row next-row");
    row.style.marginTop = "16px";
    const skip = el("button", "btn ghost", t("ui.skip"));
    const send = el("button", "btn primary", t("ui.submit"));
    row.append(skip, send);
    arena.append(row);
    let cheer = null;
    ta.addEventListener("input", () => {
      armIdle();
      if (!cheer && ta.value.length > 12 && maxActor && Math.random() < 0.5) {
        cheer = bubble(maxActor, t("lines.goOn"), CONFIG.GUIDE_NAME, 1800);
      }
    });
    return new Promise((res) => {
      skip.onclick = () => { Sound.sfx("blip"); res(null); };
      send.onclick = () => { Sound.sfx("select"); const v = ta.value.trim(); res(v || null); };
    });
  }

  function questionList(qs) {
    return qs.filter((q) => !q.showIf || q.showIf(state.answers, state));
  }
  // asks questions in order; follow-ups are re-checked after each answer
  async function askAll(qs, speaker, npc) {
    for (const q of qs) {
      if (q.showIf && !q.showIf(state.answers, state)) continue;
      const v = await ask(q, speaker, npc);
      if (v != null) state.answers[q.id] = v; else delete state.answers[q.id];
      if (npc) { npc.sprite.set("jump"); setTimeout(() => npc.sprite.set("idle"), 250); }
      if (maxActor && Math.random() < 0.45) bubble(maxActor, pick(t("answerQuips")), CONFIG.GUIDE_NAME, 2000);
    }
  }

  async function roomCleared(label) {
    const b = el("div", "banner", esc(t("ui.roomCleared")) + "<small>" + esc(label) + " ✅</small>");
    fx.append(b);
    Sound.sfx("cleared");
    setTimeout(() => Sound.sfx("coin"), 500);
    await sleep(1500);
    b.remove();
  }

  // ---------- procedural backgrounds ----------
  function drawWall(g, w, h, wall, mortar, floorA, floorB, floorTop) {
    g.fillStyle = wall; g.fillRect(0, 0, w, h);
    g.fillStyle = mortar;
    for (let y = 0; y < floorTop; y += 4) {
      g.fillRect(0, y, w, 1);
      for (let x = (y / 4) % 2 ? 0 : 4; x < w; x += 8) g.fillRect(x, y, 1, 4);
    }
    g.fillStyle = "#1f2f6b"; g.fillRect(0, floorTop - 3, w, 3);
    for (let y = floorTop; y < h; y += 6) for (let x = 0; x < w; x += 6) {
      g.fillStyle = ((x + y) / 6) % 2 ? floorA : floorB; g.fillRect(x, y, 6, 6);
    }
  }
  const drawFoyer = (g, w, h) => {
    const ft = Math.round(h * 0.72);
    drawWall(g, w, h, "#efe6d2", "#ddd0b4", "#8d93a8", "#9fa5b9", ft);
    g.fillStyle = "#c9d7ff";
    for (let x = 6; x < w - 10; x += Math.round(w / 5)) { g.fillRect(x, 4, 10, 6); }
    g.fillStyle = "#fff9c4";
    for (let x = 12; x < w; x += 24) g.fillRect(x, 0, 6, 1);
  };
  const drawCorridor = (g, w, h) => {
    const ft = Math.round(h * 0.72);
    drawWall(g, w, h, "#e4e7ef", "#d3d7e2", "#46507a", "#4d5885", ft);
    g.fillStyle = "#fffbd0";
    for (let x = 8; x < w; x += 22) g.fillRect(x, 1, 8, 2);
  };
  const drawCareers = (g, w, h) => {
    const ft = Math.round(h * 0.7);
    g.fillStyle = "#2e6f73"; g.fillRect(0, 0, w, ft);
    g.fillStyle = "#347d82"; for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 3, ft);
    g.fillStyle = "#8b6a4a"; g.fillRect(0, ft, w, h - ft);
    g.fillStyle = "#7a5c3f"; for (let y = ft; y < h; y += 4) g.fillRect(0, y, w, 1);
    // window
    g.fillStyle = "#000"; g.fillRect(6, 8, 30, 22); g.fillStyle = "#9ed0ff"; g.fillRect(7, 9, 28, 20);
    g.fillStyle = "#fff"; g.fillRect(10, 12, 8, 3); g.fillRect(22, 18, 9, 3); g.fillStyle = "#000"; g.fillRect(20, 9, 1, 20);
    // desk + laptop + plant
    const dx = Math.round(w * 0.6), dy = ft - 2;
    g.fillStyle = "#000"; g.fillRect(dx - 1, dy - 1, Math.round(w * 0.38) + 2, 7);
    g.fillStyle = "#a0784f"; g.fillRect(dx, dy, Math.round(w * 0.38), 5);
    g.fillStyle = "#333"; g.fillRect(dx + 8, dy - 9, 13, 9); g.fillStyle = "#6fd1ff"; g.fillRect(dx + 9, dy - 8, 11, 7);
    g.fillStyle = "#b5512b"; g.fillRect(8, ft - 8, 8, 8); g.fillStyle = "#3e9e4f"; g.fillRect(6, ft - 18, 12, 10); g.fillRect(10, ft - 22, 4, 4);
  };

  // =================================================================
  // SCENES
  // =================================================================

  // ---------- language picker ----------
  const LANG_ORDER = ["en", "zh", "hi", "ar", "es", "fr", "ko", "ja", "id", "pt"];
  const ENGLISH_NAMES = { en: "English", zh: "Chinese", hi: "Hindi", ar: "Arabic", es: "Spanish", fr: "French", ko: "Korean", ja: "Japanese", id: "Indonesian", pt: "Portuguese" };
  const FONTS = {
    zh: ["Noto+Sans+SC:wght@500;800", "'Noto Sans SC', sans-serif"],
    ja: ["DotGothic16", "'DotGothic16', sans-serif"],
    ko: ["Noto+Sans+KR:wght@500;800", "'Noto Sans KR', sans-serif"],
    hi: ["Noto+Sans+Devanagari:wght@500;800", "'Noto Sans Devanagari', sans-serif"],
    ar: ["Noto+Kufi+Arabic:wght@500;800", "'Noto Kufi Arabic', sans-serif"],
  };
  function applyLanguage(code) {
    L = LANG_PACKS[code] || EN;
    const root = document.documentElement;
    root.lang = L.meta.code;
    root.dir = L.meta.dir || "ltr";
    const f = FONTS[L.meta.code];
    if (f) {
      if (!document.getElementById("font-" + L.meta.code)) {
        const link = document.createElement("link");
        link.id = "font-" + L.meta.code; link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=" + f[0] + "&display=swap";
        document.head.append(link);
      }
      root.style.setProperty("--font-title", f[1]);
      root.style.setProperty("--font-body", f[1]);
      root.classList.add("nonlatin");
    } else {
      root.style.removeProperty("--font-title");
      root.style.removeProperty("--font-body");
      root.classList.remove("nonlatin");
    }
    document.title = t("ui.surveyTitle");
    Sound.setLanguage(L.meta.code, L.meta.speech, (n) => t("vo." + n));
  }

  async function sceneLanguage() {
    const codes = LANG_ORDER.filter((c) => LANG_PACKS[c]);
    const wanted = params.get("lang");
    if (wanted && LANG_PACKS[wanted]) { applyLanguage(wanted); return; }
    if (codes.length < 2) { applyLanguage("en"); return; }
    app.classList.remove("full");
    app.classList.add("picker");
    showHud(false);
    clearStage();
    setBg("assets/bg/letters.png");
    bgEl.style.filter = "brightness(.6)";
    const globe = el("div", "title-screen");
    globe.innerHTML = '<h1 style="font-size:44px">🌐</h1><div class="sub">WBS SURVEY</div>';
    fx.append(globe);
    const grid = el("div", "lang-grid");
    let chosen;
    const picked = new Promise((r) => (chosen = r));
    codes.forEach((c) => {
      const b = el("button", "btn lang-btn", '<span lang="' + c + '">' + esc(LANG_PACKS[c].meta.name) + "</span><small>" + ENGLISH_NAMES[c] + "</small>");
      b.onclick = () => { b.classList.add("chosen"); chosen(c); };
      grid.append(b);
    });
    setPanel(el("h2", "title", "🌐 LANGUAGE"), grid);
    const code = await picked;
    Sound.init();
    Sound.sfx("select");
    applyLanguage(code);
    app.classList.remove("picker");
    bgEl.style.filter = "";
    await sleep(250);
  }

  async function sceneTitle() {
    app.classList.add("full");
    showHud(false);
    clearStage();
    setBg("assets/bg/title.png");
    for (let i = 0; i < 4; i++) {
      const c = el("div", "cloud");
      c.style.top = (6 + i * 9) + "%"; c.style.width = (50 + i * 18) + "px";
      c.style.animationDuration = (26 + i * 9) + "s"; c.style.animationDelay = -(i * 8) + "s";
      scenery.append(c);
    }
    // tiny students walking past
    for (let i = 0; i < 3; i++) {
      const look = { skin: (i * 3) % 8, hair: pick(Pixel.HAIR_STYLES), hairColor: i, outfit: pick(Pixel.OUTFITS), outfitColor: (i * 2 + 1) % 8, accessory: "none" };
      const s = new Pixel.Sprite(look, 2); s.set("walk");
      const w = el("div", "walker"); w.append(s.el);
      w.style.animationDuration = (11 + i * 4) + "s"; w.style.animationDelay = -(i * 5) + "s";
      scenery.append(w);
    }
    const already = (() => { try { return localStorage.getItem("wbs_done") === "1"; } catch (e) { return false; } })();
    const ts = el("div", "title-screen");
    ts.innerHTML = "<h1>" + t("ui.welcomeTo") + "<span>" + t("ui.surveyTitle") + '</span></h1><div class="sub">' + t("ui.tagline") + "</div>";
    if (already && !params.has("again")) {
      ts.append(el("div", "sub", t("ui.alreadyDone")));
      ts.append(el("div", "tip", t("ui.tellCoursemates")));
      fx.append(ts);
      return new Promise(() => {}); // end here
    }
    const start = el("button", "press-start", t("ui.pressStart"));
    ts.append(start);
    ts.append(el("div", "tip", esc(pick(t("tips")))));
    fx.append(ts);
    await new Promise((r) => (start.onclick = r));
    Sound.init();
    Sound.sfx("coin");
    Sound.music("title");
  }

  async function sceneAnonymity() {
    await wipe(() => {
      app.classList.remove("full");
      clearStage();
      setBg("assets/bg/lounge2.png");
      bgEl.style.filter = "brightness(.6)";
    });
    const box = el("div", "box");
    box.innerHTML = '<span class="lock-icon">🔒</span><div class="dialogue-text center">' + t("ui.anonymous") + "</div>";
    const b = el("button", "btn primary", t("ui.gotIt"));
    setPanel(el("h2", "title", esc(t("ui.beforeWeStart"))), box, b);
    Sound.sfx("ding");
    await new Promise((r) => (b.onclick = r));
    Sound.sfx("select");
  }

  function selectStage(look) {
    clearStage();
    bgEl.style.filter = "";
    setBg((g, w, h) => { g.fillStyle = "#14183a"; g.fillRect(0, 0, w, h); g.fillStyle = "#1c2150"; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 4); });
    scenery.append(el("div", "spotlight"), el("div", "platform"));
    const a = addActor(look, { x: 50, scale: 6, bottom: "calc(4% + 22px)" });
    return a;
  }

  async function sceneGender() {
    showHud(true);
    setProgress("About you");
    const me = selectStage(Pixel.NPC_LOOKS.mystery);
    const look = state.look;
    state.look = Pixel.NPC_LOOKS.mystery; // chooser is a mystery student for now
    const v = await ask({ type: "choice", text: t("ui.aboutYouQ"), options: ["Male", "Female", "Non-binary", "Prefer not to say"] }, t("ui.playerSelect"));
    state.look = look;
    state.gender = v;
    me.sprite.set("celebrate"); Sound.sfx("select");
    await sleep(500);
  }

  async function sceneCourse() {
    const me = selectStage(Pixel.NPC_LOOKS.mystery);
    const head = el("div", "box");
    head.append(el("span", "speaker", esc(t("ui.selectCourse"))));
    head.append(el("div", "dialogue-text q", esc(t("ui.whichCourse"))));
    const search = el("input", "search");
    search.type = "search"; search.placeholder = t("ui.searchCourses"); search.setAttribute("aria-label", "Search courses");
    const list = el("div");
    let chosen;
    const picked = new Promise((r) => (chosen = r));
    COURSE_GROUPS.forEach((g) => {
      const sec = el("div", "course-group");
      sec.append(el("div", "group-label", "▸ " + esc(t("courseGroups." + g.group).toUpperCase())));
      g.courses.forEach(([name, code]) => {
        const shown = name === "Other / Prefer not to say" ? t("otherCourse") : name;
        const b = el("button", "btn course-btn", (code ? '<span class="code">' + code + "</span>" : "") + esc(shown));
        b.dataset.search = (name + " " + shown + " " + (code || "")).toLowerCase();
        b.onclick = () => { Sound.sfx("select"); b.classList.add("flash"); chosen([name, code || null]); };
        sec.append(b);
      });
      list.append(sec);
    });
    search.oninput = () => {
      const q = search.value.trim().toLowerCase();
      list.querySelectorAll(".course-group").forEach((sec) => {
        let any = false;
        sec.querySelectorAll(".course-btn").forEach((b) => { const ok = !q || b.dataset.search.includes(q); b.hidden = !ok; any = any || ok; });
        sec.hidden = !any;
      });
    };
    setPanel(head, search, list);
    const [name, code] = await picked;
    state.course = name; state.courseCode = code;
    if (code && MODULE_COURSES[code]) progressSteps = ["About you", "Lecture Theatre", "Module Corridor", "Library", "Café", "Careers Office", "Suggestion Box"];
    setProgress("About you");
    await sleep(500);
    const hit = COURSE_QUIPS.find(([k]) => name.includes(k));
    const quip = hit ? t("courseQuips." + hit[0]) : t("ui.niceChoice");
    me.sprite.set("jump"); setTimeout(() => me.sprite.set("idle"), 300);
    await say("???", quip);
  }

  async function sceneCreator() {
    const me = selectStage(state.look);
    me.sprite.set("idle");
    const L = state.look;
    let firstChange = true;
    const rows = [
      { key: "skin", label: t("ui.skinTone"), list: Pixel.SKIN.map((_, i) => i), show: (v) => '<span class="swatch" style="background:' + Pixel.SKIN[v] + '"></span>' + (v + 1) },
      { key: "hair", label: t("ui.hair"), list: Pixel.HAIR_STYLES, show: (v) => esc(t("looks." + v)) },
      { key: "hairColor", label: t("ui.hairColour"), list: Pixel.HAIR_COLORS.map((_, i) => i), show: (v) => '<span class="swatch" style="background:' + Pixel.HAIR_COLORS[v] + '"></span>' },
      { key: "outfit", label: t("ui.outfit"), list: Pixel.OUTFITS, show: (v) => esc(t("looks." + v)) },
      { key: "outfitColor", label: t("ui.outfitColour"), list: Pixel.OUTFIT_COLORS.map((_, i) => i), show: (v) => '<span class="swatch" style="background:' + Pixel.OUTFIT_COLORS[v] + '"></span>' },
      { key: "accessory", label: t("ui.accessory"), list: Pixel.ACCESSORIES, show: (v) => esc(t("looks." + v)) },
    ];
    const head = el("h2", "title", esc(t("ui.createPlayer")));
    const wrap = el("div");
    const update = () => {
      me.sprite.setLook(L);
      wrap.querySelectorAll(".opt-row").forEach((r, i) => { r.querySelector(".val").innerHTML = rows[i].show(L[rows[i].key]); });
    };
    const changed = () => {
      Sound.sfx("poof");
      const sp = el("div", "bubble", "✨"); sp.style.left = "60%"; sp.style.top = "30%"; sp.style.padding = "2px 4px";
      fx.append(sp); setTimeout(() => sp.remove(), 300);
      if (firstChange) { firstChange = false; setTimeout(() => { Sound.speak(1); bubble(null, subtitle(VOtext(1)), "???", 3500); }, 400); }
    };
    rows.forEach((r) => {
      const row = el("div", "opt-row");
      const prev = el("button", "arrow", "◀"), next = el("button", "arrow", "▶");
      prev.setAttribute("aria-label", "Previous " + r.label); next.setAttribute("aria-label", "Next " + r.label);
      const mid = el("div", "opt-val", '<span class="lbl">' + r.label + '</span><span class="val"></span>');
      const step = (d) => { const i = r.list.indexOf(L[r.key]); L[r.key] = r.list[(i + d + r.list.length) % r.list.length]; update(); changed(); };
      prev.onclick = () => step(-1); next.onclick = () => step(1);
      row.append(prev, mid, next);
      wrap.append(row);
    });
    const rnd = el("button", "btn ghost", t("ui.random"));
    rnd.onclick = async () => {
      for (let k = 0; k < (isFast() ? 1 : 8); k++) {
        rows.forEach((r) => (L[r.key] = pick(r.list)));
        update(); Sound.sfx("blip"); await sleep(70);
      }
      changed();
    };
    const ready = el("button", "btn primary", t("ui.ready"));
    rnd.style.marginTop = "6px";
    setPanel(head, wrap, rnd, ready);
    update();
    await new Promise((r) => (ready.onclick = r));
    Sound.stopVoice();
    Sound.sfx("coin");
    me.sprite.set("celebrate");
    Saver.save("About you");
    state.done.add("About you");
    await sleep(600);
  }

  async function sceneArrival() {
    // walk down the autumn road towards WBS
    await wipe(() => {
      clearStage();
      setBg("assets/bg/road.png");
      setPanel(el("div", "box", '<div class="dialogue-text center">' + esc(t("ui.headingToWbs")) + "</div>"));
    });
    Sound.music("explore");
    for (let i = 0; i < 14; i++) {
      const leaf = el("div", "confetti");
      leaf.style.background = pick(["#e8a33a", "#d9782c", "#f2c14e", "#b5541c"]);
      leaf.style.left = Math.random() * 100 + "%";
      leaf.style.animationDuration = (3 + Math.random() * 3) + "s";
      leaf.style.animationDelay = Math.random() * 2 + "s";
      fx.append(leaf);
    }
    const walker = addActor(state.look, { x: -8 });
    await walk(walker, 108, 34);
    // past the "WBS Main Entrance" signpost
    await wipe(() => { clearStage(); setBg("assets/bg/signpost.png"); });
    const walker2 = addActor(state.look, { x: -8, bottom: "4%" });
    await walk(walker2, 108, 34);

    await wipe(() => {
      clearStage();
      setBg("assets/bg/entrance.png");
      setPanel();
    });
    const me = addActor(state.look, { x: -8 });
    await walk(me, 28, 30);
    Sound.sfx("door");
    await sleep(400);
    const max = addActor(MAX_LOOK, { x: 66, hidden: true, name: CONFIG.GUIDE_NAME });
    maxActor = max;
    fadeActor(max, true);
    await walk(max, 58, 20);
    max.sprite.face(true);
    bubble(max, "!", null, 900);
    Sound.sfx("ding");
    max.sprite.set("wave");
    me.sprite.face(false);
    hookMaxEasterEgg(max);

    await say(CONFIG.GUIDE_NAME, VOtext(2), { vo: 2, talker: max, endPose: "wave" });
    await say(CONFIG.GUIDE_NAME, VOtext(3), { vo: 3, talker: max });
    for (const n of [4, 5, 6, 7]) {
      me.sprite.set("jump"); setTimeout(() => me.sprite.set("idle"), 200); // nod
      await say(CONFIG.GUIDE_NAME, VOtext(n), { vo: n, talker: max });
    }
    await say(CONFIG.GUIDE_NAME, VOtext(8), { vo: 8, talker: max, endPose: "celebrate", keepVoice: true });
    walk(max, 50, 30).then(() => fadeActor(max, false));
    await sleep(300);
    await walk(me, 48, 30);
    fadeActor(me, false);
    Sound.sfx("door");
    await sleep(300);
  }

  function hookMaxEasterEgg(max) {
    let taps = 0;
    max.wrap.classList.add("tap");
    max.wrap.style.cursor = "pointer";
    max.wrap.onclick = (e) => {
      e.stopPropagation();
      taps++;
      Sound.sfx("blip");
      if (taps === 5) { bubble(max, t("lines.tickles"), CONFIG.GUIDE_NAME); }
      if (taps === 8) { bubble(max, t("lines.stopPoking"), CONFIG.GUIDE_NAME); }
      if (taps === 11) {
        bubble(max, t("lines.dance"), CONFIG.GUIDE_NAME);
        max.sprite.set("celebrate");
        setTimeout(() => max.sprite.set("idle"), 2400);
        taps = 0;
      }
    };
  }

  // ---------- the foyer hub ----------
  const HUB = ["lecture", "library", "cafe", "careers"];
  async function sceneFoyer(nextId, vo) {
    await wipe(() => {
      clearStage();
      app.classList.remove("full");
      setBg("assets/bg/foyer.png");
      setProgress(nextId ? ROOMS.find((r) => r.id === nextId).name : "Suggestion Box");
    });
    let target = null;
    HUB.forEach((id, i) => {
      const room = ROOMS.find((r) => r.id === id);
      const d = el("button", "door", '<span class="plaque">' + room.icon + '</span><span class="lbl">' + esc(roomName(id).toUpperCase()) + '</span><span class="knob"></span>');
      d.style.left = (4 + i * 24.5) + "%";
      d.setAttribute("aria-label", roomName(id));
      if (state.done.has(room.name)) d.classList.add("done");
      if (id === nextId) { d.classList.add("glow"); target = d; } else d.disabled = true;
      scenery.append(d);
    });
    const me = addActor(state.look, { x: 50, bottom: "3%" });
    const max = addActor(MAX_LOOK, { x: 64, bottom: "3%", name: CONFIG.GUIDE_NAME });
    maxActor = max; hookMaxEasterEgg(max);
    if (!target) return { me, max };
    const arrow = el("div", "arrow-down", "▼");
    arrow.style.left = "calc(" + target.style.left + " + 7%)"; arrow.style.bottom = "62%";
    scenery.append(arrow);
    let tapped = false;
    const doorTap = new Promise((r) => (target.onclick = () => { tapped = true; r(); }));
    if (vo) await Promise.race([say(CONFIG.GUIDE_NAME, VOtext(vo), { vo, talker: max, keepVoice: true }), doorTap]);
    if (!tapped) {
      setPanel(el("div", "box", '<span class="speaker">' + esc(CONFIG.GUIDE_NAME) + '</span><div class="dialogue-text">' + esc(t("ui.tapDoor")) + "</div>"));
      await doorTap;
    }
    Sound.stopVoice();
    Sound.sfx("select");
    arrow.remove();
    const doorX = parseFloat(target.style.left) + 9.5;
    walk(max, doorX + 8, 40);
    await walk(me, doorX, 40);
    Sound.sfx("door");
    fadeActor(me, false);
    await sleep(250);
  }


  // ---------- tap your student card on the reader ----------
  const CARD_SPOTS = {
    lecture: { bg: "assets/bg/cardreader.png", reader: { x: 0.413, y: 0.873 }, screen: { x: 0.625, y: 0.405 }, line: "lines.cardMax" },
    pgoffice: { bg: "assets/bg/pgoffice.png", reader: { x: 0.302, y: 0.619 }, screen: { x: 0.6, y: 0.36 }, line: "lines.cardMaxPG" },
  };
  async function sceneCardTap(spot = "lecture") {
    const SPOT = CARD_SPOTS[spot];
    await wipe(() => {
      clearStage();
      setBg(SPOT.bg);
      setPanel();
      app.classList.add("full");
    });
    // where the reader / room screen sit in the photo (fractions of the image)
    const IMG = { w: 120, h: 160 }, READER = SPOT.reader, SCREEN = SPOT.screen;
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const sc = Math.max(sw / IMG.w, sh / IMG.h);
    const ox = (sw - IMG.w * sc) / 2, oy = sh - IMG.h * sc;
    const at = (p) => ({ x: ox + p.x * IMG.w * sc, y: oy + p.y * IMG.h * sc });
    const rd = at(READER), scr = at(SCREEN);

    const ring = el("div", "reader-ring"); ring.style.left = rd.x + "px"; ring.style.top = rd.y + "px";
    const screenGlow = el("div", "screen-glow"); screenGlow.style.left = scr.x + "px"; screenGlow.style.top = scr.y + "px";
    screenGlow.textContent = t("ui.cardGranted");
    const head = el("div", "card-head", "<b>" + esc(t("ui.cardTitle")) + "</b><span>" + esc(t("ui.cardHint")) + '</span><em class="card-max"></em>');
    const sayHead = (txt) => { const m = head.querySelector(".card-max"); m.textContent = CONFIG.GUIDE_NAME + ": " + txt; m.classList.remove("pop"); void m.offsetWidth; m.classList.add("pop"); };
    // the student card: shows the player's own avatar
    const card = el("div", "idcard");
    const face = document.createElement("canvas"); face.width = 16; face.height = 12;
    const full = document.createElement("canvas"); full.width = 16; full.height = 24;
    Pixel.draw(full.getContext("2d"), state.look, "idle", 1);
    face.getContext("2d").drawImage(full, 0, 0, 16, 12, 0, 0, 16, 12);
    card.innerHTML = '<div class="lanyard"></div><div class="card-top">wbs</div><div class="card-body"></div><div class="card-strip"></div>';
    const body = card.querySelector(".card-body");
    body.append(face);
    body.append(el("div", "card-text", "<b>" + esc(t("ui.cardName")) + "</b><i></i><i></i><i></i>"));
    const auto = el("button", "btn ghost card-auto", esc(t("ui.cardAuto")));
    fx.append(ring, screenGlow, head);
    app.append(card, auto);
    fx.style.pointerEvents = "none";
    const max = addActor(MAX_LOOK, { x: 86, bottom: "2%", name: CONFIG.GUIDE_NAME, flip: true, scale: 3 });
    maxActor = max;
    sayHead(t(SPOT.line));

    // starting spot for the card (bottom middle)
    const placeAuto = () => {
      const a = app.getBoundingClientRect(), st = stage.getBoundingClientRect();
      auto.style.top = (head.getBoundingClientRect().bottom - a.top + 12) + "px";
      auto.style.left = (st.left - a.left + st.width / 2) + "px";
    };
    placeAuto();
    const home = () => {
      const a = app.getBoundingClientRect();
      const below = auto.getBoundingClientRect().bottom - a.top + 74;
      const st = stage.getBoundingClientRect();
      return { x: st.left - a.left + st.width / 2 - 20, y: Math.max(below, a.height * 0.38) };
    };
    let pos = home();
    const place = (rot) => { card.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${rot || 0}deg)`; };
    place(-8);
    const readerInApp = () => {
      const a = app.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { x: s.left - a.left + rd.x, y: s.top - a.top + rd.y };
    };

    let done;
    const finished = new Promise((r) => (done = r));
    let dragging = false, grab = { x: 0, y: 0 }, success = false;
    const CARD_W = 110, CARD_H = 72;
    async function succeed() {
      if (success) return; success = true;
      const r = readerInApp();
      pos = { x: r.x - CARD_W / 2, y: r.y - CARD_H / 2 - 6 };
      card.style.transition = "transform .18s steps(3)"; place(0);
      await sleep(200);
      Sound.sfx("blip"); await sleep(120); Sound.sfx("ding");
      ring.classList.add("ok"); screenGlow.classList.add("on");
      max.sprite.set("celebrate");
      sayHead(t("lines.cardDone"));
      await sleep(1100);
      Sound.sfx("door");
      card.style.transition = "transform .4s steps(5), opacity .4s steps(5)";
      pos.y += 220; place(12); card.style.opacity = 0;
      bgEl.classList.add("door-open");
      await sleep(600);
      done();
    }
    card.addEventListener("pointerdown", (e) => {
      if (success) return;
      dragging = true; card.setPointerCapture(e.pointerId);
      card.style.transition = "none";
      const a = app.getBoundingClientRect();
      grab = { x: e.clientX - a.left - pos.x, y: e.clientY - a.top - pos.y };
      Sound.sfx("blip");
    });
    card.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const a = app.getBoundingClientRect();
      pos = { x: e.clientX - a.left - grab.x, y: e.clientY - a.top - grab.y };
      place(0);
      const r = readerInApp();
      const cx = pos.x + CARD_W / 2, cy = pos.y + CARD_H / 2;
      ring.classList.toggle("near", Math.hypot(cx - r.x, cy - r.y) < 90);
    });
    const release = () => {
      if (!dragging) return; dragging = false;
      const r = readerInApp();
      const cx = pos.x + CARD_W / 2, cy = pos.y + CARD_H / 2;
      if (Math.hypot(cx - r.x, cy - r.y) < 70) succeed();
      else {
        sayHead(t("lines.cardMiss"));
        card.style.transition = "transform .25s steps(4)"; pos = home(); place(-8);
      }
    };
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
    auto.onclick = () => { auto.disabled = true; succeed(); };
    await finished;
    card.remove(); auto.remove();
    fx.style.pointerEvents = "";
  }

  // ---------- short walk-in shot (e.g. the District café entrance) ----------
  async function sceneWalkIn(bg, from = 10, to = 76) {
    await wipe(() => { clearStage(); setBg(bg); setPanel(); app.classList.add("full"); });
    const dir = to > from ? 1 : -1;
    const me = addActor(state.look, { x: from, bottom: "4%" });
    const max = addActor(MAX_LOOK, { x: from - 8 * dir, bottom: "4%", name: CONFIG.GUIDE_NAME });
    walk(max, to - 8 * dir, 30);
    await walk(me, to, 30);
    Sound.sfx("door");
    fadeActor(me, false); fadeActor(max, false);
    await sleep(300);
  }

  // ---------- a room ----------
  async function sceneRoom(room) {
    let npc;
    await wipe(() => {
      clearStage();
      app.classList.remove("full");
      bgEl.classList.remove("door-open");
      setBg(room.bg || (room.scene === "careers" ? drawCareers : drawCorridor));
      if (room.scene === "careers" && !room.bg) {
        const p = el("div");
        p.style.cssText = "position:absolute;right:6%;top:8%;background:#f6c343;font-family:'Press Start 2P';font-size:9px;padding:6px;box-shadow:0 0 0 3px #000";
        p.textContent = t("ui.careersSign");
        scenery.append(p);
      }
      if (room.id === "lecture") {
        // a sleepy student in the back row
        const z = el("div", "bubble", "z z z"); z.style.cssText += ";left:8%;top:30%;font-size:12px;padding:3px 6px";
        scenery.append(z);
      }
      setProgress(room.name);
      setPanel();
    });
    const me = addActor(state.look, { x: -8 });
    const max = addActor(MAX_LOOK, { x: -16, name: CONFIG.GUIDE_NAME });
    maxActor = max; hookMaxEasterEgg(max);
    const npcName = t("npcs." + room.npc.look);
    npc = addActor(Pixel.NPC_LOOKS[room.npc.look], { x: 80, flip: true, name: npcName });
    walk(max, 12, 30);
    await walk(me, 30, 30);
    if (room.id === "lecture") bubble(max, t("lines.sleepy"), CONFIG.GUIDE_NAME, 2400);
    await say(npcName, fill(t("greets." + room.id)), { talker: npc });
    await askAll(room.questions, npcName, npc);
    await roomCleared(roomName(room.id));
    state.done.add(room.name);
    Saver.save(room.name);
  }

  async function sceneCorridor(room) {
    await wipe(() => {
      clearStage();
      app.classList.remove("full");
      bgEl.classList.remove("door-open");
      setBg("assets/bg/corridor.png");
      setProgress(room.name);
      setPanel();
    });
    const doors = room.doors.map((d, i) => {
      const b = el("button", "door", '<span class="plaque">' + fill(d.icon) + '</span><span class="lbl">' + esc(d.short === "SPEC" ? fill(d.title).toUpperCase() : d.short) + '</span><span class="knob"></span>');
      b.style.left = (4 + i * 24.5) + "%";
      b.style.height = "40%"; b.style.bottom = "34%";
      b.disabled = true;
      scenery.append(b);
      return b;
    });
    const me = addActor(state.look, { x: -8, bottom: "3%" });
    const max = addActor(MAX_LOOK, { x: -16, bottom: "3%", name: CONFIG.GUIDE_NAME });
    maxActor = max; hookMaxEasterEgg(max);
    const profName = t("npcs.professor");
    const prof = addActor(Pixel.NPC_LOOKS.professor, { x: 88, bottom: "3%", flip: true, name: profName });
    walk(max, 8, 30);
    await walk(me, 22, 30);
    await say(profName, fill(t("greets.corridor")), { talker: prof });
    bubble(max, t("lines.corridorQuip"), CONFIG.GUIDE_NAME, 3200);
    for (let i = 0; i < room.doors.length; i++) {
      const d = room.doors[i], b = doors[i];
      b.disabled = false; b.classList.add("glow");
      const title = fill(d.title);
      setPanel(el("div", "box", '<span class="speaker">' + esc(profName) + '</span><div class="dialogue-text">' + t("ui.doorOf", { n: i + 1, title: esc(title) }) + "</div>"));
      await new Promise((r) => (b.onclick = r));
      Sound.sfx("door");
      b.classList.remove("glow"); b.disabled = true;
      await walk(me, parseFloat(b.style.left) + 9.5, 45);
      await askAll(d.questions, profName + " · " + (d.short === "SPEC" ? title : d.short), prof);
      b.classList.add("done");
      Sound.sfx("coin");
    }
    await roomCleared(roomName(room.id));
    state.done.add(room.name);
    Saver.save(room.name);
  }

  // ---------- suggestion box + shout-out wall ----------
  async function sceneSuggestions() {
    await wipe(() => {
      clearStage();
      setBg("assets/bg/lounge.png");
      setProgress("Suggestion Box");
      setPanel();
    });
    const box = el("div");
    box.style.cssText = "position:absolute;left:12%;bottom:14%;width:22%;height:30%;background:#c0392b;box-shadow:0 0 0 4px #000, inset -6px -6px 0 #962d22;display:flex;align-items:flex-start;justify-content:center;font-family:'Press Start 2P';font-size:7px;color:#fff;padding-top:14px;text-align:center;line-height:1.5";
    box.innerHTML = esc(t("ui.suggestionBox")) + "<div style='position:absolute;top:6px;left:25%;width:50%;height:4px;background:#000'></div>";
    box.style.animation = "glow 1s steps(2) infinite";
    const board = el("div");
    board.style.cssText = "position:absolute;right:6%;top:10%;width:40%;height:46%;background:#b88a57;box-shadow:0 0 0 4px #000, inset 0 0 0 5px #7d5a34;display:flex;flex-wrap:wrap;gap:4px;padding:10px;align-content:flex-start";
    board.innerHTML = "<div style='width:100%;font-family:var(--font-title);font-size:7px;color:#fff;text-shadow:1px 1px 0 #000'>" + esc(t("ui.shoutOutWall")) + "</div>";
    ["#fff59d", "#a5d6a7", "#90caf9", "#f8bbd0"].forEach((c) => { const n = el("i"); n.style.cssText = "width:18px;height:16px;background:" + c + ";box-shadow:0 0 0 2px #000"; board.append(n); });
    scenery.append(box, board);
    const me = addActor(state.look, { x: 50, bottom: "3%" });
    const max = addActor(MAX_LOOK, { x: 66, bottom: "3%", name: CONFIG.GUIDE_NAME, flip: true });
    maxActor = max; hookMaxEasterEgg(max);
    await say(CONFIG.GUIDE_NAME, VOtext(13), { vo: 13, talker: max });

    const q1 = { id: "raise_programme", type: "text", text: "Is there anything you would like us to raise with the programme team?" };
    const v1 = await ask(q1, t("ui.suggestionBox"));
    if (v1) {
      state.answers.raise_programme = v1;
      await walk(me, 30, 40);
      const note = el("div"); note.style.cssText = "position:absolute;width:14px;height:12px;background:#fff;box-shadow:0 0 0 2px #000;left:30%;bottom:30%;transition:all .5s steps(6)";
      fx.append(note); Sound.sfx("whoosh");
      await sleep(30); note.style.left = "22%"; note.style.bottom = "42%"; note.style.transform = "scale(.5) rotate(90deg)";
      await sleep(550); note.remove(); Sound.sfx("clonk"); await sleep(200); Sound.sfx("ding");
    }
    max.sprite.set("talk");
    bubble(max, t("lines.sayNice"), CONFIG.GUIDE_NAME, 3000);
    // the shout-out wall: the real WBS quote wall
    await wipe(() => { setBg("assets/bg/quotewall.png"); box.remove(); board.style.display = "none"; });
    const q2 = { id: "positive_feedback", type: "text", text: "Drop some positive feedback! What's been great about WBS so far?" };
    const v2 = await ask(q2, t("ui.shoutOutWall"));
    max.sprite.set("idle");
    if (v2) {
      state.answers.positive_feedback = v2;
      const n = el("div", "sticky", "♥");
      scenery.append(n); Sound.sfx("ding");
      for (let i = 0; i < 5; i++) {
        const h = el("div", "confetti"); h.textContent = "♥"; h.style.cssText += ";background:none;color:#e2574c;font-size:14px;left:" + (60 + Math.random() * 30) + "%;top:40%;animation:fall 2s linear reverse forwards";
        fx.append(h); setTimeout(() => h.remove(), 2000);
      }
      await sleep(800);
    }
    state.done.add("Suggestion Box");
    Saver.save("Completed");
    try { localStorage.setItem("wbs_done", "1"); } catch (e) {}
  }

  // ---------- finale ----------
  function drawBadge(c) {
    const g = c.getContext("2d"); c.width = 32; c.height = 32;
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    P(9, 3, 14, 2, "#000"); P(8, 5, 16, 11, "#000"); P(10, 16, 12, 2, "#000"); P(13, 18, 6, 5, "#000"); P(9, 23, 14, 6, "#000");
    P(10, 5, 12, 10, "#f6c343"); P(11, 15, 10, 2, "#e0a92a"); P(14, 17, 4, 6, "#e0a92a"); P(10, 24, 12, 4, "#1f2f6b");
    P(4, 6, 4, 2, "#000"); P(4, 8, 2, 5, "#000"); P(6, 12, 3, 2, "#000"); P(24, 6, 4, 2, "#000"); P(26, 8, 2, 5, "#000"); P(23, 12, 3, 2, "#000");
    P(12, 6, 2, 6, "#fff3b0"); P(14, 9, 4, 3, "#fff"); P(15, 8, 2, 5, "#fff");
    P(12, 25, 8, 1, "#f6c343");
  }
  function makeCertificate() {
    const c = document.createElement("canvas");
    c.width = 720; c.height = 480;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.fillStyle = "#14183a"; g.fillRect(0, 0, 720, 480);
    g.fillStyle = "#f6c343"; g.fillRect(12, 12, 696, 456);
    g.fillStyle = "#fffaf0"; g.fillRect(24, 24, 672, 432);
    g.fillStyle = "#1f2f6b";
    for (let x = 24; x < 696; x += 24) { g.fillRect(x, 24, 12, 8); g.fillRect(x + 12, 448, 12, 8); }
    g.textAlign = "center";
    g.fillStyle = "#14183a";
    const FT = getComputedStyle(document.documentElement).getPropertyValue("--font-title").trim() || "monospace";
    const FB = getComputedStyle(document.documentElement).getPropertyValue("--font-body").trim() || "sans-serif";
    g.font = "22px " + FT;
    g.fillText(t("ui.certTitle"), 360, 92, 640);
    g.font = "13px " + FT;
    g.fillText(t("ui.certSub"), 360, 122, 640);
    // avatar
    const a = document.createElement("canvas"); a.width = 16; a.height = 24;
    Pixel.draw(a.getContext("2d"), state.look, "celebrate", 1);
    g.drawImage(a, 90, 150, 112, 168);
    const b = document.createElement("canvas"); drawBadge(b);
    g.drawImage(b, 572, 150, 104, 104);
    g.textAlign = "left";
    g.fillStyle = "#3d55c4"; g.font = "16px " + FT;
    g.fillText(t("ui.certChampion1"), 232, 205, 330);
    g.fillText(t("ui.certChampion2"), 232, 235, 330);
    g.fillStyle = "#14183a"; g.font = "18px " + FB;
    g.fillText(t("ui.certComplete", { term: t("ui.term") }), 232, 275, 330);
    g.fillText(t("ui.certThanks"), 232, 305, 330);
    g.textAlign = "center"; g.fillStyle = "#6b7088"; g.font = "18px " + FB;
    g.fillText(t("ui.certFooter"), 360, 410, 640);
    // stamp
    g.strokeStyle = "#e2574c"; g.lineWidth = 6; g.beginPath(); g.arc(624, 330, 34, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#e2574c"; g.font = "10px 'Press Start 2P', monospace"; g.fillText("SSLC", 624, 328); g.fillText("2026", 624, 344);
    return c;
  }

  async function sceneFinale() {
    await wipe(() => {
      clearStage();
      setBg("assets/bg/curious.png");
      bgEl.style.filter = "saturate(1.15) brightness(1.05)";
      setPanel();
      setProgress("Suggestion Box");
      $("#progress").querySelectorAll(".seg").forEach((s) => { s.className = "seg done"; });
    });
    Sound.music(null);
    Sound.sfx("fanfare");
    const colors = ["#f6c343", "#e2574c", "#3d55c4", "#3fbf6f", "#ec8fa6", "#fff"];
    for (let i = 0; i < 60; i++) {
      const c = el("div", "confetti");
      c.style.background = pick(colors);
      c.style.left = Math.random() * 100 + "%";
      c.style.animationDuration = (2.5 + Math.random() * 3) + "s";
      c.style.animationDelay = Math.random() * 1.5 + "s";
      fx.append(c);
    }
    const me = addActor(state.look, { x: 38 });
    const max = addActor(MAX_LOOK, { x: 62, name: CONFIG.GUIDE_NAME, flip: true });
    maxActor = max; hookMaxEasterEgg(max);
    me.sprite.set("celebrate"); max.sprite.set("celebrate");
    const badge = document.createElement("canvas"); badge.className = "badge"; drawBadge(badge);
    const badgeBox = el("div", "center");
    badgeBox.append(badge, el("h2", "title", esc(t("ui.championTitle"))));
    await say(CONFIG.GUIDE_NAME, VOtext(14), { vo: 14, after: badgeBox, endPose: "celebrate" });
    me.sprite.set("idle");
    await say(CONFIG.GUIDE_NAME, VOtext(15), { vo: 15, talker: max });
    await say(CONFIG.GUIDE_NAME, VOtext(16), { vo: 16, talker: max, endPose: "wave", keepVoice: true });

    try { await document.fonts.ready; } catch (e) {}
    const cert = makeCertificate();
    const wrap = el("div", "cert-wrap");
    wrap.append(cert);
    const save = el("button", "btn primary", t("ui.saveBadge"));
    save.style.marginTop = "16px";
    save.onclick = () => {
      Sound.sfx("coin");
      const a = document.createElement("a");
      a.download = "wbs-feedback-champion.png";
      a.href = cert.toDataURL("image/png");
      document.body.append(a); a.click(); a.remove();
    };
    const bye = el("button", "btn ghost", t("ui.finish"));
    setPanel(el("h2", "title", esc(t("ui.yourCertificate"))), wrap, save, bye);
    await new Promise((r) => (bye.onclick = r));
    // goodbye: Max waves, camera pulls back to the building
    max.sprite.set("wave");
    await sleep(800);
    fadeActor(me, false); fadeActor(max, false);
    Sound.sfx("door");
    app.classList.add("full");
    showHud(false);
    const ts = el("div", "title-screen");
    ts.innerHTML = "<h1>" + t("ui.thanksFor") + "<span>" + t("ui.playing") + '</span></h1><div class="sub">' + t("ui.answersSent") + '</div><div class="tip" style="margin-top:auto">' + t("ui.shareLink") + "</div>";
    fx.append(ts);
    Sound.music("title");
  }

  // =================================================================
  // MAIN FLOW
  // =================================================================
  async function main() {
    await sceneLanguage();
    await sceneTitle();
    await sceneAnonymity();
    await sceneGender();
    await sceneCourse();
    await sceneCreator();
    await sceneArrival();
    await sceneWalkIn("assets/bg/reception.png", 92, 20);

    const vos = { lecture: 9, library: 10, cafe: 11, careers: 12 };
    for (const id of HUB) {
      const room = ROOMS.find((r) => r.id === id);
      await sceneFoyer(id, vos[id]);
      if (id === "lecture") await sceneCardTap();
      if (id === "cafe") await sceneWalkIn("assets/bg/district.png");
      await sceneRoom(room);
      if (id === "lecture") {
        const corridor = ROOMS.find((r) => r.id === "corridor");
        if (corridor.showIf(state.answers, state)) { await sceneCardTap("pgoffice"); await sceneCorridor(corridor); }
      }
    }
    await sceneSuggestions();
    await sceneFinale();
  }

  // preload backgrounds, then go
  ["letters", "title", "reception", "curious", "lounge2", "road", "signpost", "entrance", "foyer", "cardreader", "pgoffice", "lecture", "corridor", "library", "district", "cafe", "careers", "lounge", "quotewall"].forEach((n) => { const i = new Image(); i.src = "assets/bg/" + n + ".png"; });
  main().catch((e) => { console.error(e); setPanel(el("div", "box", esc(t("ui.error")))); });

  // test hooks (used by automated checks only)
  window.__wbs = { state, Saver };
})();
