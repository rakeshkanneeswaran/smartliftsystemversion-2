export const AUTH_CONFIG = {
    operator: {
        username: "operator",
        password: "operator123",
        sessionKey: "auth_operator",
        ttlHours: 4,
    },
    iot: {
        username: "iot",
        password: "iot123",
        sessionKey: "auth_iot",
        ttlHours: 4,
    },
} as const;

export type Role = keyof typeof AUTH_CONFIG;
