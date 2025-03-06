export const createPath = (x1: number, y1: number, x2: number, y2: number) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const isMoreHorizontal = Math.abs(dx) > Math.abs(dy);

    const cx1 = isMoreHorizontal ? midX : x1;
    const cy1 = isMoreHorizontal ? y1 : midY;
    const cx2 = isMoreHorizontal ? midX : x2;
    const cy2 = isMoreHorizontal ? y2 : midY;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
};