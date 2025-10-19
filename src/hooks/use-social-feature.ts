'use client';

import { useState, useEffect, useCallback } from 'react';

interface VTuberProfile {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  followerCount: number;
  isOnline: boolean;
  lastActive: number;
}

interface Collaboration {
  id: string;
  title: string;
  description: string;
  participants: VTuberProfile[];
  status: 'planning' | 'active' | 'completed';
  createdAt: number;
  tools: string[];
}

interface SocialFeature {
  profiles: VTuberProfile[];
  collaborations: Collaboration[];
  addCollaboration: (collaboration: Omit<Collaboration, 'id' | 'createdAt'>) => void;
  joinCollaboration: (collaborationId: string, profile: VTuberProfile) => void;
  shareTool: (toolId: string, profile: VTuberProfile) => void;
  getOnlineVTubers: () => VTuberProfile[];
  getRecommendedCollaborations: () => Collaboration[];
}

const STORAGE_KEY_PROFILES = 'vtuber-tools-profiles';
const STORAGE_KEY_COLLABORATIONS = 'vtuber-tools-collaborations';

// ダミーのVTuberプロフィールデータ
const dummyProfiles: VTuberProfile[] = [
  {
    id: 'vtuber-1',
    name: 'あいりん',
    avatar: '🌸',
    specialty: '歌配信',
    followerCount: 125000,
    isOnline: true,
    lastActive: Date.now() - 300000, // 5分前
  },
  {
    id: 'vtuber-2',
    name: 'みく',
    avatar: '🎮',
    specialty: 'ゲーム配信',
    followerCount: 89000,
    isOnline: true,
    lastActive: Date.now() - 600000, // 10分前
  },
  {
    id: 'vtuber-3',
    name: 'ゆき',
    avatar: '❄️',
    specialty: '雑談配信',
    followerCount: 67000,
    isOnline: false,
    lastActive: Date.now() - 3600000, // 1時間前
  },
  {
    id: 'vtuber-4',
    name: 'はな',
    avatar: '🌺',
    specialty: 'アート配信',
    followerCount: 45000,
    isOnline: true,
    lastActive: Date.now() - 120000, // 2分前
  },
];

export function useSocialFeature(): SocialFeature {
  const [profiles, setProfiles] = useState<VTuberProfile[]>(dummyProfiles);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);

  // プロフィールを保存
  const saveProfiles = useCallback((newProfiles: VTuberProfile[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(newProfiles));
    }
  }, []);

  // コラボレーションを保存
  const saveCollaborations = useCallback((newCollaborations: Collaboration[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COLLABORATIONS, JSON.stringify(newCollaborations));
    }
  }, []);

  // コラボレーションを追加
  const addCollaboration = useCallback((collaboration: Omit<Collaboration, 'id' | 'createdAt'>) => {
    const newCollaboration: Collaboration = {
      ...collaboration,
      id: `collab-${Date.now()}`,
      createdAt: Date.now(),
    };

    const updatedCollaborations = [...collaborations, newCollaboration];
    setCollaborations(updatedCollaborations);
    saveCollaborations(updatedCollaborations);
  }, [collaborations, saveCollaborations]);

  // コラボレーションに参加
  const joinCollaboration = useCallback((collaborationId: string, profile: VTuberProfile) => {
    const updatedCollaborations = collaborations.map(collab => {
      if (collab.id === collaborationId) {
        const isAlreadyParticipant = collab.participants.some(p => p.id === profile.id);
        if (!isAlreadyParticipant) {
          return {
            ...collab,
            participants: [...collab.participants, profile],
          };
        }
      }
      return collab;
    });

    setCollaborations(updatedCollaborations);
    saveCollaborations(updatedCollaborations);
  }, [collaborations, saveCollaborations]);

  // ツールを共有
  const shareTool = useCallback((toolId: string, profile: VTuberProfile) => {
    // 実際の実装では、ここでAPIを呼び出してツールを共有
    console.log(`${profile.name}に${toolId}を共有しました`);
    
    // 通知を表示（実際の実装では、トースト通知など）
    if (typeof window !== 'undefined') {
      alert(`${profile.name}にツールを共有しました！`);
    }
  }, []);

  // オンラインのVTuberを取得
  const getOnlineVTubers = useCallback(() => {
    return profiles.filter(profile => profile.isOnline);
  }, [profiles]);

  // 推奨コラボレーションを取得
  const getRecommendedCollaborations = useCallback(() => {
    return collaborations
      .filter(collab => collab.status === 'planning')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [collaborations]);

  // 初期化時に既存のデータを読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
      const savedCollaborations = localStorage.getItem(STORAGE_KEY_COLLABORATIONS);

      if (savedProfiles) {
        try {
          setProfiles(JSON.parse(savedProfiles));
        } catch (error) {
          console.error('Failed to parse saved profiles:', error);
        }
      }

      if (savedCollaborations) {
        try {
          setCollaborations(JSON.parse(savedCollaborations));
        } catch (error) {
          console.error('Failed to parse saved collaborations:', error);
        }
      }
    }
  }, []);

  return {
    profiles,
    collaborations,
    addCollaboration,
    joinCollaboration,
    shareTool,
    getOnlineVTubers,
    getRecommendedCollaborations,
  };
}
