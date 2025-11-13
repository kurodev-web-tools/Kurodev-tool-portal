import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Persona } from '../types';
import {
  STORAGE_KEYS,
  loadPersonasFromStorage,
  savePersonasToStorage,
} from '../types/storage';
import { logger } from '@/lib/logger';

const MAX_PERSONAS = 50;

/**
 * ペルソナのストレージ管理フック
 * ペルソナのCRUD操作とデフォルトペルソナの管理を行う
 */
export function usePersonaStorage() {
  const [personas, setPersonas] = useState<Persona[]>(() => {
    const { personas: loadedPersonas } = loadPersonasFromStorage(
      STORAGE_KEYS.PERSONAS,
      STORAGE_KEYS.DEFAULT_PERSONA,
    );
    return loadedPersonas;
  });

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(() => {
    const { defaultPersonaId } = loadPersonasFromStorage(
      STORAGE_KEYS.PERSONAS,
      STORAGE_KEYS.DEFAULT_PERSONA,
    );
    return defaultPersonaId;
  });

  const [defaultPersonaId, setDefaultPersonaId] = useState<string | null>(() => {
    const { defaultPersonaId } = loadPersonasFromStorage(
      STORAGE_KEYS.PERSONAS,
      STORAGE_KEYS.DEFAULT_PERSONA,
    );
    return defaultPersonaId;
  });

  // ペルソナの変更をストレージに保存
  useEffect(() => {
    savePersonasToStorage(
      STORAGE_KEYS.PERSONAS,
      STORAGE_KEYS.DEFAULT_PERSONA,
      personas,
      defaultPersonaId,
    );
  }, [personas, defaultPersonaId]);

  // ペルソナの作成
  const createPersona = useCallback(
    (personaData: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>): Persona | null => {
      if (personas.length >= MAX_PERSONAS) {
        toast.error(`ペルソナは最大${MAX_PERSONAS}個まで作成できます`);
        return null;
      }

      const now = Date.now();
      const newPersona: Persona = {
        ...personaData,
        id: `persona-${now}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };

      setPersonas((prev) => [...prev, newPersona]);
      logger.info(`Persona created: ${newPersona.id}`, 'usePersonaStorage');
      return newPersona;
    },
    [personas.length],
  );

  // ペルソナの更新
  const updatePersona = useCallback((personaId: string, updates: Partial<Persona>): boolean => {
    setPersonas((prev) =>
      prev.map((persona) =>
        persona.id === personaId
          ? { ...persona, ...updates, updatedAt: Date.now() }
          : persona,
      ),
    );
    logger.info(`Persona updated: ${personaId}`, 'usePersonaStorage');
    return true;
  }, []);

  // ペルソナの削除
  const deletePersona = useCallback(
    (personaId: string): boolean => {
      if (personas.length === 0) {
        return false;
      }

      // デフォルトペルソナを削除する場合は、デフォルトを解除
      if (defaultPersonaId === personaId) {
        setDefaultPersonaId(null);
      }

      setPersonas((prev) => prev.filter((persona) => persona.id !== personaId));
      logger.info(`Persona deleted: ${personaId}`, 'usePersonaStorage');
      return true;
    },
    [personas.length, defaultPersonaId],
  );

  // デフォルトペルソナの設定
  const setDefaultPersona = useCallback((personaId: string | null) => {
    setDefaultPersonaId(personaId);
    if (personaId) {
      setSelectedPersonaId(personaId);
    }
    logger.info(`Default persona set: ${personaId}`, 'usePersonaStorage');
  }, []);

  // ペルソナの取得
  const getPersona = useCallback(
    (personaId: string | null): Persona | null => {
      if (!personaId) return null;
      return personas.find((p) => p.id === personaId) || null;
    },
    [personas],
  );

  // デフォルトペルソナの取得
  const getDefaultPersona = useCallback((): Persona | null => {
    if (!defaultPersonaId) return null;
    return personas.find((p) => p.id === defaultPersonaId) || null;
  }, [personas, defaultPersonaId]);

  return {
    personas,
    setPersonas,
    selectedPersonaId,
    setSelectedPersonaId,
    defaultPersonaId,
    setDefaultPersona,
    createPersona,
    updatePersona,
    deletePersona,
    getPersona,
    getDefaultPersona,
  };
}

