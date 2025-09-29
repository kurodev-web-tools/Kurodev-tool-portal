import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

interface ShapeOption {
  type: ShapeType;
  name: string;
  icon: string;
  description: string;
}

const shapeOptions: ShapeOption[] = [
  {
    type: 'rectangle',
    name: '四角形',
    icon: '⬜',
    description: '基本的な四角形'
  },
  {
    type: 'circle',
    name: '円',
    icon: '⭕',
    description: '完全な円形'
  },
  {
    type: 'line',
    name: '線',
    icon: '➖',
    description: '直線'
  },
  {
    type: 'arrow',
    name: '矢印',
    icon: '➡️',
    description: '方向を示す矢印'
  }
];

interface ShapeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (shapeType: ShapeType) => void;
}

export const ShapeSelectorModal: React.FC<ShapeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const handleSelect = (shapeType: ShapeType) => {
    onSelect(shapeType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            図形を選択してください
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {shapeOptions.map((option) => (
            <Button
              key={option.type}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelect(option.type)}
            >
              <span className="text-2xl">{option.icon}</span>
              <div className="text-center">
                <div className="font-medium">{option.name}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShapeSelectorModal;
