import { useTaskComments, UseTaskCommentsReturn } from '../useTaskComments';
import { BoardState } from '../../types/kanban';

export type { UseTaskCommentsReturn };

export function useTaskCommentsManager(
  setBoard: React.Dispatch<React.SetStateAction<BoardState>>,
): UseTaskCommentsReturn {
  return useTaskComments(setBoard);
}
