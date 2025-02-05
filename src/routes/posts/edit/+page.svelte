<!-- src/routes/posts/edit/+page.svelte -->
<script lang="ts">
    import Whiteboard from '$lib/components/Whiteboard.svelte';
    
    // Post data
    let post = $state({
      title: '',
      content: '',
      sketch: null
    });
    
    // Handle sketch updates
    function updateSketch(sketchData: any) {
      post.sketch = sketchData;
    }
    
    // Save post
    async function savePost() {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post)
        });
        
        if (!response.ok) throw new Error('Failed to save post');
        
        // Handle successful save
      } catch (error) {
        // Handle error appropriately
      }
    }
    </script>
    
    <div class="max-w-4xl mx-auto p-4 space-y-6">
      <input
        type="text"
        bind:value={post.title}
        class="w-full text-2xl font-bold p-2 border rounded"
        placeholder="Post title..."
      />
      
      <div class="h-[500px] border rounded">
        <Whiteboard
          initialData={post.sketch}
          onUpdate={updateSketch}
        />
      </div>
      
      <textarea
  bind:value={post.content}
  class="w-full h-64 p-2 border rounded"
  placeholder="Write your post content..."
></textarea>
      
      <button
        onclick={savePost}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save Post
      </button>
    </div>