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
  let hasUnsavedChanges = $state(false);
  let editedSketchData = $state<any>(null);
  
  function handleSketchClick(sketch: Sketch) {
    selectedSketch = sketch;
    isEditMode = false;
    hasUnsavedChanges = false;
    editedSketchData = null;
  }

  function handleEdit(data: any) {
    editedSketchData = data;
    hasUnsavedChanges = true;
  }

  async function handleSave() {
    if (selectedSketch && editedSketchData && onUpdate) {
      const updatedSketch = {
        ...selectedSketch,
        data: editedSketchData,
        updated: new Date().toISOString()
      };
      await onUpdate(updatedSketch);
      selectedSketch = updatedSketch;
      hasUnsavedChanges = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && selectedSketch) {
      if (hasUnsavedChanges) {
        if (confirm('You have unsaved changes. Are you sure you want to close?')) {
          closeModal();
        }
      } else {
        closeModal();
      }
    }
  }

  function closeModal() {
    selectedSketch = null;
    isEditMode = false;
    hasUnsavedChanges = false;
    editedSketchData = null;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Gallery Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
  {#each sketches as sketch (sketch.id)}
    <button 
      onclick={() => handleSketchClick(sketch)}
      class="group relative aspect-square overflow-hidden rounded-lg border
             border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900
             hover:border-primary-500 focus:border-primary-500 
             focus:outline-none focus:ring-2 focus:ring-primary-500
             transition-all duration-200"
      type="button"
      aria-label={`View sketch: ${sketch.title}`}
    >
      <!-- Ensure image fills container properly -->
      <div class="absolute inset-0 bg-white">
        <img 
          src={sketch.data.image} 
          alt={sketch.title}
          class="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent
                  p-4 text-white opacity-0 group-hover:opacity-100 
                  group-focus:opacity-100 transition-opacity">
        <p class="text-sm font-medium truncate">{sketch.title}</p>
        <p class="text-xs text-neutral-200">
          Updated {new Date(sketch.updated).toLocaleDateString()}
        </p>
      </div>
    </button>
  {/each}
</div>

<!-- Modal -->
{#if selectedSketch}
  <div 
    role="dialog"
    aria-labelledby="sketch-modal-title"
    aria-modal="true"
    class="fixed inset-0 z-50 overflow-auto bg-black/50 
           backdrop-blur-sm flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <button
      class="absolute inset-0 w-full h-full cursor-default"
      onclick={() => {
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Are you sure you want to close?')) {
            closeModal();
          }
        } else {
          closeModal();
        }
      }}
      aria-label="Close modal"
      type="button"
    ></button>
    
    <!-- Modal content -->
    <div
      class="relative bg-white dark:bg-neutral-900 rounded-lg max-w-5xl w-full
             max-h-[90vh] overflow-auto shadow-xl"
      role="document"
    >
      <!-- Header -->
      <div class="sticky top-0 z-10 flex justify-between items-center p-4
                  bg-white dark:bg-neutral-900 border-b
                  dark:border-neutral-800">
        <h2 
          id="sketch-modal-title" 
          class="text-xl font-bold text-neutral-900 dark:text-neutral-100"
        >
          {selectedSketch.title}
        </h2>
        
        <div class="flex gap-2">
          {#if isEditMode}
            <button
              onclick={handleSave}
              disabled={!hasUnsavedChanges}
              class="px-4 py-2 rounded-lg font-medium
                     bg-primary-500 text-white 
                     hover:bg-primary-600
                     disabled:opacity-50
                     transition-colors duration-200"
              type="button"
            >
              Save Changes
            </button>
          {/if}
          
          <button
            onclick={() => isEditMode = !isEditMode}
            class="px-4 py-2 rounded-lg font-medium
                   transition-colors duration-200
                   {isEditMode ? 
                     'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-700' : 
                     'bg-primary-500 text-white hover:bg-primary-600'}"
            type="button"
            aria-pressed={isEditMode}
          >
            {isEditMode ? 'View' : 'Edit'}
          </button>
          
          <button
            onclick={() => {
              if (hasUnsavedChanges) {
                if (confirm('You have unsaved changes. Are you sure you want to close?')) {
                  closeModal();
                }
              } else {
                closeModal();
              }
            }}
            class="px-4 py-2 rounded-lg font-medium
                   bg-neutral-200 dark:bg-neutral-800
                   text-neutral-900 dark:text-neutral-100
                   hover:bg-neutral-300 dark:hover:bg-neutral-700
                   transition-colors duration-200"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
      
      <!-- Whiteboard -->
      <div class="p-4">
        <div class="h-[600px] bg-white dark:bg-neutral-800 rounded-lg border
                    dark:border-neutral-700 overflow-hidden">
          <Whiteboard
            initialData={selectedSketch.data}
            readOnly={!isEditMode}
            onUpdate={isEditMode ? handleEdit : undefined}
          />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @reference "tailwindcss/theme";

  /* Optional: Add custom animations */
  @keyframes modal-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  [role="dialog"] [role="document"] {
    animation: modal-in 0.2s ease-out;
  }
</style>