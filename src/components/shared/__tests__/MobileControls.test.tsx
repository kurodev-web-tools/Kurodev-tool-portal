/**
 * MobileControlsコンポーネントのテスト
 * 
 * テスト対象:
 * - レンダリング
 * - スライダーの動作
 * - 数値入力の動作
 * - リセットボタンの動作
 * - レイヤープロパティの更新
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileControls } from '../MobileControls';
import { TextLayer } from '@/types/layers';

// テスト用のモックレイヤーデータ
const mockSelectedLayer: TextLayer = {
  id: '1',
  type: 'text',
  name: 'テストテキスト',
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

// モック関数
const mockOnUpdateLayer = jest.fn();

describe('MobileControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render mobile controls correctly', () => {
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    expect(screen.getByText('位置調整')).toBeInTheDocument();
    expect(screen.getByText('サイズ調整')).toBeInTheDocument();
    expect(screen.getByText('回転調整')).toBeInTheDocument();
    expect(screen.getByText('透明度調整')).toBeInTheDocument();
  });

  it('should display current layer values correctly', () => {
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    // X座標の値
    const xInput = screen.getByDisplayValue('100');
    expect(xInput).toBeInTheDocument();

    // Y座標の値
    const yInput = screen.getByDisplayValue('150');
    expect(yInput).toBeInTheDocument();

    // 幅の値
    const widthInput = screen.getByDisplayValue('200');
    expect(widthInput).toBeInTheDocument();

    // 高さの値
    const heightInput = screen.getByDisplayValue('60');
    expect(heightInput).toBeInTheDocument();

    // 回転の値
    const rotationInput = screen.getByDisplayValue('45');
    expect(rotationInput).toBeInTheDocument();

    // 透明度の値
    const opacityInput = screen.getByDisplayValue('0.8');
    expect(opacityInput).toBeInTheDocument();
  });

  it('should update layer position when X coordinate changes', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const xInput = screen.getByDisplayValue('100');
    await user.clear(xInput);
    await user.type(xInput, '250');

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { x: 250 });
  });

  it('should update layer position when Y coordinate changes', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const yInput = screen.getByDisplayValue('150');
    await user.clear(yInput);
    await user.type(yInput, '300');

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { y: 300 });
  });

  it('should update layer size when width changes', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const widthInput = screen.getByDisplayValue('200');
    await user.clear(widthInput);
    await user.type(widthInput, '350');

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { width: 350 });
  });

  it('should update layer size when height changes', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const heightInput = screen.getByDisplayValue('60');
    await user.clear(heightInput);
    await user.type(heightInput, '120');

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { height: 120 });
  });

  it('should update layer rotation when rotation changes', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const rotationInput = screen.getByDisplayValue('45');
    await user.clear(rotationInput);
    await user.type(rotationInput, '90');

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { rotation: 90 });
  });

  it('should update layer opacity when opacity changes', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const opacityInput = screen.getByDisplayValue('0.8');
    await user.clear(opacityInput);
    await user.type(opacityInput, '0.5');

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { opacity: 0.5 });
  });

  it('should reset position when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const resetPositionButton = screen.getByText('位置リセット');
    await user.click(resetPositionButton);

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { x: 0, y: 0 });
  });

  it('should reset size when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const resetSizeButton = screen.getByText('サイズリセット');
    await user.click(resetSizeButton);

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { width: 100, height: 100 });
  });

  it('should reset rotation when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const resetRotationButton = screen.getByText('回転リセット');
    await user.click(resetRotationButton);

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { rotation: 0 });
  });

  it('should reset opacity when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const resetOpacityButton = screen.getByText('透明度リセット');
    await user.click(resetOpacityButton);

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { opacity: 1 });
  });

  it('should handle slider changes for position', () => {
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    // スライダーを直接取得（name属性がないため）
    const sliders = screen.getAllByRole('slider');
    const xSlider = sliders[0]; // 最初のスライダー（X座標）
    fireEvent.change(xSlider, { target: { value: '300' } });

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { x: 300 });
  });

  it('should handle slider changes for size', () => {
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    // スライダーを直接取得（name属性がないため）
    const sliders = screen.getAllByRole('slider');
    const widthSlider = sliders[2]; // 3番目のスライダー（幅）
    fireEvent.change(widthSlider, { target: { value: '400' } });

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { width: 400 });
  });

  it('should handle slider changes for rotation', () => {
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    // スライダーを直接取得（name属性がないため）
    const sliders = screen.getAllByRole('slider');
    const rotationSlider = sliders[4]; // 5番目のスライダー（回転）
    fireEvent.change(rotationSlider, { target: { value: '180' } });

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { rotation: 180 });
  });

  it('should handle slider changes for opacity', () => {
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    // スライダーを直接取得（name属性がないため）
    const sliders = screen.getAllByRole('slider');
    const opacitySlider = sliders[5]; // 6番目のスライダー（透明度）
    fireEvent.change(opacitySlider, { target: { value: '0.3' } });

    expect(mockOnUpdateLayer).toHaveBeenCalledWith('1', { opacity: 0.3 });
  });

  it('should handle null selectedLayer gracefully', () => {
    render(
      <MobileControls
        selectedLayer={null}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    expect(screen.getByText('レイヤーを選択してください')).toBeInTheDocument();
  });

  it('should validate input values correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    const xInput = screen.getByDisplayValue('100');
    
    // 有効な値を入力
    await user.clear(xInput);
    await user.type(xInput, '250');
    
    // 入力値の変更を確認
    expect(xInput).toHaveValue(250);
  });

  it('should handle layer without opacity property', () => {
    const layerWithoutOpacity = { ...mockSelectedLayer };
    delete (layerWithoutOpacity as any).opacity;
    
    render(
      <MobileControls
        selectedLayer={layerWithoutOpacity}
        onUpdateLayer={mockOnUpdateLayer}
      />
    );

    // デフォルト値1が表示されることを確認（opacityプロパティがない場合）
    const opacityInputs = screen.getAllByDisplayValue('1');
    expect(opacityInputs.length).toBeGreaterThan(0);
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <MobileControls
        selectedLayer={mockSelectedLayer}
        onUpdateLayer={mockOnUpdateLayer}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
