/* Sultan Almansour · portfolio interactions */
(() => {
  "use strict";
  const doc = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- page load orchestration ---------- */
  const start = () => requestAnimationFrame(() => document.body.classList.add("loaded"));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(start);
  } else start();

  /* ---------- nav: scrolled state, progress, active link ---------- */
  const nav = $(".nav");
  const bar = $(".progress span");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 30);
    const max = doc.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    timelineProgress();
  };
  addEventListener("scroll", onScroll, { passive: true });

  const links = $$(".nav-links a");
  const sections = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => spy.observe(s));

  /* ---------- mobile menu ---------- */
  const toggle = $(".menu-toggle");
  const menu = $("#mobile-menu");
  const setMenu = open => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* ---------- reveal on scroll ---------- */
  $$(".reveal-stagger").forEach(group => {
    const kids = group.classList.contains("skill-group") ? $$(".chip", group) : Array.from(group.children);
    kids.forEach((k, i) => k.style.setProperty("--i", i));
  });
  $$(".certs .cert").forEach((c, i) => c.style.setProperty("--i", i));

  const revealTargets = $$(".reveal, .reveal-mask, .reveal-stagger, .tl-item, .paper-stage");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  revealTargets.forEach(t => (reduced ? t.classList.add("in") : io.observe(t)));

  /* ---------- timeline line draws with scroll ---------- */
  const tl = $(".timeline");
  const tlLine = $(".timeline-line span");
  function timelineProgress() {
    if (!tl || reduced) return;
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
    tlLine.style.transform = `scaleY(${p})`;
  }
  onScroll();

  /* ---------- hero: network canvas ---------- */
  const canvas = $(".net");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const hero = $(".hero");
    let W = 0, H = 0, dpr = 1, nodes = [], packets = [], bursts = [], running = true, raf = 0, last = 0;
    const mouse = { x: -9999, y: -9999 };
    const GOLD = "224,180,88", RED = "229,72,77", GREEN = "43,182,115", MIST = "201,212,229";

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(78, Math.max(28, (W * H) / 19000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() < 0.12 ? 2.8 : 1.4 + Math.random(),
        hub: i % 9 === 0
      }));
      packets = []; bursts = [];
    };
    const LINK = () => (W < 700 ? 110 : 150);

    const spawnPacket = () => {
      const a = nodes[(Math.random() * nodes.length) | 0];
      let best = null, bd = Infinity;
      for (const b of nodes) {
        if (b === a) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK() && d > 30 && d < bd * (0.6 + Math.random())) { best = b; bd = d; }
      }
      if (!best) return;
      const threat = Math.random() < 0.16;
      packets.push({ a, b: best, t: 0, speed: 0.006 + Math.random() * 0.008, threat, caughtAt: threat ? 0.45 + Math.random() * 0.35 : 2 });
    };

    const draw = now => {
      raf = 0;
      if (!running) return;
      const dt = Math.min(3, (now - last) / 16.67 || 1); last = now;
      ctx.clearRect(0, 0, W, H);
      const L = LINK();

      for (const n of nodes) {
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
      }
      // edges
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < L) {
            ctx.strokeStyle = `rgba(${MIST},${(1 - d / L) * 0.14})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        // cursor links
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 190) {
          ctx.strokeStyle = `rgba(${GOLD},${(1 - md / 190) * 0.55})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      // nodes
      for (const n of nodes) {
        const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const glow = md < 190 ? 1 - md / 190 : 0;
        ctx.fillStyle = n.hub ? `rgba(${GOLD},${0.55 + glow * 0.45})` : `rgba(${MIST},${0.35 + glow * 0.6})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + glow * 1.6, 0, Math.PI * 2); ctx.fill();
        if (n.hub) {
          ctx.strokeStyle = `rgba(${GOLD},0.18)`;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2); ctx.stroke();
        }
      }
      // packets
      if (Math.random() < 0.09 * dt && packets.length < 26) spawnPacket();
      packets = packets.filter(p => {
        p.t += p.speed * dt;
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        if (p.threat && p.t >= p.caughtAt) { bursts.push({ x, y, r: 2, life: 1 }); return false; }
        if (p.t >= 1) return false;
        const c = p.threat ? RED : GOLD;
        const tx = p.a.x + (p.b.x - p.a.x) * Math.max(0, p.t - 0.12), ty = p.a.y + (p.b.y - p.a.y) * Math.max(0, p.t - 0.12);
        const g = ctx.createLinearGradient(tx, ty, x, y);
        g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(1, `rgba(${c},0.9)`);
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = `rgba(${c},1)`;
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
        return true;
      });
      // threat caught: green shield burst
      ctx.lineWidth = 1.5;
      bursts = bursts.filter(b => {
        b.r += 0.9 * dt; b.life -= 0.022 * dt;
        if (b.life <= 0) return false;
        ctx.strokeStyle = `rgba(${GREEN},${b.life * 0.9})`;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(${GREEN},${b.life * 0.35})`;
        ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(0, 4 - b.r * 0.1), 0, Math.PI * 2); ctx.fill();
        return true;
      });

      raf = requestAnimationFrame(draw);
    };

    const play = () => { if (!raf && running && !reduced) { last = performance.now(); raf = requestAnimationFrame(draw); } };
    resize();
    if (reduced) { running = true; draw(performance.now()); running = false; }
    else play();

    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduced) { running = true; draw(performance.now()); running = false; } }, 150); });
    hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([e]) => { running = e.isIntersecting && !reduced; if (running) play(); }).observe(hero);
    document.addEventListener("visibilitychange", () => { running = !document.hidden && !reduced; if (running) play(); });
  }

  /* ---------- cursor glow + magnetic buttons + card spotlight ---------- */
  if (finePointer && !reduced) {
    const glow = $(".cursor-glow");
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, glowRaf = 0;
    const follow = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      glowRaf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(follow) : 0;
    };
    addEventListener("pointermove", e => {
      document.body.classList.add("has-pointer");
      tx = e.clientX; ty = e.clientY;
      if (!glowRaf) glowRaf = requestAnimationFrame(follow);
    }, { passive: true });

    $$(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) * 0.22}px`);
        btn.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
      });
      btn.addEventListener("pointerleave", () => { btn.style.setProperty("--mx", "0px"); btn.style.setProperty("--my", "0px"); });
    });

    $$(".skill-group").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--px", `${e.clientX - r.left}px`);
        card.style.setProperty("--py", `${e.clientY - r.top}px`);
      });
    });

    $$(".tilt").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1100px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- skills: evidence panel ---------- */
  const ev = $(".skill-evidence");
  const evSkill = $(".ev-skill", ev), evWhere = $(".ev-where", ev);
  const chips = $$(".chip");
  const showSkill = chip => {
    chips.forEach(c => c.classList.toggle("on", c === chip));
    evSkill.textContent = chip.textContent;
    const used = chip.dataset.used;
    evWhere.textContent = used ? used.split(" · ").join(", ") : "Listed on my CV.";
    ev.classList.remove("flash"); void ev.offsetWidth; ev.classList.add("flash");
  };
  chips.forEach(c => {
    c.addEventListener("click", () => showSkill(c));
    if (finePointer) c.addEventListener("pointerenter", () => showSkill(c));
    c.addEventListener("focus", () => showSkill(c));
  });

  /* ---------- project 1: terminal replay ---------- */
  const term = $("[data-terminal]");
  if (term) {
    const code = $(".term-body code", term);
    const script = [
      ["cmd", "python aws-security-auditor.py"],
      ["dim", "Auditing account ••••••••4821 (read-only, SecurityAudit policy)"],
      ["gap"],
      ["check", "PASS", "Root account: no access keys, MFA enabled"],
      ["check", "FAIL", "IAM users without MFA", "2 users"],
      ["check", "FAIL", "Access keys older than 90 days", "1 key"],
      ["check", "PASS", "No policies attached directly to users"],
      ["check", "PASS", "S3 Block Public Access enabled"],
      ["gap"],
      ["dim", "5 checks · 3 passed · 2 failed · 41s"],
      ["ok", "Report written to audit-report-2026-09-26.md"]
    ];
    const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const lineHTML = l => {
      switch (l[0]) {
        case "cmd": return `<span class="c-p">$</span> ${esc(l[1])}`;
        case "dim": return `<span class="c-dim">${esc(l[1])}</span>`;
        case "gap": return "";
        case "ok": return `<span class="c-ok">✓ ${esc(l[1])}</span>`;
        case "check": return `<span class="${l[1] === "PASS" ? "c-pass" : "c-fail"}">${l[1]}</span> ${esc(l[2])}${l[3] ? ` <span class="c-dim">(${esc(l[3])})</span>` : ""}`;
      }
    };
    let timer = [], played = false;
    const clear = () => { timer.forEach(clearTimeout); timer = []; };
    const run = () => {
      clear(); played = true;
      if (reduced) { code.innerHTML = script.map(lineHTML).join("\n"); return; }
      code.innerHTML = '<span class="c-p">$</span> <span class="typing"></span><span class="cur"></span>';
      const typing = $(".typing", code);
      const cmd = script[0][1];
      let t = 400;
      for (let i = 1; i <= cmd.length; i++) { timer.push(setTimeout(() => (typing.textContent = cmd.slice(0, i)), t)); t += 38 + Math.random() * 30; }
      t += 350;
      let html = lineHTML(script[0]);
      for (let i = 1; i < script.length; i++) {
        t += script[i][0] === "check" ? 520 : 260;
        const snapshot = (html += "\n" + lineHTML(script[i]));
        const final = i === script.length - 1;
        timer.push(setTimeout(() => { code.innerHTML = snapshot + (final ? '\n<span class="c-p">$</span> <span class="cur"></span>' : '<span class="cur"></span>'); }, t));
      }
    };
    new IntersectionObserver(([e], obs) => { if (e.isIntersecting && !played) { run(); obs.disconnect(); } }, { threshold: 0.4 }).observe(term);
    $(".term-replay", term).addEventListener("click", run);
  }

  /* ---------- project 2: pipeline animation ---------- */
  const pipe = $("[data-pipeline]");
  if (pipe) {
    const steps = $$(".pipe li", pipe);
    const log = $(".pipe-log", pipe);
    const events = [
      { ip: "203.0.113.47", proto: "ssh", note: "login attempt root/123456", bad: true, label: "brute force" },
      { ip: "198.51.100.12", proto: "telnet", note: "login attempt admin/admin", bad: true, label: "credential stuffing" },
      { ip: "203.0.113.91", proto: "ssh", note: "wget http://…/bot.sh", bad: true, label: "malware download" },
      { ip: "192.0.2.8", proto: "ssh", note: "banner grab, session closed", bad: false, label: "scan" }
    ];
    const msg = (step, e) => [
      `<span class="t">attacker</span> ${e.ip} → ${e.proto}:${e.proto === "ssh" ? 22 : 23}`,
      `<span class="t">cowrie</span>   session opened: ${e.note}`,
      `<span class="t">zeek</span>     conn.log + ${e.proto === "ssh" ? "ssh" : "conn"}.log features extracted`,
      e.bad ? `<span class="t">detector</span> <span class="bad">malicious · ${e.label}</span>` : `<span class="t">detector</span> <span class="good">${e.label} · low risk</span>`,
      `<span class="t">logstash</span> enriched event shipped`,
      `<span class="t">elastic</span>  indexed trappot-events`,
      `<span class="t">kibana</span>   dashboard updated`
    ][step];
    const push = html => {
      const p = document.createElement("p"); p.innerHTML = html; log.appendChild(p);
      while (log.children.length > 6) log.removeChild(log.firstChild);
    };
    let s = -1, ei = 0, loop = 0, visible = false;
    const tick = () => {
      if (!visible) return;
      s++;
      const e = events[ei % events.length];
      if (s >= steps.length) { s = -1; ei++; steps.forEach(li => li.classList.remove("active", "done", "flag")); loop = setTimeout(tick, 900); return; }
      steps.forEach((li, i) => { li.classList.toggle("active", i === s); li.classList.toggle("done", i < s); });
      if (s === 3 && e.bad) steps[3].classList.add("flag");
      push(msg(s, e));
      loop = setTimeout(tick, s === 3 ? 1300 : 750);
    };
    if (reduced) {
      steps.forEach(li => li.classList.add("done"));
      events.slice(0, 1).forEach(e => steps.forEach((_, i) => push(msg(i, e))));
    } else {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        clearTimeout(loop);
        if (visible) loop = setTimeout(tick, 400);
      }, { threshold: 0.3 }).observe(pipe);
    }
  }

  /* ---------- CV expand ---------- */
  const paper = $("#paper"), stage = $(".paper-stage"), ptoggle = $(".paper-toggle");
  if (ptoggle) {
    ptoggle.addEventListener("click", () => {
      const open = !paper.classList.contains("open");
      paper.classList.toggle("open", open);
      stage.classList.toggle("open", open);
      ptoggle.setAttribute("aria-expanded", String(open));
      ptoggle.textContent = open ? "Collapse CV" : "Show full CV";
      if (!open) stage.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  }

  /* ---------- copy email ---------- */
  const toast = $(".toast");
  let toastT;
  const say = t => { toast.textContent = t; toast.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("show"), 2200); };
  $$(".copy-email").forEach(b => b.addEventListener("click", async () => {
    const email = b.dataset.email;
    try { await navigator.clipboard.writeText(email); say("Email copied"); }
    catch {
      const ta = document.createElement("textarea"); ta.value = email; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); say("Email copied"); } catch { say(email); }
      ta.remove();
    }
  }));

  /* ---------- footer year ---------- */
  const y = $(".year"); if (y) y.textContent = new Date().getFullYear();
})();
