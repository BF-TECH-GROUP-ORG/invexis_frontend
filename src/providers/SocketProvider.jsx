"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createSocketConnection, disconnect } from '@/utils/socket';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (session?.accessToken) {
            // Initialize socket connection
            // Assuming the gateway URL is in an environment variable or hardcoded for now
            // The user didn't specify the env var name, so I'll use a common one or default to localhost if missing
            const gatewayUrl = process.env.NEXT_PUBLIC_API_URL_SW

            const socketInstance = createSocketConnection(gatewayUrl, session.accessToken);

            socketInstance.on('connect', () => {
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                setIsConnected(false);
            });

            setSocket(socketInstance);

            return () => {
                disconnect(socketInstance);
                setSocket(null);
                setIsConnected(false);
            };
        }
    }, [session]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
