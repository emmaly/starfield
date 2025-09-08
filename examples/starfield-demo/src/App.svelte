<script>
  import Starfield from '@emmaly/starfield';
  let speed = 0.25;
  let density = 2.0;
</script>

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
