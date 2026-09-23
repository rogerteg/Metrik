import { useState, useMemo } from 'react';
import {
  ActivityLogEntry,
  ActivityCategoryFilter,
  ActivityFilterOptions,
} from '../types/taskActivity';

export interface UseTaskActivityOptions {
  initialEntries?: ActivityLogEntry[];
  collapseThreshold?: number; // Default: 5
}

export function useTaskActivity(options: UseTaskActivityOptions = {}) {
  const { initialEntries = [], collapseThreshold = 5 } = options;

  const [entries, setEntries] = useState<ActivityLogEntry[]>(initialEntries);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<ActivityFilterOptions>({
    searchQuery: '',
    category: 'all',
    unreadOnly: false,
  });

  const unreadCount = useMemo(() => {
    return entries.filter((e) => e.isUnread).length;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Filter by unread
      if (filter.unreadOnly && !entry.isUnread) {
        return false;
      }

      // Filter by category
      if (filter.category !== 'all') {
        const type = entry.type;
        if (filter.category === 'comments') {
          if (type !== 'comment' && type !== 'comment_added') return false;
        } else if (filter.category === 'assignments') {
          if (type !== 'assignment' && type !== 'unassignment') return false;
        } else if (filter.category === 'creations') {
          if (type !== 'creation' && type !== 'created') return false;
        } else if (filter.category === 'mutations') {
          if (
            type === 'comment' ||
            type === 'comment_added' ||
            type === 'creation' ||
            type === 'created'
          ) {
            return false;
          }
        }
      }

      // Filter by search query
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const textToSearch = [
          entry.actorName,
          entry.actionText,
          entry.fieldName,
          entry.previousValue,
          entry.newValue,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!textToSearch.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [entries, filter]);

  const hasMoreEntries = filteredEntries.length > collapseThreshold;

  const displayedEntries = useMemo(() => {
    if (isExpanded || filteredEntries.length <= collapseThreshold) {
      return filteredEntries;
    }
    return filteredEntries.slice(0, collapseThreshold);
  }, [filteredEntries, isExpanded, collapseThreshold]);

  const toggleExpand = () => setIsExpanded((prev) => !prev);
  const toggleSearch = () => setIsSearchOpen((prev) => !prev);

  const setSearchQuery = (query: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: query }));
  };

  const setCategory = (category: ActivityCategoryFilter) => {
    setFilter((prev) => ({ ...prev, category }));
  };

  const toggleUnreadFilter = () => {
    setFilter((prev) => ({ ...prev, unreadOnly: !prev.unreadOnly }));
  };

  const addEntry = (entry: ActivityLogEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  return {
    entries,
    filteredEntries,
    displayedEntries,
    hasMoreEntries,
    isExpanded,
    isSearchOpen,
    unreadCount,
    filter,
    toggleExpand,
    toggleSearch,
    setSearchQuery,
    setCategory,
    toggleUnreadFilter,
    addEntry,
    setEntries,
  };
}
