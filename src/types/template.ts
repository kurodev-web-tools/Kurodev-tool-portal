export interface ThumbnailTemplate {
  id: string;
  name: string;
  genre: string; // ジャンルプロパティを動的に変更
  initialText: string;
  initialTextColor: string;
  initialFontSize: string;
  initialImageSrc: string; // 必須に変更
  initialBackgroundImagePosition?: { x: number; y: number; width: number; height: number };
  initialCharacterImagePosition?: { x: number; y: number; width: number; height: number };
  initialTextPosition?: { x: number; y: number; width: number; height: number };
  supportedAspectRatios: string[];
}
