import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditorStateContextType {
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
}

const EditorStateContext = createContext<EditorStateContextType | undefined>(undefined);

export const EditorStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  return (
    <EditorStateContext.Provider value={{ selectedLayerId, setSelectedLayerId }}>
      {children}
    </EditorStateContext.Provider>
  );
};

export const useEditorState = () => {
  const context = useContext(EditorStateContext);
  if (context === undefined) {
    throw new Error('useEditorState must be used within a EditorStateProvider');
  }
  return context;
};
