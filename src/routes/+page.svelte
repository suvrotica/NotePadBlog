<script lang="ts">
    import { MandelbrotSet } from '$lib/components/MandelbrotSet';
    </script>
    
    <div class="w-full max-w-4xl mx-auto p-4">
      <MandelbrotSet 
      width={1800}
      height={1600}
      maxIterations={100}
      colorScheme="ocean"
    />
    </div>

  