<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  export let initialSpeed = 0.25;
  export let initialDensity = 2.0;
  export let maxDensity = 6.0;

  let canvas;
  let ctx;

  // Core config (ported)
  const FOV_DEGREES = 90;
  const BASE_SPEED = 12;
  const NEAR_Z = 0.1;
  const FAR_Z = 10;
  const BASE_DENSITY = 0.0010;
  const STAR_SIZE = { min: 0.7, max: 2.0 };
  const SPEED_JITTER = 0.25;
  const TWINKLE = 0.18;
  const COLOR1 = [207, 227, 255];
  const COLOR2 = [167, 193, 255];

  // State
  let stars = [];
  let lastTime;
  let cx = 0, cy = 0, focal = 1;
  let farFrustumHalfW = 1, farFrustumHalfH = 1;
  let vw = 0, vh = 0;

  // Speed ramp
  let speedFactor = initialSpeed;
  let speedFrom = initialSpeed, speedTo = initialSpeed, rampStart = 0, rampDuration = 0;

  // Density ramp
  let densityFactor = initialDensity;
  let densityFrom = initialDensity, densityTo = initialDensity, dRampStart = 0, dRampDuration = 0;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const easeInOutCubic = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  const randRange = (min, max) => min + Math.random() * (max - min);

  // Expose controls to slots via slot props
  function setSpeedTarget(v, ms = 600) {
    const value = Math.max(0, Number(v) || 0);
    speedFrom = speedFactor;
    speedTo = value;
    rampStart = performance.now();
    rampDuration = Math.max(0, ms);
  }
  function setDensityTarget(mult, ms = 700) {
    const value = Math.max(0.1, Number(mult) || 1);
    densityFrom = densityFactor;
    densityTo = Math.min(maxDensity, value);
    dRampStart = performance.now();
    dRampDuration = Math.max(0, ms);
  }

  function updateSpeedRamp(now) {
    if (rampDuration <= 0) { speedFactor = speedTo; return; }
    const t = clamp01((now - rampStart) / rampDuration);
    speedFactor = speedFrom + (speedTo - speedFrom) * easeInOutCubic(t);
    if (t >= 1) rampDuration = 0;
  }
  function updateDensityRamp(now) {
    if (dRampDuration <= 0) { densityFactor = densityTo; return; }
    const t = clamp01((now - dRampStart) / dRampDuration);
    densityFactor = densityFrom + (densityTo - densityFrom) * easeInOutCubic(t);
    if (t >= 1) dRampDuration = 0;
  }

  function makeStarAtDepth(z) {
    const halfW = (z * vw) / (2 * focal);
    const halfH = (z * vh) / (2 * focal);
    const x = randRange(-halfW, halfW);
    const y = randRange(-halfH, halfH);
    const speedMul = 1 + (Math.random() * 2 - 1) * SPEED_JITTER;
    const hueShift = Math.random();
    const brightness = randRange(0.65, 1.0);
    const size = randRange(STAR_SIZE.min, STAR_SIZE.max);
    return { x, y, z, speedMul, hueShift, brightness, size };
  }
  function newStarAtFar() {
    const z = FAR_Z + randRange(FAR_Z*0.05, FAR_Z*0.6);
    return makeStarAtDepth(z);
  }
  function newStarAnywhere() {
    return makeStarAtDepth(randRange(NEAR_Z, FAR_Z));
  }

  function adjustStarCount(target) {
    if (target < 0) target = 0;
    while (stars.length < target) stars.push(newStarAnywhere());
    while (stars.length > target) stars.pop();
  }
  function reconcileStarCount(target, maxStep) {
    if (target < 0) target = 0;
    if (stars.length < target) {
      const need = target - stars.length;
      const add = Math.min(need, maxStep);
      for (let i=0;i<add;i++) stars.push(newStarAnywhere());
    } else if (stars.length > target) {
      const over = stars.length - target;
      const rem = Math.min(over, maxStep);
      stars.length = stars.length - rem;
    }
  }

  function project(x,y,z) {
    return [cx + (x/z)*focal, cy + (y/z)*focal];
  }

  function advance(dt) {
    const speed = BASE_SPEED * speedFactor;
    const move = speed * dt;
    for (let i=0;i<stars.length;i++) {
      const s = stars[i];
      s.z -= move * s.speedMul;
      if (s.z <= NEAR_Z) {
        Object.assign(s, newStarAtFar());
      }
    }
  }

  function draw(now = performance.now()) {
    const w = vw, h = vh;
    ctx.fillStyle = '#080a12';
    ctx.fillRect(0,0,w,h);

    const order = [...stars.keys()].sort((a,b)=>stars[b].z - stars[a].z);
    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(207,227,255,0.65)';

    for (let idx=0; idx<order.length; idx++) {
      const s = stars[order[idx]];
      const z = Math.max(s.z, NEAR_Z + 1e-4);
      const [sx, sy] = project(s.x, s.y, z);
      if (sx < -30 || sx > w+30 || sy < -30 || sy > h+30) continue;

      const t = 1 - (z - NEAR_Z) / (FAR_Z - NEAR_Z);
      const r = Math.max(0.5, s.size * (0.7 + t*0.8));

      const tw = 1 + Math.sin((now*0.004 + idx*12.9898) % (Math.PI*2)) * TWINKLE;
      let alpha = Math.max(0, Math.min(1, (0.35 + s.brightness*0.65) * (1.0 - z/(FAR_Z*1.15)) * tw));
      const ne = Math.min(sx, sy, w - sx, h - sy);
      const edgeRadius = Math.min(w,h) * 0.12;
      const edgeBoost = Math.max(0, 1 - ne/edgeRadius) * 0.18;
      alpha = Math.max(0, Math.min(1, alpha * (1 + edgeBoost)));

      const mix = s.hueShift * 0.35;
      const col = [
        Math.round(COLOR2[0] + (COLOR1[0] - COLOR2[0]) * mix),
        Math.round(COLOR2[1] + (COLOR1[1] - COLOR2[1]) * mix),
        Math.round(COLOR2[2] + (COLOR1[2] - COLOR2[2]) * mix),
      ];
      ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha})`;
      ctx.fillRect(sx, sy, r, r);
    }
    ctx.restore();
  }

  function resize() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const w = Math.floor(window.innerWidth);
    const h = Math.floor(window.innerHeight);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    vw = w; vh = h; cx = vw/2; cy = vh/2;
    const fovRadians = (FOV_DEGREES*Math.PI)/180;
    focal = (0.5 * vh) / Math.tan(fovRadians/2);
    farFrustumHalfH = (FAR_Z * vh) / (2 * focal);
    farFrustumHalfW = (FAR_Z * vw) / (2 * focal);
    adjustStarCount(Math.round(vw*vh*BASE_DENSITY*densityFactor));
  }

  function frame(ts) {
    if (lastTime === undefined) {
      lastTime = ts;
      advance(10.0);
    }
    const dt = Math.min(0.05, (ts - lastTime)/1000);
    lastTime = ts;
    updateSpeedRamp(ts);
    updateDensityRamp(ts);
    const targetCount = Math.round(vw*vh*BASE_DENSITY*densityFactor);
    const maxStep = Math.max(10, Math.floor(1500 * dt));
    reconcileStarCount(targetCount, maxStep);
    advance(dt);
    draw(ts);
    raf = requestAnimationFrame(frame);
  }

  let raf;
  onMount(() => {
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', resize);
    resize();
    // Apply initial props immediately
    speedFactor = initialSpeed; speedFrom = initialSpeed; speedTo = initialSpeed; rampDuration = 0;
    densityFactor = Math.min(maxDensity, initialDensity); densityFrom = densityFactor; densityTo = densityFactor; dRampDuration = 0;
    adjustStarCount(Math.round(vw*vh*BASE_DENSITY*densityFactor));
    raf = requestAnimationFrame(frame);
  });
  onDestroy(() => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); });
</script>

<canvas bind:this={canvas} style="display:block; width:100vw; height:100vh;"></canvas>

<!-- Controls slots: expose control functions and current values -->
<div class="control-stack">
  <slot name="speed" {setSpeedTarget} {speedFactor}></slot>
  <slot name="density" {setDensityTarget} {densityFactor} {maxDensity}></slot>
</div>
