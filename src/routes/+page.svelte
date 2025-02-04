<script lang="ts">
    import { MandelbrotSet } from '$lib/components/MandelbrotSet';
    </script>
    
    <div class="w-full max-w-4xl mx-auto p-4">
      <MandelbrotSet 
      width={800}
      height={600}
      maxIterations={100}
      colorScheme="classic"
    />
    </div>

  