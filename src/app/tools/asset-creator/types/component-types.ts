// ResizableDirectionの型定義
export type ResizeDirection =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'topRight'
  | 'bottomRight'
  | 'bottomLeft'
  | 'topLeft';

// ドラッグイベントの型定義
export interface DragEvent {
  clientX: number;
  clientY: number;
  preventDefault(): void;
  stopPropagation(): void;
}

// リサイズイベントの型定義
export interface ResizeEvent extends DragEvent {
  direction: ResizeDirection;
  side: 'top' | 'right' | 'bottom' | 'left';
}

// 共通のコンポーネントプロパティ
export interface BaseThumbnailComponentProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isSelected: boolean;
  isLocked: boolean;
  isDraggable: boolean;
  enableResizing: boolean;
  onSelect: () => void;
  onDragStop: (e: DragEvent, position: { x: number; y: number }) => void;
  onResize: (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    elementRef: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => void;
  onResizeStop: (
    e: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    elementRef: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => void;
  onRotateStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onRotate: (angle: number) => void;
  onRotateStop: () => void;
}

// サイズと位置の型
export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}