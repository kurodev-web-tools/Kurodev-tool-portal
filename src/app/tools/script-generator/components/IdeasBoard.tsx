'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Search, Filter, X, Star, GripVertical, FileText, FileDown, Share2, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { Idea, IdeaCategory, IdeaDifficulty } from '../types';

interface IdeasBoardProps {
  filteredIdeas: Idea[];
  generatedIdeas: Idea[];
  selectedIdeaId: number | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: IdeaCategory[];
  setSelectedCategories: (categories: IdeaCategory[]) => void;
  selectedDifficulty: IdeaDifficulty | 'all';
  setSelectedDifficulty: (difficulty: IdeaDifficulty | 'all') => void;
  durationFilter: { min?: number; max?: number };
  setDurationFilter: (filter: { min?: number; max?: number }) => void;
  handleCardClick: (id: number) => void;
  handleDragEnd: (result: DropResult) => void;
  handleToggleFavorite: (id: number) => void;
  handleCopyIdea: (idea: Idea) => void;
  handleShareIdeaUrl: (idea: Idea) => void;
  handleExportIdeaAsText: (idea: Idea) => void;
  handleExportIdeaAsPDF: (idea: Idea) => void;
  handleGenerateScript: (idea: Idea) => void;
  isGeneratingScript: boolean;
  categoryConfig: Record<IdeaCategory, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    badgeColor: string;
    borderColor: string;
    gradient: string;
  }>;
}

