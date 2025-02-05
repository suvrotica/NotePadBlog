// src/routes/api/sketches/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Sketch } from "$lib/components/Sketch/types";

// In a real app, this would be a database
let sketches: Sketch[] = [];

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

export async function PUT({ request, params }: RequestEvent) {
  const updatedSketch: Sketch = await request.json();
  const index = sketches.findIndex(s => s.id === updatedSketch.id);
  
  if (index === -1) {
    return new Response('Sketch not found', { status: 404 });
  }
  
  sketches[index] = {
    ...updatedSketch,
    updated: new Date().toISOString()
  };
  
  return json(sketches[index]);
}