import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Hash, Star, X, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagButtonGroup } from '@/components/shared/TagButtonGroup';

const YOUTUBE_HASHTAG_RECOMMENDED_COUNT = 15;

interface HashtagManagerProps {
  hashtags: string[];
  newHashtagInput: string;
  keywords: string;
  videoTheme: string;
  isClient: boolean;
  onNewHashtagInputChange: (value: string) => void;
  onAddHashtag: (tag: string) => void;
  onRemoveHashtag: (tag: string) => void;
  onSaveToFavorites: (tag: string) => void;
  onLoadFavorites: () => string[];
  onSuggestHashtags: (keywords: string, videoTheme: string) => string[];
  onSetPreset: (preset: string[]) => void;
}

export function HashtagManager({
  hashtags,
  newHashtagInput,
  keywords,
  videoTheme,
  isClient,
  onNewHashtagInputChange,
  onAddHashtag,
  onRemoveHashtag,
  onSaveToFavorites,
  onLoadFavorites,
  onSuggestHashtags,
  onSetPreset,
}: HashtagManagerProps) {
  const suggestions = onSuggestHashtags(keywords, videoTheme);
  const availableSuggestions = suggestions.filter(
    (s) => !hashtags.includes(s),
  );
  const favorites = isClient ? onLoadFavorites() : [];
  const availableFavorites = favorites.filter(
    (f) => !hashtags.includes(f),
  );

  return (
    <div>
      <Label className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2">
          <Hash className="h-4 w-4" />
          ハッシュタグ
        </span>
        <span
          className={cn(
            'text-xs font-normal',
            hashtags.length > YOUTUBE_HASHTAG_RECOMMENDED_COUNT
              ? 'text-yellow-400'
              : hashtags.length >= 10 &&
                  hashtags.length <= YOUTUBE_HASHTAG_RECOMMENDED_COUNT
                ? 'text-green-400'
                : 'text-muted-foreground',
          )}
        >
          {hashtags.length} / {YOUTUBE_HASHTAG_RECOMMENDED_COUNT}
          （推奨: 10-15個）
        </span>
      </Label>

      {/* ハッシュタグ一覧 */}
      <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px] bg-muted/30 mb-2">
        {hashtags.length === 0 ? (
          <div className="text-sm text-muted-foreground italic w-full text-center py-2">
            ハッシュタグがありません
          </div>
        ) : (
          hashtags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1.5 px-2 py-1 text-sm group/hashtag"
            >
              <Hash className="h-3 w-3" />
              {tag}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover/hashtag:opacity-100 hover:bg-[#20B2AA]/20 hover:text-[#20B2AA] rounded-full transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveToFavorites(tag);
                  }}
                  aria-label={`${tag}をお気に入りに追加`}
                >
                  <Star className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  onClick={() => onRemoveHashtag(tag)}
                  aria-label={`${tag}を削除`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Badge>
          ))
        )}
      </div>

      {/* ハッシュタグ追加・管理 */}
      <div className="space-y-2">
        {/* 新規ハッシュタグ入力 */}
        <div className="flex gap-2">
          <Input
            placeholder="ハッシュタグを入力（#は不要）"
            value={newHashtagInput}
            onChange={(e) => onNewHashtagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newHashtagInput.trim()) {
                onAddHashtag(newHashtagInput);
              }
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (newHashtagInput.trim()) {
                onAddHashtag(newHashtagInput);
              }
            }}
            disabled={!newHashtagInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* 候補提案とお気に入り */}
        <div className="flex gap-2 flex-wrap">
          {/* 候補提案ボタン */}
          <TagButtonGroup
            label="候補:"
            items={availableSuggestions}
            onItemClick={onAddHashtag}
            icon={Sparkles}
          />

          {/* お気に入りハッシュタグ */}
          {isClient && (
            <TagButtonGroup
              label="お気に入り:"
              items={availableFavorites}
              onItemClick={onAddHashtag}
              icon={Star}
              buttonClassName="text-xs h-9 md:h-7"
            />
          )}
        </div>

        {/* プリセット */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">プリセット:</span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              onSetPreset(['VTuber', 'ゲーム実況', '実況', 'エンタメ']);
            }}
          >
            ゲーム実況
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              onSetPreset(['VTuber', '歌枠', '歌ってみた', 'エンタメ']);
            }}
          >
            歌枠
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => {
              onSetPreset(['VTuber', 'コラボ', 'コラボ配信', 'エンタメ']);
            }}
          >
            コラボ
          </Button>
        </div>
      </div>
    </div>
  );
}
