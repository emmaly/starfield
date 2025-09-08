# Emmaly's Starfield Component

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Demo](https://img.shields.io/badge/Demo-View%20site-blue)](https://emmaly.github.io/starfield/)

Live Demo: https://emmaly.github.io/starfield/

Provides a mesmerizing animated starfield as a Svelte component, rendering thousands of twinkling stars with smooth animations, perfect for backgrounds, loading screens, or just adding some magic to your project.

Built with performance in mind using the Canvas 2D API, so your starfield should run smoothly even on lower-end devices.

## Installation

### For New Projects

The easiest way to get started:

```bash
npm install github:emmaly/starfield svelte
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "@emmaly/starfield": "github:emmaly/starfield",
    "svelte": "^4.0.0"
  }
}
```

### For Local Development

If you're working locally or contributing:

```bash
# Clone the repository
git clone https://github.com/emmaly/starfield.git
cd starfield

# Install root dependencies
npm install

# Install and run the demo
cd examples/starfield-demo
npm install
npm run dev
```

## Basic Usage

Get started with just a few lines of code:

```svelte
<script>
  import Starfield from '@emmaly/starfield';
</script>

<!-- Simple starfield with default settings -->
<Starfield />
```

## Advanced Usage with Controls

Want to let users customize the starfield? Here's how to add interactive controls:

```svelte
<script>
  import Starfield from '@emmaly/starfield';
  let speed = 0.25;
  let density = 2.0;
</script>

<Starfield initialSpeed={speed} initialDensity={density} maxDensity={6}>
  <!-- Speed control -->
  <div class="controls" slot="speed" let:setSpeedTarget let:speedFactor>
    <label for="speed-range">Speed</label>
    <input 
      id="speed-range" 
      type="range" 
      min="0" 
      max="3" 
      step="0.01" 
      bind:value={speed}
      on:input={(e) => setSpeedTarget(parseFloat(e.currentTarget.value), 600)} 
    />
    <span>{speed.toFixed(2)}</span>
  </div>
  
  <!-- Density control -->
  <div class="controls" slot="density" let:setDensityTarget let:densityFactor let:maxDensity>
    <label for="density-range">Density</label>
    <input 
      id="density-range" 
      type="range" 
      min="0.3" 
      max={maxDensity} 
      step="0.01" 
      bind:value={density}
      on:input={(e) => setDensityTarget(parseFloat(e.currentTarget.value), 700)} 
    />
    <span>{density.toFixed(2)}×</span>
  </div>
</Starfield>
```

## Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `initialSpeed` | number | `0.25` | How fast the stars move (0 = stationary, 3 = very fast) |
| `initialDensity` | number | `2.0` | How many stars to show (higher = more stars) |
| `maxDensity` | number | `6` | Maximum allowed density value |

## Interactive Slots

The component provides slots with helper functions for creating interactive controls:

### Speed Slot
- `setSpeedTarget(value, ms)` - Smoothly animate to a new speed over `ms` milliseconds
- `speedFactor` - Current speed multiplier

### Density Slot  
- `setDensityTarget(value, ms)` - Smoothly animate to a new density over `ms` milliseconds
- `densityFactor` - Current density multiplier
- `maxDensity` - The maximum density value

## Development

Want to modify the component or see it in action?

1. **Run the demo:**
   ```bash
   # From the repo root
   cd examples/starfield-demo
   npm run dev
   ```

2. **Edit the component:** Make changes to `src/Starfield.svelte`

3. **See updates live:** The demo automatically reflects your changes when you reload the page

## Tips & Ideas

- **Background Effect:** Set a low speed (0.1-0.3) for a subtle background animation
- **Loading Screen:** Use higher speed (1-2) with medium density for an engaging loading effect  
- **Interactive Experience:** Combine both slots to let users customize their experience
- **Responsive Design:** The starfield automatically adapts to its container size

---

**Enjoy your starfield!** If you create something cool with this component, we'd love to see it!

## License

Released under the [MIT License](LICENSE).
