import type { Meta, StoryObj } from '@storybook/react';
import { MobileDisplaySettings } from '../MobileDisplaySettings';

const meta: Meta<typeof MobileDisplaySettings> = {
  title: 'Components/MobileDisplaySettings',
  component: MobileDisplaySettings,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    zoom: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
      description: 'ズームレベル',
    },
    onZoomChange: {
      action: 'onZoomChange',
      description: 'ズーム変更時のコールバック',
    },
    showGrid: {
      control: 'boolean',
      description: 'グリッド表示の有無',
    },
    onShowGridChange: {
      action: 'onShowGridChange',
      description: 'グリッド表示変更時のコールバック',
    },
    showGuides: {
      control: 'boolean',
      description: 'ガイドライン表示の有無',
    },
    onShowGuidesChange: {
      action: 'onShowGuidesChange',
      description: 'ガイドライン表示変更時のコールバック',
    },
    showSafeArea: {
      control: 'boolean',
      description: 'セーフエリア表示の有無',
    },
    onShowSafeAreaChange: {
      action: 'onShowSafeAreaChange',
      description: 'セーフエリア表示変更時のコールバック',
    },
    showAspectGuide: {
      control: 'boolean',
      description: 'アスペクト比ガイド表示の有無',
    },
    onShowAspectGuideChange: {
      action: 'onShowAspectGuideChange',
      description: 'アスペクト比ガイド表示変更時のコールバック',
    },
    gridSize: {
      control: { type: 'range', min: 10, max: 50, step: 5 },
      description: 'グリッドサイズ',
    },
    onGridSizeChange: {
      action: 'onGridSizeChange',
      description: 'グリッドサイズ変更時のコールバック',
    },
    className: {
      control: 'text',
      description: 'カスタムCSSクラス',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    zoom: 1.0,
    onZoomChange: (zoom: number) => {
      console.log('Zoom changed:', zoom);
    },
    showGrid: false,
    onShowGridChange: (show: boolean) => {
      console.log('Grid visibility changed:', show);
    },
    showGuides: false,
    onShowGuidesChange: (show: boolean) => {
      console.log('Guides visibility changed:', show);
    },
  },
};

export const WithGridEnabled: Story = {
  args: {
    zoom: 1.5,
    onZoomChange: (zoom: number) => {
      console.log('Zoom changed:', zoom);
    },
    showGrid: true,
    onShowGridChange: (show: boolean) => {
      console.log('Grid visibility changed:', show);
    },
    showGuides: true,
    onShowGuidesChange: (show: boolean) => {
      console.log('Guides visibility changed:', show);
    },
    gridSize: 20,
    onGridSizeChange: (size: number) => {
      console.log('Grid size changed:', size);
    },
  },
};

export const WithAllFeatures: Story = {
  args: {
    zoom: 2.0,
    onZoomChange: (zoom: number) => {
      console.log('Zoom changed:', zoom);
    },
    showGrid: true,
    onShowGridChange: (show: boolean) => {
      console.log('Grid visibility changed:', show);
    },
    showGuides: true,
    onShowGuidesChange: (show: boolean) => {
      console.log('Guides visibility changed:', show);
    },
    showSafeArea: true,
    onShowSafeAreaChange: (show: boolean) => {
      console.log('Safe area visibility changed:', show);
    },
    showAspectGuide: true,
    onShowAspectGuideChange: (show: boolean) => {
      console.log('Aspect guide visibility changed:', show);
    },
    gridSize: 30,
    onGridSizeChange: (size: number) => {
      console.log('Grid size changed:', size);
    },
  },
};

export const CustomClassName: Story = {
  args: {
    zoom: 1.0,
    onZoomChange: (zoom: number) => {
      console.log('Zoom changed:', zoom);
    },
    showGrid: false,
    onShowGridChange: (show: boolean) => {
      console.log('Grid visibility changed:', show);
    },
    showGuides: false,
    onShowGuidesChange: (show: boolean) => {
      console.log('Guides visibility changed:', show);
    },
    className: 'custom-display-settings',
  },
};
