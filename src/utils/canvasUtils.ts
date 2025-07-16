export function getCanvasCenter(
    container: HTMLDivElement,
    pan: { x: number; y: number },
    scale: number
): { x: number; y: number } {
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Convert screen center point to canvas coordinates
    const canvasX = (centerX - pan.x) / scale;
    const canvasY = (centerY - pan.y) / scale;

    return { x: canvasX, y: canvasY };
}