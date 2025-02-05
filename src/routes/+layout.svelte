<!-- src/routes/+layout.svelte -->
<script>
    let { children } = $props();
    import "../app.css";
  </script>
  <main class="font-poppins">

    
    
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <a href="/" class="flex items-center px-2 py-2">Home</a>
            <a href="/sketches" class="flex items-center px-2 py-2">Sketches</a>
          </div>
        </div>
      </div>
    </nav>
    
    {@render children()}
  </main>
  <style>
    @reference "tailwindcss/theme";
    :global(html) {
      background-color: theme(--color-neutral-900);
    }
  </style>