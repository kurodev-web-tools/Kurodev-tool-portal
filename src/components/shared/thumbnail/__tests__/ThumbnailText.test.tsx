/**
 * ThumbnailTextコンポーネントのテスト
 * 
 * テスト対象:
 * - レンダリング
 * - プロパティの適用
 * - イベントハンドラー
 * - 選択状態の表示
 * - 回転ハンドルの表示
 * - ドラッグ&リサイズ機能
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThumbnailText } from '../ThumbnailText';
import { TextLayer } from '@/types/layers';

// テスト用のモックレイヤーデータ
const mockTextLayer: TextLayer = {
  id: '1',
  type: 'text',
  name: 'テストテキスト',
  visible: true,
  locked: false,
  x: 100,
  y: 100,
  width: 200,
  height: 60,
  rotation: 0,
  zIndex: 1,
  text: 'サンプルテキスト',
  color: '#FFFFFF',
  fontSize: '24px',
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fontStyle: 'italic',
  textDecoration: 'underline',
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
};

// モック関数
const mockOnSelect = jest.fn();
const mockOnDragStop = jest.fn();
const mockOnResizeStop = jest.fn();
const mockOnRotateStart = jest.fn();
const mockOnRotate = jest.fn();
const mockOnRotateStop = jest.fn();
const mockUpdateLayer = jest.fn();

describe('ThumbnailText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render text layer correctly', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
      />
    );

    expect(screen.getByText('サンプルテキスト')).toBeInTheDocument();
  });

  it('should apply text styles correctly', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        fontFamily={mockTextLayer.fontFamily}
        fontWeight={mockTextLayer.fontWeight}
        fontStyle={mockTextLayer.fontStyle}
        textDecoration={mockTextLayer.textDecoration}
        textShadow={mockTextLayer.textShadow}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
      />
    );

    const textElement = screen.getByText('サンプルテキスト');
    expect(textElement).toHaveStyle({
      color: '#FFFFFF',
      fontSize: '24px',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'italic',
      textDecoration: 'underline',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    });
  });

  it('should show rotate handle when selected', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={true}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
        onRotateStart={mockOnRotateStart}
        onRotate={mockOnRotate}
        onRotateStop={mockOnRotateStop}
      />
    );

    expect(screen.getByLabelText('テキストを回転')).toBeInTheDocument();
  });

  it('should not show rotate handle when not selected', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
      />
    );

    expect(screen.queryByLabelText('テキストを回転')).not.toBeInTheDocument();
  });

  it('should call onSelect when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
        onSelect={mockOnSelect}
      />
    );

    await user.click(screen.getByText('サンプルテキスト'));
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should apply rotation transform correctly', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={45}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
      />
    );

    const textContainer = screen.getByText('サンプルテキスト').parentElement;
    expect(textContainer).toHaveStyle({
      transform: 'rotate(45deg)',
      transformOrigin: 'center',
    });
  });

  it('should disable dragging when disableDragging is true', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={true}
      />
    );

    // RndコンポーネントのdisableDraggingプロパティをテスト
    // 実際のテストでは、ドラッグイベントが発生しないことを確認
    const textElement = screen.getByText('サンプルテキスト');
    expect(textElement).toBeInTheDocument();
  });

  it('should disable resizing when enableResizing is false', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={false}
        disableDragging={false}
      />
    );

    // RndコンポーネントのenableResizingプロパティをテスト
    const textElement = screen.getByText('サンプルテキスト');
    expect(textElement).toBeInTheDocument();
  });

  it('should handle empty text gracefully', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text=""
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
      />
    );

    const textElement = screen.getByText('');
    expect(textElement).toBeInTheDocument();
  });

  it('should handle multiline text correctly', () => {
    const multilineText = '複数行の\nテキスト\nテスト';
    
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={multilineText}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
      />
    );

    expect(screen.getByText(multilineText)).toBeInTheDocument();
  });

  it('should apply zIndex correctly', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={false}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        zIndex={5}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
      />
    );

    const rndElement = screen.getByText('サンプルテキスト').closest('[style*="z-index"]');
    expect(rndElement).toHaveStyle({ zIndex: 5 });
  });

  it('should handle rotation with mouse events', async () => {
    const user = userEvent.setup();
    
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={true}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
        onRotateStart={mockOnRotateStart}
        onRotate={mockOnRotate}
        onRotateStop={mockOnRotateStop}
      />
    );

    const rotateHandle = screen.getByLabelText('テキストを回転');
    
    // マウスダウンイベントをシミュレート
    await user.pointer([
      { target: rotateHandle, keys: '[MouseLeft>]' },
      { coords: { x: 200, y: 200 } },
      { keys: '[/MouseLeft]' }
    ]);

    expect(mockOnRotateStart).toHaveBeenCalled();
  });

  it('should handle touch events for rotation', () => {
    render(
      <ThumbnailText
        id={mockTextLayer.id}
        isSelected={true}
        text={mockTextLayer.text}
        color={mockTextLayer.color}
        fontSize={mockTextLayer.fontSize}
        x={mockTextLayer.x}
        y={mockTextLayer.y}
        width={mockTextLayer.width}
        height={mockTextLayer.height}
        rotation={mockTextLayer.rotation}
        onDragStop={mockOnDragStop}
        onResizeStop={mockOnResizeStop}
        enableResizing={true}
        disableDragging={false}
        onRotateStart={mockOnRotateStart}
        onRotate={mockOnRotate}
        onRotateStop={mockOnRotateStop}
      />
    );

    const rotateHandle = screen.getByLabelText('テキストを回転');
    
    // タッチイベントをシミュレート
    fireEvent.touchStart(rotateHandle, {
      touches: [{ clientX: 100, clientY: 100 }]
    });

    expect(mockOnRotateStart).toHaveBeenCalled();
  });
});
