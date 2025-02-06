// src/routes/api/sketches/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Sketch } from "$lib/components/Sketch/types";

// Export the sketches array so it can be shared with the [id] endpoint
export let sketches: Sketch[] = [];

export async function GET() {
  return json(sketches);
}

export async function POST({ request }: RequestEvent) {
  const sketch: Omit<Sketch, 'id' | 'created' | 'updated'> = await request.json();
  
  const newSketch: Sketch = {
    ...sketch,
    id: crypto.randomUUID(),
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  
  sketches.push(newSketch);
  return json(newSketch);
}