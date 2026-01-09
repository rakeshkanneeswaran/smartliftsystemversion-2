export function countFloorClicks(
    floors: number[]
): Record<number, number> {
    const counts: Record<number, number> = {};

    for (const f of floors) {
        counts[f] = (counts[f] || 0) + 1;
    }

    return counts;
}
