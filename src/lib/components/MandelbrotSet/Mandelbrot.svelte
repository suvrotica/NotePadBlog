<!-- src/lib/components/MandelbrotSet/MandelbrotSet.svelte -->
<script lang="ts">
	import type { MandelbrotProps, WorkerMessage } from './types';

	let {
		width = $bindable(800),
		height = $bindable(600),
		maxIterations = $bindable(100),
		colorScheme = $bindable('classic')
	} = $props<{
		width?: number;
		height?: number;
		maxIterations?: number;
		colorScheme?: 'classic' | 'ocean' | 'fire';
	}>();

	let canvas: HTMLCanvasElement | undefined = $state();
	let ctx: CanvasRenderingContext2D | null = $state(null);
	let worker: Worker | undefined = $state();
	let isRendering = $state(false);

	// View state
	let zoom = $state(1);
	let centerX = $state(-0.5);
	let centerY = $state(0);

	// Pan state
	let isDragging = $state(false);
	let lastX = $state(0);
	let lastY = $state(0);
	let tempMaxIterations = $state(maxIterations);

	// Add selection state
	let isSelecting = $state(false);
	let selectionStart = $state({ x: 0, y: 0 });
	let selectionEnd = $state({ x: 0, y: 0 });
	let showSelection = $state(false);

	// Initialize worker
	$effect(() => {
		if (typeof window === 'undefined') return;

		worker = new Worker(new URL('./mandelbrot.worker.ts', import.meta.url), { type: 'module' });

		worker.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
			if (!ctx) return;
			ctx.putImageData(data.imageData, 0, data.row);
			if (data.row >= height - 50) isRendering = false;
		};

		return () => worker?.terminate();
	});

	// Initialize canvas context
	$effect(() => {
		if (!canvas) return;
		ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.imageSmoothingEnabled = false;
		}
	});

	function renderMandelbrot(useTemp: boolean) {
		if (!ctx || !worker) return;
		isRendering = true;

		worker.postMessage({
			width,
			height,
			maxIterations: useTemp ? Math.min(10, maxIterations) : maxIterations,
			zoom,
			centerX,
			centerY,
			colorScheme
		});
	}

	// Handle zoom
	function onMouseWheel(event: WheelEvent) {
		event.preventDefault();
		const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
		const rect = canvas?.getBoundingClientRect();
		if (!rect) return;

		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		// Zoom towards mouse position
		centerX += ((mouseX - width / 2) / (width * zoom)) * (1 - zoomFactor);
		centerY += ((mouseY - height / 2) / (height * zoom)) * (1 - zoomFactor);
		zoom *= zoomFactor;

		renderMandelbrot(true); // Use lower iterations during zoom

		// Debounce the full quality render
		clearTimeout(zoomTimeout);
		zoomTimeout = setTimeout(() => {
			renderMandelbrot(false); // Render full quality after zoom ends
		}, 150);
	}
	let zoomTimeout: ReturnType<typeof setTimeout>;
	// Cleanup
	$effect(() => {
		return () => {
			clearTimeout(zoomTimeout);
		};
	});

	// Handle pan and selection
	function onMouseDown(event: MouseEvent) {
		const rect = canvas?.getBoundingClientRect();
		if (!rect) return;
		if (event.shiftKey) {
			// Start selection when shift is held
			isSelecting = true;
			showSelection = true;
			selectionStart = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};
			selectionEnd = { ...selectionStart };
		} else {
			// Normal panning behavior
			isDragging = true;
			lastX = event.clientX;
			lastY = event.clientY;
		}
	}

	function onMouseMove(event: MouseEvent) {
		const rect = canvas?.getBoundingClientRect();
		if (!rect) return;
		if (isSelecting) {
			// Update selection rectangle
			selectionEnd = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};
		} else if (isDragging) {
			// Existing pan logic
			const deltaX = event.clientX - lastX;
			const deltaY = event.clientY - lastY;

			centerX -= deltaX / (width * zoom);
			centerY -= deltaY / (height * zoom);

			lastX = event.clientX;
			lastY = event.clientY;

			renderMandelbrot(true);
		}
	}

	function onMouseUp() {
		if (isSelecting) {
			const selectionWidth = Math.abs(selectionEnd.x - selectionStart.x);
			const selectionHeight = Math.abs(selectionEnd.y - selectionStart.y);

			if (selectionWidth > 10 && selectionHeight > 10) {
				// Calculate new view parameters
				const selectionCenterX = (selectionStart.x + selectionEnd.x) / 2;
				const selectionCenterY = (selectionStart.y + selectionEnd.y) / 2;

				// Calculate new zoom level based on selection size
				const scaleX = width / selectionWidth;
				const scaleY = height / selectionHeight;
				const newZoom = zoom * Math.min(scaleX, scaleY);

				// Update center position
				centerX += (selectionCenterX - width / 2) / (width * zoom);
				centerY += (selectionCenterY - height / 2) / (height * zoom);
				zoom = newZoom;

				renderMandelbrot(false);
			}

			// Reset selection
			isSelecting = false;
			showSelection = false;
		} else if (isDragging) {
			isDragging = false;
			renderMandelbrot(false);
		}
	}

	// Reset view
	function resetView() {
		zoom = 1;
		centerX = -0.5;
		centerY = 0;
		renderMandelbrot(false);
	}

	// Initial render
	$effect(() => {
		renderMandelbrot(false);
	});
