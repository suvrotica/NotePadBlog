<!-- src/routes/sketches/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Sketch, SketchData } from "$lib/components/Sketch/types";
  import Whiteboard from '$lib/components/Sketch/Whiteboard.svelte';
  import SketchGallery from '$lib/components/Sketch/SketchGallery.svelte';
  
  let sketches = $state<Sketch[]>([]);
  let isCreating = $state(false);
  let newSketchTitle = $state('');
  // Fix: Properly type newSketchData to allow null
  let newSketchData = $state<SketchData | null>(null);
  
  // Load sketches
  $effect(() => {
    loadSketches();
  });
  
  async function loadSketches() {
    const response = await fetch('/api/sketches');
    if (response.ok) {
      sketches = await response.json();
    }
  }
  
  async function saveNewSketch() {
    if (!newSketchData || !newSketchTitle.trim()) return;
    
    const response = await fetch('/api/sketches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newSketchTitle,
        data: newSketchData
      })
    });
    
    if (response.ok) {
      const savedSketch = await response.json();
      sketches = [...sketches, savedSketch];
      isCreating = false;
      newSketchTitle = '';
      newSketchData = null;
    }
  }
  
  async function updateSketch(sketch: Sketch) {
    const response = await fetch(`/api/sketches/${sketch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sketch)
    });
    
    if (response.ok) {
      const updatedSketch = await response.json();
      sketches = sketches.map(s => 
        s.id === updatedSketch.id ? updatedSketch : s
      );
    } else {
      console.error('Failed to update sketch:', await response.text());
      alert('Failed to update sketch. Please try again.');
    }
  }
</script>

    
    <div class="max-w-7xl mx-auto p-4">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold">My Sketches</h1>
        <button
          onclick={() => isCreating = true}
          class="px-4 py-2 rounded bg-blue-500 text-white 
                 hover:bg-blue-600 transition-colors"
        >
          New Sketch
        </button>
      </div>
    
      <SketchGallery
        {sketches}
        onUpdate={updateSketch}
      />
      
      {#if isCreating}
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg max-w-4xl w-full p-4">
            <div class="flex justify-between items-center mb-4">
              <input
                type="text"
                bind:value={newSketchTitle}
                placeholder="Sketch title..."
                class="px-4 py-2 border rounded text-neutral-600"
              />
              <div class="flex gap-2">
                <button
                  onclick={saveNewSketch}
                  disabled={!newSketchTitle.trim() || !newSketchData}
                  class="px-4 py-2 rounded bg-blue-500 text-white 
                         hover:bg-blue-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onclick={() => isCreating = false}
                  class="px-4 py-2 rounded bg-gray-500 text-white 
                         hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div class="h-[600px] bg-white rounded border">
              <Whiteboard
                onUpdate={(data) => newSketchData = data}
              />
            </div>
          </div>
        </div>
      {/if}
    </div>