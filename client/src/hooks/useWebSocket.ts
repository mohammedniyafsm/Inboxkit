import { useEffect, useRef, useState, useCallback } from "react";



interface UseWebSocketReturn {
    isConnected: boolean;
    lastMessage: any | null;
    sendMessage: (data: any) => void;
    disconnect: () => void;
}

export function useWebSocket(
    url: string,
    token: string | null,
    maxRetries = 5,
    heartbeatInterval = 25000
): UseWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const retriesRef = useRef(0);
    const lastMessageRef = useRef<any | null>(null);
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intentionalClose = useRef(false);

    const clearHeartbeat = () => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    };

    const clearReconnectTimeout = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    };

    const connect = useCallback(() => {
        if (!token) return;

        const wsUrl = `${url}?token=${token}`;

        // Idempotency check: Don't reconnect if already connected to the same URL
        if (wsRef.current && wsRef.current.url === wsUrl) {
            if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
                console.log("[WS] Already connected/connecting to", wsUrl);
                return;
            }
        }

        // Close existing connection if any (e.g. different URL/token)
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("[WS] Connected");
            setIsConnected(true);
            retriesRef.current = 0;

            // Start heartbeat
            clearHeartbeat();
            heartbeatRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "PING" }));
                }
            }, heartbeatInterval);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Ignore pong heartbeats from server
                if (data.type === "PONG") return;

                // Deduplicate identical consecutive messages to avoid unnecessary rerenders
                try {
                    const prev = lastMessageRef.current;
                    const prevStr = prev ? JSON.stringify(prev) : null;
                    const curStr = JSON.stringify(data);
                    if (prevStr === curStr) return;
                } catch {
                    // If stringify fails, fall back to updating state
                }

                lastMessageRef.current = data;
                setLastMessage(data);
            } catch {
                console.error("[WS] Failed to parse message");
            }
        };

        ws.onclose = (event) => {
            console.log(`[WS] Disconnected (code: ${event.code})`);
            setIsConnected(false);
            clearHeartbeat();

            // Don't reconnect if closed intentionally or auth failed
            if (intentionalClose.current || event.code === 4001) return;

            // Exponential backoff reconnect
            if (retriesRef.current < maxRetries) {
                const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
                console.log(`[WS] Reconnecting in ${delay}ms (attempt ${retriesRef.current + 1}/${maxRetries})`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    retriesRef.current++;
                    connect();
                }, delay);
            } else {
                console.log("[WS] Max retries reached");
            }
        };

        ws.onerror = () => {
            console.error("[WS] Connection error");
        };
    }, [url, token, maxRetries, heartbeatInterval]);

    const disconnect = useCallback(() => {
        intentionalClose.current = true;
        clearHeartbeat();
        clearReconnectTimeout();
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((data: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    // Connect on mount, disconnect on unmount
    useEffect(() => {
        intentionalClose.current = false;
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return { isConnected, lastMessage, sendMessage, disconnect };
}
