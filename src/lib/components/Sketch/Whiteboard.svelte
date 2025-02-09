<!-- src/lib/components/Sketch/Whiteboard.svelte -->
<script lang="ts">
  import type { 
    SketchData,
    WhiteboardProps
  } from './types';
  import type { 
    FabricCanvas,
    CanvasOptions,
    SVGOptions,
    FabricObject
  } from './fabric-types';
  import type { Object as FabricBaseObject } from 'fabric';
  
  let props = $props<{
    readOnly?: boolean;
    initialData?: SketchData | null;
    onUpdate?: ((data: SketchData) => void) | undefined;
  }>();

  // Derive props with defaults
  let readOnly = $derived(props.readOnly ?? false);
  let initialData = $derived(props.initialData);
  let onUpdate = $derived(props.onUpdate);

  // Canvas and state
  let canvasElement: HTMLCanvasElement | undefined = $state();
  let fabricCanvas: FabricCanvas | undefined = $state();
  let activeTool = $state<'select' | 'draw' | 'text' | 'rectangle' | 'circle'>('draw');
  let brushColor = $state('#000000');
  let brushWidth = $state(2);

  // Initialize Fabric.js canvas
  let initPromise = $state<Promise<void>>();
  $effect(() => {
    if (!canvasElement || typeof window === 'undefined') return;

    initPromise = initCanvas();
  });

  async function initCanvas() {
    const { Canvas, loadSVGFromString, Group } = await import('fabric');
    
    fabricCanvas = new Canvas(canvasElement!, {
      isDrawingMode: !readOnly && activeTool === 'draw',
      selection: !readOnly,
      width: canvasElement!.clientWidth,
      height: canvasElement!.clientHeight
    });

    // Set up drawing brush
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushWidth;
    }

    // Load initial data if provided
    if (initialData?.image) {
      try {
        loadSVGFromString(
          initialData.image,
          (elements, options) => {
            if (!fabricCanvas) return;
            fabricCanvas.clear();
            
            // Ensure we have an array of fabric objects
            if (Array.isArray(elements)) {
              const fabricObjects = elements.filter((obj): obj is FabricBaseObject => 
                obj != null && 'type' in obj
              );
              
              if (fabricObjects.length > 0) {
                const group = new Group(fabricObjects);
                fabricCanvas.add(group);
                fabricCanvas.renderAll();
              }
            }
          },
          { crossOrigin: 'anonymous' }
        );
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    }

    // Handle object modifications
    fabricCanvas.on('object:modified', handleUpdate);
    fabricCanvas.on('path:created', handleUpdate);
  }

  // Cleanup
  $effect(() => {
    return () => {
      fabricCanvas?.dispose();
    };
  });

  // Update drawing settings when tool changes
  $effect(() => {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = !readOnly && activeTool === 'draw';
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushWidth;
    }
  });

  // Handle updates and notify parent
  function handleUpdate() {
    if (!fabricCanvas || !onUpdate) return;
    
    const svgData = fabricCanvas.toSVG();
    onUpdate({
      image: svgData,
      transform: {
        scale: 1,
        rotation: 0,
        translateX: 0,
        translateY: 0
      }
    });
  }

  // Tool actions
  async function addText() {
    if (!fabricCanvas || readOnly) return;
    const { IText } = await import('fabric');
    
    const text = new IText('Click to edit', {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: brushColor
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    handleUpdate();
  }

  async function addRectangle() {
    if (!fabricCanvas || readOnly) return;
    const { Rect } = await import('fabric');
    
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: 'transparent',
      stroke: brushColor,
      strokeWidth: brushWidth
    });
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    handleUpdate();
  }

  async function addCircle() {
    if (!fabricCanvas || readOnly) return;
    const { Circle } = await import('fabric');
    
    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: 'transparent',
      stroke: brushColor,
      strokeWidth: brushWidth
    });
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    handleUpdate();
  }

  function clearCanvas() {
    if (!fabricCanvas || readOnly) return;
    fabricCanvas.clear();
    handleUpdate();
  }
</script>

<div class="relative w-full h-full bg-white rounded-lg">
  {#if !readOnly}
    <div class="absolute top-4 left-4 flex gap-2 bg-white/80 backdrop-blur rounded-lg p-2 shadow-lg">
      <!-- Tool Selection -->
      <button
        class="p-2 rounded-md transition-colors {activeTool === 'select' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-100'}"
        onclick={() => activeTool = 'select'}
        title="Select"
      >
        ✋
      </button>
      <button
        class="p-2 rounded-md transition-colors {activeTool === 'draw' ? 'bg-primary-100 text-primary-700' : 'hover:bg-neutral-100'}"
        onclick={() => activeTool = 'draw'}
        title="Draw"
      >
        ✏️
      </button>
      <button
        class="p-2 rounded-md transition-colors hover:bg-neutral-100"
        onclick={addText}
        title="Add Text"
      >
        T
      </button>
      <button
        class="p-2 rounded-md transition-colors hover:bg-neutral-100"
        onclick={addRectangle}
        title="Add Rectangle"
      >
        □
      </button>
      <button
        class="p-2 rounded-md transition-colors hover:bg-neutral-100"
        onclick={addCircle}
        title="Add Circle"
      >
        ○
      </button>

      <!-- Color and Width Controls -->
      <input
        type="color"
        bind:value={brushColor}
        class="w-8 h-8 rounded cursor-pointer"
        title="Color"
      />
      <input
        type="range"
        bind:value={brushWidth}
        min="1"
        max="20"
        class="w-24"
        title="Brush Width"
      />

      <!-- Clear Canvas -->
      <button
        class="p-2 rounded-md transition-colors hover:bg-red-100 text-red-600"
        onclick={clearCanvas}
        title="Clear Canvas"
      >
        🗑️
      </button>
    </div>
  {/if}

  <canvas
    bind:this={canvasElement}
    class="w-full h-full touch-none"
    style="touch-action: none"
  ></canvas>
</div>

<style>
  @reference "tailwindcss/theme";

  canvas {
    mix-blend-mode: normal;
  }

  :global(.dark) canvas {
    stroke: theme(--color-white);
  }
</style>