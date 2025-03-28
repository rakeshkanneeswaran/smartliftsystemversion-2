export function calculateOptimalLiftStops(
    requestedFloors: number[],
    k: number = 3
): number[] {
    if (requestedFloors.length < k) {
        return []
    }

    const sortedFloors = [...requestedFloors].sort((a, b) => a - b);
    const n = sortedFloors.length;
    let stops: number[] = [];

    // Initialize stops
    for (let i = 0; i < k; i++) {
        const index = Math.floor((i * n) / k);
        stops.push(sortedFloors[index]);
    }

    let assignments: number[][] = [];
    let changed: boolean;
    let iterations = 0;
    const maxIterations = 100;

    do {
        changed = false;
        iterations++;

        // Assign floors to nearest stops
        const newAssignments: number[][] = Array(k).fill(0).map(() => []);
        for (const floor of sortedFloors) {
            let minDistance = Infinity;
            let bestStopIndex = 0;

            for (let i = 0; i < stops.length; i++) {
                const distance = Math.abs(floor - stops[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestStopIndex = i;
                }
            }
            newAssignments[bestStopIndex].push(floor);
        }

        // Check for changes
        if (!assignments.length ||
            JSON.stringify(assignments) !== JSON.stringify(newAssignments)) {
            changed = true;
        }
        assignments = newAssignments;

        // Recalculate stop positions (median)
        stops = assignments.map(group => {
            if (group.length === 0) return stops[0]; // fallback
            const sorted = [...group].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0
                ? sorted[mid]
                : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
        });

    } while (changed && iterations < maxIterations);

    // Return just the stop floors, sorted
    return stops.sort((a, b) => a - b);
}