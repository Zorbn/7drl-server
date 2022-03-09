export type Vec2 = {
    x: number,
    y: number,
}

export function getLine(p0: Vec2, p1: Vec2): Vec2[] {
    let dx = p1.x - p0.x, dy = p1.y - p0.y;
    let nx = Math.abs(dx), ny = Math.abs(dy);
    let signX = dx > 0 ? 1 : -1, signY = dy > 0 ? 1: -1;

    let p = { x: p0.x, y: p0.y };
    let points = [p];

    for (let ix = 0, iy = 0; ix < nx || iy < ny;) {
        if ((0.5 + ix) / nx < (0.5 + iy) / ny) {
            // Next step is horizontal
            p.x += signX;
            ix++;
        } else {
            // Next step is vertical
            p.y += signY;
            iy++;
        }

        points.push({ x: p.x, y: p.y });
    }

    return points;
}

// The maximum is exclusive and the minimum is inclusive
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
