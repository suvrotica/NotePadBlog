<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { MandelbrotSet } from '$lib/components/MandelbrotSet';
  import Whiteboard from '$lib/components/Sketch/Whiteboard.svelte';
  
  // Sketch state
  let currentSketch = $state(null);
  
  function handleSketchUpdate(sketchData: any) {
    currentSketch = sketchData;
  }
  </script>
  
  <div class="w-full max-w-4xl mx-auto p-4 space-y-8">
    <!-- Mandelbrot Section -->
    <section class="rounded-lg overflow-hidden shadow-lg">
      <h2 class="text-xl font-bold mb-4">Mandelbrot Explorer</h2>
      <MandelbrotSet 
        width={800}
        height={600}
        maxIterations={100}
        colorScheme="classic"
      />
    </section>
  
    
  
    <!-- Optional: Controls or Save Button -->
    <div class="flex justify-end">
      <button
        onclick={async () => {
          if (currentSketch) {
            try {
              const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'sketch',
                  data: currentSketch
                })
              });
              
              if (!response.ok) throw new Error('Failed to save sketch');
              
              // Show success message
              alert('Sketch saved successfully!');
            } catch (error) {
              // Show error message
              alert('Failed to save sketch');
            }
          }
        }}
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
               transition-colors duration-200"
      >
        Save Sketch
      </button>
    </div>
  </div>
  
  <style>
    /* Optional: Add any custom styles here */
  </style>