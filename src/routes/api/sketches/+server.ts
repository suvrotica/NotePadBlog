// src/routes/api/sketches/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Sketch } from "$lib/components/Sketch/types";
import { store } from '$lib/server/store';

export async function GET() {
  return json(store.sketches);
}

export async function POST({ request }: RequestEvent) {
  const sketch: Omit<Sketch, 'id' | 'created' | 'updated'> = await request.json();
  
  const newSketch: Sketch = {
    ...sketch,
    id: crypto.randomUUID(),
    created: new Date().toISOString(), 
    updated: new Date().toISOString()
  };
  
  store.sketches.push(newSketch);
  return json(newSketch);
}