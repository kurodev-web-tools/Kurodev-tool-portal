import type { Meta, StoryObj } from '@storybook/react';
import { MobileControls } from '../MobileControls';
import { TextLayer } from '@/types/layers';

const meta: Meta<typeof MobileControls> = {
  title: 'Components/MobileControls',
  component: MobileControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    selectedLayer: {
      control: 'object',
      description: '選択されたレイヤー',
    },
    onUpdateLayer: {
      action: 'onUpdateLayer',
      description: 'レイヤー更新時のコールバック',
    },
    className: {
      control: 'text',
      description: 'カスタムCSSクラス',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルレイヤーデータ
const sampleTextLayer: TextLayer = {
  id: '1',
  type: 'text',
  name: 'サンプルテキスト',
  visible: true,
  locked: false,
  x: 100,
  y: 150,
  width: 200,
  height: 60,
  rotation: 45,
  zIndex: 1,
  text: 'サンプルテキスト',
  color: '#FFFFFF',
  fontSize: '24px',
  opacity: 0.8,
};

export const Default: Story = {
  args: {
    selectedLayer: sampleTextLayer,
    onUpdateLayer: (id: string, updates: any) => {
      console.log('Layer updated:', id, updates);
    },
  },
};

export const WithoutLayer: Story = {
  args: {
    selectedLayer: null,
    onUpdateLayer: (id: string, updates: any) => {
      console.log('Layer updated:', id, updates);
    },
  },
};

export const LockedLayer: Story = {
  args: {
    selectedLayer: {
      ...sampleTextLayer,
      locked: true,
    },
    onUpdateLayer: (id: string, updates: any) => {
      console.log('Layer updated:', id, updates);
    },
  },
};

export const CustomClassName: Story = {
  args: {
    selectedLayer: sampleTextLayer,
    onUpdateLayer: (id: string, updates: any) => {
      console.log('Layer updated:', id, updates);
    },
    className: 'custom-mobile-controls',
  },
};
