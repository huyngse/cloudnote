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

export const wrapText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
) => {
    const words = text.split(" ");
    let line = "";
    let lineY = y;

    for (let n = 0; n < words.length; n++) {
        let word = words[n];

        // Try adding the word normally
        let testLine = line + word + " ";
        let testWidth = context.measureText(testLine).width;

        // If it fits, add it!
        if (testWidth <= maxWidth) {
            line = testLine;
        } else {
            // If the current line has stuff, draw it and start new
            if (line !== "") {
                context.fillText(line, x, lineY);
                line = "";
                lineY += lineHeight;
            }

            // Now handle long word breaking
            while (word.length > 0) {
                let fit = "";
                let i = 0;
                while (i < word.length) {
                    const part = word.slice(0, i + 1);
                    if (context.measureText(part).width > maxWidth) break;
                    fit = part;
                    i++;
                }

                if (fit.length === 0) {
                    // force break one character (too narrow box maybe)
                    fit = word[0];
                    i = 1;
                }

                context.fillText(fit, x, lineY);
                lineY += lineHeight;
                word = word.slice(i);
            }
        }
    }

    // Draw any leftover line
    if (line !== "") {
        context.fillText(line, x, lineY);
    }
};
