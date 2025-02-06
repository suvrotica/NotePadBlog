// src/routes/api/sketches/[id]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Sketch } from "$lib/components/Sketch/types";

// Share the sketches array with the parent endpoint
import { sketches } from '../+server';

export async function PUT({ request, params }: RequestEvent) {
  const { id } = params;
  const updatedSketch: Sketch = await request.json();
  
  const index = sketches.findIndex(s => s.id === id);
  
  if (index === -1) {
    return new Response('Sketch not found', { status: 404 });
  }
  
  sketches[index] = {
    ...updatedSketch,
    updated: new Date().toISOString()
  };
  
  return json(sketches[index]);
}