<script>
  import Starfield from '@emmaly/starfield';
  // Read version directly from the workspace root package.json for reliable local dev
  import pkg from '../../../package.json';
  let speed = 0.25;
  let density = 2.0;
  const version = pkg?.version ?? 'dev';
</script>

<a
  class="version-badge"
  href="https://www.npmjs.com/package/@emmaly/starfield"
  target="_blank"
  rel="noreferrer"
>
  v{version}
</a>

<Starfield initialSpeed={speed} initialDensity={density} maxDensity={6}>
  <div class="controls" slot="speed" let:setSpeedTarget let:speedFactor>
    <label for="speed-range">Speed</label>
    <input id="speed-range" type="range" min="0" max="3" step="0.01" bind:value={speed}
      on:input={(e)=>setSpeedTarget(parseFloat(e.currentTarget.value), 600)} />
    <span>{speed.toFixed(2)}</span>
  </div>
  <div class="controls" slot="density" let:setDensityTarget let:densityFactor let:maxDensity>
    <label for="density-range">Density</label>
    <input id="density-range" type="range" min="0.3" max={maxDensity} step="0.01" bind:value={density}
      on:input={(e)=>setDensityTarget(parseFloat(e.currentTarget.value), 700)} />
    <span>{density.toFixed(2)}×</span>
  </div>
</Starfield>

<style>
  .version-badge {
    position: fixed;
    top: 10px;
    right: 10px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    background: #0b5ed7;
    color: white;
    text-decoration: none;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    opacity: 0.9;
    z-index: 1000;
  }
  .version-badge:hover {
    opacity: 1;
  }
</style>
