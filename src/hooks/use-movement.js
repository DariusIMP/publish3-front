import { useMovementContext } from 'src/context/movement';

// ----------------------------------------------------------------------

export function useMovement() {
  const context = useMovementContext();
  return context;
}
