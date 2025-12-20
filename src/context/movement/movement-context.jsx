'use client';

import { createContext, useContext } from 'react';

// ----------------------------------------------------------------------

export const MovementContext = createContext({});

// ----------------------------------------------------------------------

export function useMovementContext() {
  const context = useContext(MovementContext);

  if (!context) {
    throw new Error('useMovementContext must be used within a MovementProvider');
  }

  return context;
}