export function IdeasBoard({
  filteredIdeas,
  generatedIdeas,
  selectedIdeaId,
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  selectedDifficulty,
  setSelectedDifficulty,
  durationFilter,
  setDurationFilter,
  handleCardClick,
  handleDragEnd,
  handleToggleFavorite,
  handleCopyIdea,
  handleShareIdeaUrl,
  handleExportIdeaAsText,
  handleExportIdeaAsPDF,
  handleGenerateScript,
  isGeneratingScript,
  categoryConfig,
}: IdeasBoardProps) {
  return (
    <div className="space-y-4">
      {/* 検索・フィルター */}
      {generatedIdeas.length > 0 && (
        <div className="space-y-3 p-4 bg-[#2D2D2D] rounded-lg border border-[#4A4A4A]">
          <div className="space-y-3">
            {/* 検索バー */}
            <div className="space-y-2">
              <Label htmlFor="idea-search" className="flex items-center gap-2 text-sm text-[#E0E0E0]">
                <Search className="h-4 w-4" />
                検索
              </Label>
              <Input
                id="idea-search"
                placeholder="タイトル、説明、ポイントで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
              />
            </div>
            
            {/* カテゴリフィルター */}
            <div className="space-y-2">
              <Label className="text-sm text-[#A0A0A0]">カテゴリ</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(categoryConfig) as IdeaCategory[]).map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <Button
                      key={category}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                      className={cn(
                        "text-xs",
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-[#1A1A1A] border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]"
                      )}
                    >
                      {categoryConfig[category].label}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* 難易度フィルター */}
            <div className="space-y-2">
              <Label className="text-sm text-[#A0A0A0]">難易度</Label>
              <Select 
                value={selectedDifficulty} 
                onValueChange={(value) => setSelectedDifficulty(value as IdeaDifficulty | 'all')}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="easy">初級</SelectItem>
                  <SelectItem value="medium">中級</SelectItem>
                  <SelectItem value="hard">上級</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 予想時間フィルター */}
            <div className="space-y-2">
              <Label className="text-sm text-[#A0A0A0]">予想配信時間</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="最小"
                  min="0"
                  value={durationFilter.min || ''}
                  onChange={(e) => setDurationFilter({
                    ...durationFilter,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
                />
                <span className="text-[#A0A0A0]">〜</span>
                <Input
                  type="number"
                  placeholder="最大"
                  min="0"
                  value={durationFilter.max || ''}
                  onChange={(e) => setDurationFilter({
                    ...durationFilter,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="bg-[#1A1A1A] border-[#4A4A4A] text-[#E0E0E0] placeholder:text-[#4A4A4A]"
                />
              </div>
            </div>
          </div>
          
          {/* フィルターリセットボタン */}
          {(searchQuery || selectedCategories.length > 0 || selectedDifficulty !== 'all' || durationFilter.min !== undefined || durationFilter.max !== undefined) && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories([]);
                  setSelectedDifficulty('all');
                  setDurationFilter({});
                }}
                className="border-[#4A4A4A] text-[#A0A0A0] hover:bg-[#4A4A4A]"
              >
                <X className="h-4 w-4 mr-1" />
                フィルターをクリア
              </Button>
            </div>
          )}
          
          {/* 検索結果数表示 */}
          <div className="text-sm text-[#A0A0A0] pt-2 border-t border-[#4A4A4A]">
            <span className="font-medium text-[#E0E0E0]">{filteredIdeas.length}</span>件の企画案が見つかりました
            {filteredIdeas.length < generatedIdeas.length && (
              <span className="ml-2">（全{generatedIdeas.length}件中）</span>
            )}
          </div>
        </div>
      )}
      
      {/* フィルター結果が0件の場合 */}
      {generatedIdeas.length > 0 && filteredIdeas.length === 0 && (
        <div className="w-full bg-[#2D2D2D] rounded-md flex flex-col items-center justify-center text-center p-8 min-h-[400px] border border-[#4A4A4A]">
          <Search className="w-12 h-12 text-[#A0A0A0] mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-[#E0E0E0] mb-2">検索条件に一致する企画案がありません</h3>
          <p className="text-[#A0A0A0] mb-4">検索条件やフィルターを変更してお試しください。</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategories([]);
              setSelectedDifficulty('all');
              setDurationFilter({});
            }}
            className="border-[#4A4A4A]"
          >
            <X className="h-4 w-4 mr-1" />
            フィルターをクリア
          </Button>
        </div>
      )}
      
      {/* 企画案カード一覧 */}
      {filteredIdeas.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="ideas">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-4"
              >
                {filteredIdeas.map((idea, index) => {
                  const category = categoryConfig[idea.category];
                  const CategoryIcon = category.icon;
                  
                  return (
                    <Draggable 
                      key={idea.id} 
                      draggableId={idea.id.toString()} 
                      index={index}
                      isDragDisabled={idea.isFavorite}
                    >
                      {(provided, snapshot) => (
                        <Card 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "cursor-pointer transition-all relative overflow-hidden",
                            "hover:border-primary hover:shadow-lg hover:shadow-primary/20",
                            selectedIdeaId === idea.id && "border-primary shadow-md",
                            snapshot.isDragging && "shadow-2xl opacity-90 bg-[#3A3A3A]",
                            idea.isFavorite && "border-l-4 border-l-yellow-500/80",
                            `bg-gradient-to-br ${category.gradient}`,
                            !idea.isFavorite && `border-l-4 ${category.borderColor}`
                          )}
                          onClick={() => handleCardClick(idea.id)}
                          role="button"
                          tabIndex={0}
                          aria-expanded={selectedIdeaId === idea.id}
                          aria-label={`企画案: ${idea.title}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCardClick(idea.id);
                            }
                          }}
                        >
                          {/* ドラッグハンドル */}
                          {!idea.isFavorite && (
                            <div 
                              {...provided.dragHandleProps}
                              className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-[#4A4A4A]/50 z-10 rounded-l-md transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical className="h-4 w-4 text-[#A0A0A0]" />
                            </div>
                          )}
                          
                          <CardHeader className={cn("pb-3", !idea.isFavorite && "pl-8")}>
                            <div className="flex items-start gap-3">
                              {/* カテゴリアイコン */}
                              <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center shadow-md flex-shrink-0",
                                category.bgColor,
                                "border border-[#4A4A4A]"
                              )}>
                                <CategoryIcon className="h-6 w-6 text-[#E0E0E0]" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <CardTitle className="text-lg font-semibold line-clamp-2 text-[#E0E0E0] flex-1">
                                    {idea.title}
                                  </CardTitle>
                                  
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* お気に入りボタン */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavorite(idea.id);
                                      }}
                                      className={cn(
                                        "h-8 w-8",
                                        idea.isFavorite 
                                          ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" 
                                          : "text-[#A0A0A0] hover:text-yellow-400 hover:bg-yellow-500/10"
                                      )}
                                      aria-label={idea.isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
                                    >
                                      <Star className={cn(
                                        "h-4 w-4 transition-all",
                                        idea.isFavorite && "fill-current"
                                      )} />
                                    </Button>
                                    
                                    {/* 共有・エクスポートメニュー */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => e.stopPropagation()}
                                          className="h-8 w-8 text-[#A0A0A0] hover:text-[#E0E0E0] hover:bg-[#4A4A4A]"
                                          aria-label="共有・エクスポート"
                                        >
                                          <Share2 className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent 
                                        align="end" 
                                        className="bg-[#2D2D2D] border-[#4A4A4A] min-w-[180px]"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyIdea(idea);
                                          }}
                                          className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                                        >
                                          <Copy className="h-4 w-4 mr-2" />
                                          コピー
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleShareIdeaUrl(idea);
                                          }}
                                          className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                                        >
                                          <Share2 className="h-4 w-4 mr-2" />
                                          URL共有
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-[#4A4A4A]" />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportIdeaAsText(idea);
                                          }}
                                          className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                                        >
                                          <FileText className="h-4 w-4 mr-2" />
                                          テキストエクスポート
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleExportIdeaAsPDF(idea);
                                          }}
                                          className="text-[#E0E0E0] hover:bg-[#4A4A4A] cursor-pointer"
                                        >
                                          <FileDown className="h-4 w-4 mr-2" />
                                          PDFエクスポート
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    
                                    {/* 予想配信時間 */}
                                    <Badge variant="outline" className="flex-shrink-0 border-[#4A4A4A] text-[#A0A0A0]">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {idea.estimatedDuration}分
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {/* カテゴリバッジ */}
                                  <Badge className={cn(
                                    category.badgeColor,
                                    "text-xs font-medium"
                                  )}>
                                    {category.label}
                                  </Badge>
                                  
                                  {/* 難易度バッジ */}
                                  {idea.difficulty && (
                                    <Badge 
                                      variant="outline"
                                      className={cn(
                                        "text-xs font-medium border-[#4A4A4A]",
                                        idea.difficulty === 'easy' && 'text-green-400 border-green-500/50 bg-green-500/10',
                                        idea.difficulty === 'medium' && 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
                                        idea.difficulty === 'hard' && 'text-red-400 border-red-500/50 bg-red-500/10',
                                      )}
                                    >
                                      {idea.difficulty === 'easy' ? '初級' : 
                                       idea.difficulty === 'medium' ? '中級' : '上級'}
                                    </Badge>
                                  )}
                                </div>
                                
                                <CardDescription className="line-clamp-2 text-[#A0A0A0]">
                                  {idea.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            <h4 className="font-semibold text-sm mb-2 text-[#E0E0E0]">おすすめポイント</h4>
                            <div className="flex flex-wrap gap-2">
                              {idea.points.map((point: string, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary"
                                  className="text-xs bg-[#2D2D2D] text-[#A0A0A0] border-[#4A4A4A]"
                                >
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          
                          <CardFooter className="gap-2">
                            <Button variant="outline" aria-label="この企画を調整" className="border-[#4A4A4A]">
                              この企画を調整
                            </Button>
                            <Button 
                              onClick={() => handleGenerateScript(idea)}
                              disabled={isGeneratingScript}
                              aria-label={`${idea.title}の台本を生成`}
                            >
                              {isGeneratingScript ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                  台本生成中...
                                </>
                              ) : (
                                <>
                                  <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                                  台本を生成する
                                </>
                              )}
                            </Button>
                          </CardFooter>
                        </Card>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

