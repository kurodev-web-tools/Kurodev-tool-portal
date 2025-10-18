/**
 * MobileDisplaySettingsコンポーネントのテスト
 * 
 * テスト対象:
 * - レンダリング
 * - ズームスライダーの動作
 * - フィットボタンの動作
 * - スイッチの動作
 * - グリッドサイズ調整
 * - オプショナルプロパティの処理
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileDisplaySettings } from '../MobileDisplaySettings';

// モック関数
const mockOnZoomChange = jest.fn();
const mockOnShowGridChange = jest.fn();
const mockOnShowGuidesChange = jest.fn();
const mockOnShowSafeAreaChange = jest.fn();
const mockOnShowAspectGuideChange = jest.fn();
const mockOnGridSizeChange = jest.fn();

describe('MobileDisplaySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render display settings correctly', () => {
    render(
      <MobileDisplaySettings
        zoom={1.5}
        onZoomChange={mockOnZoomChange}
        showGrid={true}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    expect(screen.getByText('表示設定')).toBeInTheDocument();
    expect(screen.getByText('拡大縮小')).toBeInTheDocument();
    expect(screen.getByText('グリッド表示')).toBeInTheDocument();
    expect(screen.getByText('ガイドライン表示')).toBeInTheDocument();
  });

  it('should display current zoom value correctly', () => {
    render(
      <MobileDisplaySettings
        zoom={1.5}
        onZoomChange={mockOnZoomChange}
        showGrid={true}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('should handle zoom slider changes', () => {
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={true}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    // スライダーを直接取得（name属性がないため）
    const sliders = screen.getAllByRole('slider');
    const zoomSlider = sliders[0]; // 最初のスライダー（ズーム）
    fireEvent.change(zoomSlider, { target: { value: '2.0' } });

    expect(mockOnZoomChange).toHaveBeenCalledWith(2.0);
  });

  it('should handle zoom in button click', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={true}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    await user.click(zoomInButton);

    expect(mockOnZoomChange).toHaveBeenCalledWith(1.1);
  });

  it('should handle zoom out button click', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={true}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
    await user.click(zoomOutButton);

    expect(mockOnZoomChange).toHaveBeenCalledWith(0.9);
  });

  it('should handle fit button click', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileDisplaySettings
        zoom={2.0}
        onZoomChange={mockOnZoomChange}
        showGrid={true}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    const fitButton = screen.getByText('フィット');
    await user.click(fitButton);

    expect(mockOnZoomChange).toHaveBeenCalledWith(1);
  });

  it('should handle grid toggle switch', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    const gridSwitch = screen.getByRole('switch', { name: /グリッド表示/i });
    await user.click(gridSwitch);

    expect(mockOnShowGridChange).toHaveBeenCalledWith(true);
  });

  it('should handle guides toggle switch', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={true}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    const guidesSwitch = screen.getByRole('switch', { name: /ガイドライン表示/i });
    await user.click(guidesSwitch);

    expect(mockOnShowGuidesChange).toHaveBeenCalledWith(false);
  });

  it('should show grid size slider when grid is enabled', () => {
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={true}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
        gridSize={30}
        onGridSizeChange={mockOnGridSizeChange}
      />
    );

    expect(screen.getByText('グリッドサイズ')).toBeInTheDocument();
    expect(screen.getByText('30px')).toBeInTheDocument();
  });

  it('should not show grid size slider when grid is disabled', () => {
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
        gridSize={30}
        onGridSizeChange={mockOnGridSizeChange}
      />
    );

    expect(screen.queryByText('グリッドサイズ')).not.toBeInTheDocument();
  });

  it('should handle grid size slider changes', () => {
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={true}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
        gridSize={20}
        onGridSizeChange={mockOnGridSizeChange}
      />
    );

    // スライダーを直接取得（name属性がないため）
    const sliders = screen.getAllByRole('slider');
    const gridSizeSlider = sliders[1]; // 2番目のスライダー（グリッドサイズ）
    fireEvent.change(gridSizeSlider, { target: { value: '40' } });

    expect(mockOnGridSizeChange).toHaveBeenCalledWith(40);
  });

  it('should show safe area switch when provided', () => {
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
        showSafeArea={true}
        onShowSafeAreaChange={mockOnShowSafeAreaChange}
      />
    );

    expect(screen.getByText('セーフエリア表示')).toBeInTheDocument();
  });

  it('should show aspect guide switch when provided', () => {
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
        showAspectGuide={true}
        onShowAspectGuideChange={mockOnShowAspectGuideChange}
      />
    );

    expect(screen.getByText('アスペクト比ガイド')).toBeInTheDocument();
  });

  it('should handle safe area toggle switch', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
        showSafeArea={false}
        onShowSafeAreaChange={mockOnShowSafeAreaChange}
      />
    );

    const safeAreaSwitch = screen.getByRole('switch', { name: /セーフエリア表示/i });
    await user.click(safeAreaSwitch);

    expect(mockOnShowSafeAreaChange).toHaveBeenCalledWith(true);
  });

  it('should handle aspect guide toggle switch', async () => {
    const user = userEvent.setup();
    
    render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
        showAspectGuide={false}
        onShowAspectGuideChange={mockOnShowAspectGuideChange}
      />
    );

    const aspectGuideSwitch = screen.getByRole('switch', { name: /アスペクト比ガイド/i });
    await user.click(aspectGuideSwitch);

    expect(mockOnShowAspectGuideChange).toHaveBeenCalledWith(true);
  });

  it('should disable zoom out button when at minimum zoom', () => {
    render(
      <MobileDisplaySettings
        zoom={0.1}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
    expect(zoomOutButton).toBeDisabled();
  });

  it('should disable zoom in button when at maximum zoom', () => {
    render(
      <MobileDisplaySettings
        zoom={3.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    expect(zoomInButton).toBeDisabled();
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <MobileDisplaySettings
        zoom={1.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle edge case zoom values', () => {
    render(
      <MobileDisplaySettings
        zoom={0.0}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle fractional zoom values correctly', () => {
    render(
      <MobileDisplaySettings
        zoom={1.25}
        onZoomChange={mockOnZoomChange}
        showGrid={false}
        onShowGridChange={mockOnShowGridChange}
        showGuides={false}
        onShowGuidesChange={mockOnShowGuidesChange}
      />
    );

    expect(screen.getByText('125%')).toBeInTheDocument();
  });
});
