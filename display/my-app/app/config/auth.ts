export const AUTH_CONFIG = {
    operator: {
        username: "2026",
        password: "2026",
        sessionKey: "auth_operator",
        ttlHours: 4,
    },
    iot: {
        username: "iot",
        password: "2026",
        sessionKey: "auth_iot",
        ttlHours: 4,
    },
} as const;

export type Role = keyof typeof AUTH_CONFIG;
