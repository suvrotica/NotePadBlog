<!-- src/lib/components/Sketch/Whiteboard.svelte -->
<script lang="ts">
  import type { SketchData } from './types';
  
  let { 
    readOnly = false,
    initialData = null,
    onUpdate = undefined
  } = $props<{
    readOnly?: boolean;
    initialData?: SketchData | null;
    onUpdate?: (data: SketchData) => void;
  }>();

  let canvas: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = $state(null);

  // Initialize canvas context
  $effect(() => {
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    ctx = context;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio;
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    
    // Scale for high DPI display
    ctx.scale(scale, scale);
  });

  // Load initial data
  $effect(() => {
    if (!canvas || !ctx || !initialData?.image) return;
    
    const image = new Image();
    image.onload = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      if (initialData.transform) {
        transform = initialData.transform;
        updateTransform();
      }
    };
    
    // Handle any potential errors loading the image
    image.onerror = (error) => {
      console.error('Error loading sketch image:', error);
    };
    
    image.src = initialData.image;
  });

  // Transform state
  let transform = $state({
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0
  });

  // Update transform with null checks
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

  // Drawing state
  let isDrawing = $state(false);
  let lastX = $state(0);
  let lastY = $state(0);

  function getCanvasCoordinates(e: PointerEvent) {
    if (!canvas || !ctx) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const matrix = ctx.getTransform().invertSelf();
    const transformedX = x * matrix.a + y * matrix.c + matrix.e;
    const transformedY = x * matrix.b + y * matrix.d + matrix.f;
    
    return { x: transformedX, y: transformedY };
  }

  function handlePointerDown(e: PointerEvent) {
    if (readOnly) return;
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    
    isDrawing = true;
    lastX = coords.x;
    lastY = coords.y;
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing || !ctx || !canvas) return;
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastX = coords.x;
    lastY = coords.y;
  }

  function handlePointerUp() {
    if (!isDrawing) return;
    isDrawing = false;
    
    if (onUpdate && canvas) {
      onUpdate({
        image: canvas.toDataURL(),
        transform: { ...transform }
      });
    }
  }
</script>


<div class="relative w-full h-full bg-white rounded-lg">
  <canvas
    bind:this={canvas}
    class="w-full h-full touch-none"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointerout={handlePointerUp}
    onpointercancel={handlePointerUp}
    style="touch-action: none"
  ></canvas>
</div>

<style>
  @reference "tailwindcss/theme";

  canvas {
    /* Improve stroke visibility */
    mix-blend-mode: normal;
  }

  /* Adjust stroke color based on theme */
  :global(.dark) canvas {
    stroke: theme(--color-white);
  }
</style>