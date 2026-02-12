import { useEffect, useRef } from 'react';
import { type Card } from '@/types/card';
import { getSocketBaseUrl } from '@/lib/env';

interface ArenaSocketHandlers {
    onCardUpdate?: (card: Card) => void;
    onCardExpired?: (card: Card) => void;
    onLeaderboardUpdate?: (data: { userId: string; username: string; totalPoints: number }) => void;
}

class ArenaSocketManager {
    private socket: WebSocket | null = null;
    private token: string | null = null;
    private listeners: Set<ArenaSocketHandlers> = new Set();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private closeTimer: ReturnType<typeof setTimeout> | null = null;

    connect(token: string) {
        // If already connected or connecting with same token, do nothing
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) && this.token === token) {
            return;
        }

        // If trying to connect with new token, close old one
        if (this.socket) {
            this.socket.close();
        }

        // Cancel any pending close from strict mode
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }

        // Cancel any pending reconnect
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.token = token;

        const socketBaseUrl = getSocketBaseUrl();
        const wsUrl = `${socketBaseUrl}?token=${token}`;

        console.log('Connecting Singleton Socket:', wsUrl);

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('Arena WebSocket Connected');
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                // Dispatch to all listeners
                this.listeners.forEach(handler => {
                    if (message.type === 'cardUpdated' && handler.onCardUpdate) {
                        handler.onCardUpdate(message.data);
                    }
                    if (message.type === 'cardExpired') {
                        if (handler.onCardExpired) handler.onCardExpired(message.data);
                        else if (handler.onCardUpdate) handler.onCardUpdate(message.data);
                    }
                    if (message.type === 'leaderboardUpdated' && handler.onLeaderboardUpdate) {
                        handler.onLeaderboardUpdate(message.data);
                    }
                });
            } catch (err) {
                console.error('WebSocket message parse error:', err);
            }
        };

        this.socket.onclose = () => {
            console.log('Arena WebSocket Disconnected');
            this.socket = null;

            // Only reconnect if we still have active listeners
            if (this.listeners.size > 0) {
                this.reconnectTimer = setTimeout(() => {
                    if (this.token && this.listeners.size > 0) {
                        this.connect(this.token);
                    }
                }, 3000);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            if (this.socket) {
                this.socket.close();
            }
        };
    }

    subscribe(handlers: ArenaSocketHandlers) {
        this.listeners.add(handlers);

        // Cancel pending close if any
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }

        return () => {
            this.listeners.delete(handlers);

            // If no more listeners, schedule close (debounce for Strict Mode)
            if (this.listeners.size === 0) {
                this.closeTimer = setTimeout(() => {
                    if (this.listeners.size === 0) {
                        console.log('No listeners, closing socket');
                        if (this.socket) {
                            this.socket.close();
                            this.socket = null;
                        }
                        this.token = null;
                    }
                }, 2000); // 2s grace period
            }
        };
    }
}

// Singleton instance
const manager = new ArenaSocketManager();

export const useArenaSocket = (token: string | null, handlers: ArenaSocketHandlers) => {
    const handlersRef = useRef(handlers);

    // Keep handlers ref fresh
    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (!token) return;

        // Create a stable proxy object that calls the current ref
        const proxyHandlers: ArenaSocketHandlers = {
            onCardUpdate: (data) => handlersRef.current.onCardUpdate?.(data),
            onCardExpired: (data) => handlersRef.current.onCardExpired?.(data),
            onLeaderboardUpdate: (data) => handlersRef.current.onLeaderboardUpdate?.(data),
        };

        // Connect (idempotent)
        manager.connect(token);

        // Subscribe
        const unsubscribe = manager.subscribe(proxyHandlers);

        return () => {
            unsubscribe();
        };
    }, [token]);
};
