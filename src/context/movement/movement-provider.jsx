'use client';

import { aptos } from 'src/lib/movement/client';
import { MovementContext } from './movement-context';

// ----------------------------------------------------------------------

export function MovementProvider({ children }) {

    const value = {
        client: aptos,
    };

    return (
        <MovementContext.Provider value={value}>
            {children}
        </MovementContext.Provider>
    );
}
