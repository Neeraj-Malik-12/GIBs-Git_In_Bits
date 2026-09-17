import { createContext, useContext, useEffect, useState } from 'react';
import { DataSourceType } from '../types';
import { useAuth } from './AuthContext';

interface DataSourceContextType {
  sourceType: DataSourceType | null;
  sourceValue: string | null;
  setDataSource: (type: DataSourceType, value: string) => void;
  clearDataSource: () => void;
}

export const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [sourceType, setSourceTypeState] = useState<DataSourceType | null>(() => {
    return localStorage.getItem('gib_source_type') as DataSourceType | null;
  });
  
  const [sourceValue, setSourceValueState] = useState<string | null>(() => {
    return localStorage.getItem('gib_source_value');
  });

  const setDataSource = (type: DataSourceType, value: string) => {
    localStorage.setItem('gib_source_type', type);
    localStorage.setItem('gib_source_value', value);
    setSourceTypeState(type);
    setSourceValueState(value);
  };

  const clearDataSource = () => {
    localStorage.removeItem('gib_source_type');
    localStorage.removeItem('gib_source_value');
    setSourceTypeState(null);
    setSourceValueState(null);
  };

  // Sync state across tabs if needed
  useEffect(() => {
    if (user) {
      const lastUser = localStorage.getItem('gib_last_user');
      if (lastUser && lastUser !== user.login) {
        clearDataSource();
      }
      localStorage.setItem('gib_last_user', user.login);
    }
  }, [user?.login]);

  useEffect(() => {
    const handleStorage = () => {
      setSourceTypeState(localStorage.getItem('gib_source_type') as DataSourceType | null);
      setSourceValueState(localStorage.getItem('gib_source_value'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <DataSourceContext.Provider value={{ sourceType, sourceValue, setDataSource, clearDataSource }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}
