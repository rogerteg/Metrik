import { ActivityLogEntry } from '../types/taskActivity';

/**
 * Formats an ISO timestamp string into concise Portuguese date format:
 * Example: "jun 26 às 10:26 am" or "jul 16 às 2:36 pm"
 */
export function formatActivityTimestamp(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const month = months[date.getMonth()];
  const day = date.getDate();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'

  return `${month} ${day} às ${hours}:${minutes} ${ampm}`;
}

/**
 * Formats action diff text in Portuguese based on event type and payload.
 * Examples:
 * - "Luis Eduardo Ferreira Santos criou esta tarefa"
 * - "Danillo Barbosa removeu o responsável: Antonio Carlos Ferreira Batista"
 */
export function formatActivityActionText(entry: Partial<ActivityLogEntry>): string {
  const actor = entry.actorName || 'Usuário';

  switch (entry.type) {
    case 'created':
    case 'creation':
      return `${actor} criou esta tarefa`;

    case 'unassignment':
      return entry.previousValue
        ? `${actor} removeu o responsável: ${entry.previousValue}`
        : `${actor} removeu o responsável`;

    case 'assignment':
      return entry.newValue
        ? `${actor} atribuiu a tarefa para: ${entry.newValue}`
        : `${actor} adicionou um responsável`;

    case 'status_change':
    case 'moved':
      return entry.newValue
        ? `${actor} alterou o status para: ${entry.newValue}`
        : `${actor} alterou o status da tarefa`;

    case 'priority_change':
    case 'priority_changed':
      return entry.newValue
        ? `${actor} alterou a prioridade para: ${entry.newValue}`
        : `${actor} alterou a prioridade`;

    case 'due_date_change':
    case 'dates_changed':
      return entry.newValue
        ? `${actor} alterou a data de entrega para: ${entry.newValue}`
        : `${actor} alterou a data de entrega`;

    case 'tag_change':
    case 'tags_changed':
      return entry.newValue
        ? `${actor} atualizou as tags: ${entry.newValue}`
        : `${actor} atualizou as tags`;

    case 'subtask_change':
      return `${actor} atualizou as subtarefas`;

    case 'comment':
    case 'comment_added':
      return entry.newValue
        ? `${actor} comentou: ${entry.newValue}`
        : `${actor} adicionou um comentário`;

    default:
      return entry.actionText || `${actor} realizou uma alteração`;
  }
}
