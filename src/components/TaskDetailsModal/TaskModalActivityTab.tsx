import React from 'react';
import { TaskTimeline } from '../TaskTimeline';
import { TaskFlowMetricsPanel } from '../TaskFlowMetricsPanel';
import { TaskComment, TaskActivityLog } from '../../types/taskActivity';
import { createTaskActivityEvent, AuditDescriptions } from '../../utils/taskActivityLogger';
import { TaskModalActivityTabProps } from './types';

export const TaskModalActivityTab: React.FC<TaskModalActivityTabProps> = ({
  task,
  activeTab,
  setActiveTab,
  activityCount,
  currentUserId,
  isReadOnly,
  currentColumnTitle,
  pendingBlockersCount,
  initiativeProgress,
  totalBlockedMs,
  onUpdateTask,
  onAddComment,
  onDeleteComment,
  onEditComment,
}) => {
  const handleAddComment = (text: string, isDecision?: boolean) => {
    if (onAddComment) {
      onAddComment(task.id, text, isDecision);
    } else {
      const now = new Date().toISOString();
      const newComment: TaskComment = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        taskId: task.id,
        userId: 'usr_default',
        userName: 'Rogerio Teixeira',
        text,
        isDecision: Boolean(isDecision),
        createdAt: now,
      };
      const auditEvent: TaskActivityLog = createTaskActivityEvent({
        taskId: task.id,
        eventType: 'comment_added',
        description: AuditDescriptions.commentAdded('Rogerio Teixeira'),
        user: { id: 'usr_default', name: 'Rogerio Teixeira' },
      });
      onUpdateTask(task.id, {
        comments: [...(task.comments || []), newComment],
        activityLog: [...(task.activityLog || []), auditEvent],
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(task.id, commentId);
    } else {
      const updatedComments = (task.comments || []).filter((c) => c.id !== commentId);
      const auditEvent: TaskActivityLog = createTaskActivityEvent({
        taskId: task.id,
        eventType: 'comment_deleted',
        description: AuditDescriptions.commentDeleted('Rogerio Teixeira'),
        user: { id: 'usr_default', name: 'Rogerio Teixeira' },
      });
      onUpdateTask(task.id, {
        comments: updatedComments,
        activityLog: [...(task.activityLog || []), auditEvent],
      });
    }
  };

  const handleEditComment = (commentId: string, text: string) => {
    if (!text.trim()) return;
    if (onEditComment) {
      onEditComment(task.id, commentId, text);
      return;
    }
    const updatedComments = (task.comments || []).map((c) =>
      c.id === commentId ? { ...c, text: text.trim(), updatedAt: new Date().toISOString() } : c,
    );
    onUpdateTask(task.id, { comments: updatedComments });
  };

  return (
    <>
      <div className="td-tabs" role="tablist" aria-label="Seções do detalhe da tarefa">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          className={`td-tab ${activeTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Visão Geral
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'activity'}
          className={`td-tab ${activeTab === 'activity' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Atividade
          {activityCount > 0 && <span className="td-tab__count">{activityCount}</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'metrics'}
          className={`td-tab ${activeTab === 'metrics' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Métricas
        </button>
      </div>

      {activeTab === 'activity' && (
        <div className="td-tabpanel" role="tabpanel" aria-label="Atividade">
          <TaskTimeline
            taskId={task.id}
            comments={task.comments}
            activityLog={task.activityLog}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onEditComment={handleEditComment}
            currentUserId={currentUserId}
            isGuest={isReadOnly}
            totalBlockedMs={totalBlockedMs}
          />
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="td-tabpanel" role="tabpanel" aria-label="Métricas">
          <TaskFlowMetricsPanel
            task={task}
            currentColumnTitle={currentColumnTitle}
            pendingBlockersCount={pendingBlockersCount}
            initiativeProgress={initiativeProgress}
          />
        </div>
      )}
    </>
  );
};
