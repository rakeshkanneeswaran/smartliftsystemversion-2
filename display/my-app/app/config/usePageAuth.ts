"use client";

import { useEffect, useState } from "react";
import { AUTH_CONFIG, Role } from "@/app/config/auth";

export function usePageAuth(role: Role) {
    const config = AUTH_CONFIG[role];
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem(config.sessionKey);
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            const now = Date.now();
            const ttlMs = config.ttlHours * 60 * 60 * 1000;

            if (now - data.loggedInAt > ttlMs) {
                sessionStorage.removeItem(config.sessionKey);
                return;
            }

            setAuthenticated(true);
        } catch {
            sessionStorage.removeItem(config.sessionKey);
        }
    }, [config]);

    const login = (username: string, password: string): boolean => {
        if (
            username === config.username &&
            password === config.password
        ) {
            sessionStorage.setItem(
                config.sessionKey,
                JSON.stringify({ loggedInAt: Date.now() })
            );
            setAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem(config.sessionKey);
        setAuthenticated(false);
    };

    return { authenticated, login, logout };
}
