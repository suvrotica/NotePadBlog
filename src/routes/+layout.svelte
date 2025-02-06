<script lang="ts">
  import { page } from '$app/state';
  let { children } = $props();
  import "../app.css";
  
  // Derive the current path to highlight active links
  let currentPath = $derived(page.url.pathname);
  </script>
  
  <main class="font-poppins">
    <nav class="bg-white dark:bg-neutral-800 shadow">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex space-x-4">
            <a 
              href="/" 
              class="flex items-center px-4 py-2 rounded-md transition-colors
                     {currentPath === '/' ? 
                       'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100' : 
                       'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}"
            >
              Home
            </a>
            <a 
              href="/sketches" 
              class="flex items-center px-4 py-2 rounded-md transition-colors
                     {currentPath === '/sketches' ? 
                       'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100' : 
                       'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}"
            >
              Sketches
            </a>
          </div>
        </div>
      </div>
    </nav>
    
    <div class="min-h-[calc(100vh-4rem)]">
      {@render children()}
    </div>
  </main>
  
  <style>
    @reference "tailwindcss/theme";
    :global(html) {
      background-color: theme(--color-neutral-900);
      color-scheme: dark;
    }
  </style>