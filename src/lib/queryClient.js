import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

// cache() is used to ensure that the same QueryClient is used for the duration of a single request
export const getQueryClient = cache(() => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
        },
    },
}));
