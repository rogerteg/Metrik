import React from 'react';
import { AppHeader, AppHeaderProps, AppView } from '../AppHeader';

export type { AppHeaderProps, AppView };

export const AppHeaderBar: React.FC<AppHeaderProps> = (props) => {
  return <AppHeader {...props} />;
};
