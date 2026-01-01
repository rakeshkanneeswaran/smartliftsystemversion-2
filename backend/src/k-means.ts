export function calculateOptimalLiftStops(
    requestedFloors: number[],
    k: number
): number[] {
    if (requestedFloors.length <= k) {
        return [...new Set(requestedFloors)].sort((a, b) => a - b);
    }

    const sorted = [...requestedFloors].sort((a, b) => a - b);
    const n = sorted.length;

    let stops = Array.from({ length: k }, (_, i) =>
        sorted[Math.floor((i * n) / k)]
    );

    let assignments: number[][] = [];
    let changed = true;
    let iter = 0;

    while (changed && iter < 50) {
        iter++;

        const newAssign: number[][] = Array.from({ length: k }, () => []);

        for (const f of sorted) {
            let idx = 0;
            let min = Infinity;

            for (let i = 0; i < stops.length; i++) {
                const d = Math.abs(f - stops[i]);
                if (d < min) {
                    min = d;
                    idx = i;
                }
            }

            newAssign[idx].push(f);
        }

        changed =
            JSON.stringify(assignments) !== JSON.stringify(newAssign);
        assignments = newAssign;

        stops = assignments.map((g, i) => {
            if (!g.length) return stops[i];
            g.sort((a, b) => a - b);
            return g[Math.floor(g.length / 2)];
        });
    }

    return stops.sort((a, b) => a - b);
}
