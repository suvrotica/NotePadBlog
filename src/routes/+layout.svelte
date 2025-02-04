<script>
    let { children } = $props();
    import "../app.css";
  </script>
  <main class="font-poppins">

      {@render children()}
  </main>

  <style>
    @reference "tailwindcss/theme";
    :global(html) {
      background-color: theme(--color-neutral-900);
    }
  </style>