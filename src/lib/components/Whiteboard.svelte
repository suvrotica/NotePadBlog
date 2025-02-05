<!-- src/lib/components/Whiteboard.svelte -->
<script lang="ts">
    // Props for the whiteboard
    let { 
      readOnly = false,
      initialData = null,
      onUpdate = undefined
    } = $props<{
      readOnly?: boolean;
      initialData?: any;
      onUpdate?: (data: any) => void;
    }>();
    
    // State for the canvas
    let canvas = $state<HTMLCanvasElement | null>(null);
    let ctx = $state<CanvasRenderingContext2D | null>(null);
    let transform = $state({
      scale: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0
    });
    
    // Touch/mouse state
    let isDrawing = $state(false);
    let lastX = $state(0);
    let lastY = $state(0);
    
    // Initialize canvas context
    $effect(() => {
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
    
      // Set initial transform
      updateTransform();
    });
    
    // Update canvas transform
    function updateTransform() {
      if (!ctx) return;
      ctx.setTransform(
        transform.scale * Math.cos(transform.rotation),
        transform.scale * Math.sin(transform.rotation),
        -transform.scale * Math.sin(transform.rotation),
        transform.scale * Math.cos(transform.rotation),
        transform.translateX,
        transform.translateY
      );
    }
    
    // Handle mouse/touch events
    function handlePointerDown(e: PointerEvent) {
      if (readOnly) return;
      isDrawing = true;
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return;
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    }
    
    function handlePointerMove(e: PointerEvent) {
      if (!isDrawing || !ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
    
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    
      lastX = x;
      lastY = y;
    }
    
    function handlePointerUp() {
      isDrawing = false;
      if (onUpdate) {
        onUpdate(getCanvasData());
      }
    }
    
    // Get canvas data for saving
    function getCanvasData() {
      if (!canvas) return null;
      return {
        image: canvas.toDataURL(),
        transform: { ...transform }
      };
    }
    
    // Handle rotation
    function rotate(angle: number) {
      transform.rotation += angle;
      updateTransform();
    }
    
    // Handle panning
    function pan(dx: number, dy: number) {
      transform.translateX += dx;
      transform.translateY += dy;
      updateTransform();
    }
    
    // Handle zooming
    function zoom(factor: number, centerX: number, centerY: number) {
      const oldScale = transform.scale;
      transform.scale *= factor;
      
      // Adjust translation to zoom around cursor
      transform.translateX -= (centerX * (factor - 1)) / oldScale;
      transform.translateY -= (centerY * (factor - 1)) / oldScale;
      
      updateTransform();
    }
    </script>
    
    <div class="relative w-full h-full">
      <canvas
  bind:this={canvas}
  class="w-full h-full touch-none"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointerout={handlePointerUp}
></canvas>
      
      {#if !readOnly}
        <div class="absolute bottom-4 right-4 flex gap-2">
          <button 
            onclick={() => rotate(Math.PI / 2)}
            class="p-2 bg-white rounded-full shadow-lg"
          >
            <svg><!-- Rotation icon --></svg>
          </button>
          <button 
            onclick={() => zoom(1.2, canvas?.width ?? 0 / 2, canvas?.height ?? 0 / 2)}
            class="p-2 bg-white rounded-full shadow-lg"
          >
            <svg><!-- Zoom in icon --></svg>
          </button>
          <button 
            onclick={() => zoom(0.8, canvas?.width ?? 0 / 2, canvas?.height ?? 0 / 2)}
            class="p-2 bg-white rounded-full shadow-lg"
          >
            <svg><!-- Zoom out icon --></svg>
          </button>
        </div>
      {/if}
    </div>