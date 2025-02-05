<!-- src/lib/components/Sketch/SketchGallery.svelte -->
<script lang="ts">
  import type { Sketch } from './types';
  import Whiteboard from './Whiteboard.svelte';
  
  let { sketches, onUpdate } = $props<{
    sketches: Sketch[];
    onUpdate: (sketch: Sketch) => void;
  }>();
  
  let selectedSketch = $state<Sketch | null>(null);
  let isEditMode = $state(false);
  
  function handleSketchClick(sketch: Sketch) {
    selectedSketch = sketch;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && selectedSketch) {
      selectedSketch = null;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
{#each sketches as sketch}
  <button 
    onclick={() => handleSketchClick(sketch)}
    class="group relative aspect-square overflow-hidden rounded-lg border 
           hover:border-blue-500 focus:border-blue-500 
           transition-colors duration-200"
    type="button"
  >
    <img 
      src={sketch.data.image} 
      alt={sketch.title}
      class="w-full h-full object-contain bg-white"
    />
    <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2
                opacity-0 group-hover:opacity-100 group-focus:opacity-100 
                transition-opacity duration-200">
      {sketch.title}
    </div>
  </button>
{/each}
</div>

{#if selectedSketch}
<div 
  role="dialog"
  aria-labelledby="sketch-modal-title"
  aria-modal="true"
  class="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
>
  <div 
    class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-4"
    role="document"
  >
    <div class="flex justify-between items-center mb-4">
      <h2 id="sketch-modal-title" class="text-xl font-bold">
        {selectedSketch.title}
      </h2>
      <div class="flex gap-2">
        <button
          onclick={() => isEditMode = !isEditMode}
          class="px-4 py-2 rounded bg-blue-500 text-white 
                 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 
                 transition-colors"
          type="button"
        >
          {isEditMode ? 'View' : 'Edit'}
        </button>
        <button
          onclick={() => selectedSketch = null}
          class="px-4 py-2 rounded bg-gray-500 text-white 
                 hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 
                 transition-colors"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
    
    <div class="h-[600px] bg-white rounded border">
      <Whiteboard
        initialData={selectedSketch.data}
        readOnly={!isEditMode}
        onUpdate={isEditMode ? (data) => {
          if (selectedSketch && onUpdate) {
            onUpdate({
              ...selectedSketch,
              data,
              updated: new Date().toISOString()
            });
          }
        } : undefined}
      />
    </div>
  </div>
</div>
{/if}