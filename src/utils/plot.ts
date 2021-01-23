import { IPlotOptions } from '../interfaces/IPlotOptions';

export function plot({ canvas, func, boundingBox, objects }: IPlotOptions) {
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = 'red';
    for (let x = 0; x <= 500; x += 1) {
        ctx.lineTo(x, 100 - func((x - 100) / 10) * 10);
    }
    ctx.stroke();

    // Purple path/osa x
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'purple';
    ctx.moveTo(0, 100);
    ctx.lineTo(500, 100);
    ctx.stroke();
}
