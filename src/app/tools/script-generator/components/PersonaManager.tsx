'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Check, Edit2, Star, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Persona } from '../types';

interface PersonaManagerProps {
  personas: Persona[];
  selectedPersonaId: string | null;
  setSelectedPersonaId: (id: string | null) => void;
  defaultPersonaId: string | null;
  setDefaultPersona: (id: string) => void;
  handleEditPersona: (persona: Persona) => void;
  deletePersona: (id: string) => void;
  handleCreatePersona: () => void;
  showSelect?: boolean; // モバイル版ではSelectを表示、デスクトップ版では非表示
  maxHeight?: string; // リストの最大高さ
}

export function PersonaManager({
  personas,
  selectedPersonaId,
  setSelectedPersonaId,
  defaultPersonaId,
  setDefaultPersona,
  handleEditPersona,
  deletePersona,
  handleCreatePersona,
  showSelect = false,
  maxHeight = '500px',
}: PersonaManagerProps) {
  return (
    <div className="space-y-4">
      {/* ペルソナ選択（モバイル版のみ） */}
      {showSelect && (
        <div className="space-y-2">
          <Label htmlFor="persona-select">使用するペルソナ</Label>
          <Select 
            value={selectedPersonaId || undefined} 
            onValueChange={(value) => setSelectedPersonaId(value || null)}
          >
            <SelectTrigger id="persona-select">
              <SelectValue placeholder="ペルソナを選択" />
            </SelectTrigger>
            <SelectContent>
              {personas.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-[#A0A0A0]">ペルソナがありません</div>
              ) : (
                personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name}
                    {defaultPersonaId === persona.id && ' (デフォルト)'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ペルソナ一覧 */}
      <div className="space-y-2 overflow-y-auto" style={{ maxHeight }}>
        {personas.length === 0 ? (
          <div className="text-center py-8 text-[#A0A0A0]">
            <Construction className="h-8 w-8 mx-auto mb-2" />
            <p>まだペルソナがありません</p>
            <p className="text-sm mt-1">新しいペルソナを作成してください</p>
          </div>
        ) : (
          personas.map((persona) => (
            <Card 
              key={persona.id}
              className={cn(
                "bg-[#2D2D2D] border-[#4A4A4A] hover:border-[#4A4A4A]/80 transition-all",
                selectedPersonaId === persona.id && "border-blue-500/50 bg-blue-500/5"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Construction className="h-4 w-4 text-[#A0A0A0]" />
                      <CardTitle className="text-sm font-semibold text-[#E0E0E0]">
                        {persona.name}
                      </CardTitle>
                      {defaultPersonaId === persona.id && (
                        <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Star className="h-3 w-3 mr-1" />
                          デフォルト
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-[#A0A0A0] line-clamp-2">
                      {persona.description}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="gap-2 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPersonaId(persona.id)}
                  className="flex-1 border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                >
                  <Check className="h-4 w-4 mr-1" />
                  選択
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPersona(persona)}
                  className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A] hover:text-[#E0E0E0]"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {defaultPersonaId !== persona.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultPersona(persona.id)}
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                    title="デフォルトに設定"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePersona(persona.id)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  disabled={defaultPersonaId === persona.id}
                  title={defaultPersonaId === persona.id ? "デフォルトペルソナは削除できません" : "削除"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* 新規作成ボタン */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleCreatePersona}
      >
        <Plus className="h-4 w-4 mr-2" />
        新しいペルソナを作成
      </Button>
    </div>
  );
}