</script>

<div class="mandelbrot @container">
	<canvas
		bind:this={canvas}
		{width}
		{height}
		class="w-full h-full object-contain cursor-move touch-none"
		onwheel={onMouseWheel}
		onmousedown={onMouseDown}
		onmousemove={onMouseMove}
		onmouseup={onMouseUp}
		onmouseleave={onMouseUp}
	></canvas>
	<!-- Selection overlay -->
	{#if showSelection}
		<div
			class="absolute pointer-events-none border-2 border-white/50 bg-white/10"
			style:left="{Math.min(selectionStart.x, selectionEnd.x)}px"
			style:top="{Math.min(selectionStart.y, selectionEnd.y)}px"
			style:width="{Math.abs(selectionEnd.x - selectionStart.x)}px"
			style:height="{Math.abs(selectionEnd.y - selectionStart.y)}px"
		></div>
	{/if}

  <!-- Existing controls -->
	<div class="controls @lg:absolute @lg:top-4 @lg:right-4 @sm:mt-4">
		<div class="bg-neutral-900/20 backdrop-blur rounded-lg p-4 space-y-4">
			<div class="space-y-2">
				<label for="maxIterations" class="text-sm text-neutral-50">Max Iterations</label>
				<input
					id="maxIterations"
					type="range"
					min="50"
					max="1000"
					step="50"
					bind:value={maxIterations}
					class="w-full accent-primary-500 bg-neutral-700/50"
					onchange={() => renderMandelbrot(true)}
				/>
				<span class="text-xs text-neutral-400">{maxIterations}</span>
			</div>
			<div class="space-y-2">
				<label for="colorScheme" class="text-sm text-neutral-50">Color Scheme</label>
				<select
					id="colorScheme"
					bind:value={colorScheme}
					class="w-full bg-neutral-800/50 text-neutral-50 rounded-md border-neutral-700 focus:ring-primary-500"
					onchange={() => renderMandelbrot(true)}
				>
					<option value="classic">Classic</option>
					<option value="ocean">Ocean</option>
					<option value="fire">Fire</option>
				</select>
			</div>

			<button
				onclick={resetView}
				class="w-full px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-50 rounded-md transition-colors"
			>
				Reset View
			</button>

			{#if isRendering}
				<div class="text-sm text-neutral-50/80 animate-pulse">Rendering...</div>
			{/if}
		</div>
    <!-- Add help text -->
    <div class="mt-2 text-xs text-neutral-300/80">
      Hold Shift + Click & Drag to zoom into a region
    </div>
	</div>
</div>

<style>
	@reference "tailwindcss/theme";

	.mandelbrot {
		position: relative;
		background-color: theme(--color-neutral-900);
		border-radius: theme(--radius-lg);
		overflow: hidden;
		box-shadow: theme(--shadow-xl);
	}

	.controls {
		z-index: theme(zIndex.10);
	}
</style>
