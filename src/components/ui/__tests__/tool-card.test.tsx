import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolCard } from '../tool-card';

// Next.jsのLinkコンポーネントをモック
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('ToolCard', () => {
  const defaultProps = {
    id: 'tool-1',
    title: 'テストツール',
    description: 'これはテスト用のツールです',
    status: 'beta' as const,
    href: '/tools/test-tool',
    iconName: 'calendar',
    color: 'from-blue-500 to-cyan-500',
    stats: '利用可能'
  };

  describe('基本的なレンダリング', () => {
    it('ツールのタイトルが表示される', () => {
      render(<ToolCard {...defaultProps} />);
      
      // デスクトップとモバイルの両方に表示されるので、getAllByTextを使用
      const titles = screen.getAllByText('テストツール');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('ツールの説明が表示される', () => {
      render(<ToolCard {...defaultProps} />);
      
      // デスクトップとモバイルの両方に表示されるので、getAllByTextを使用
      const descriptions = screen.getAllByText('これはテスト用のツールです');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('ステータスバッジが表示される', () => {
      render(<ToolCard {...defaultProps} />);
      
      // デスクトップとモバイルの両方に表示されるので、getAllByTextを使用
      const badges = screen.getAllByText('ベータ版');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('統計情報が表示される', () => {
      render(<ToolCard {...defaultProps} />);
      
      expect(screen.getByText('利用可能')).toBeInTheDocument();
    });
  });

  describe('ステータス別の表示', () => {
    it('released状態で正しいバッジが表示される', () => {
      render(<ToolCard {...defaultProps} status="released" />);
      
      const badges = screen.getAllByText('公開中');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('beta状態でフィードバックメッセージが表示される', () => {
      render(
        <ToolCard 
          {...defaultProps} 
          status="beta" 
          feedbackMessage="フィードバックお待ちしております"
        />
      );
      
      // デスクトップとモバイルの両方に表示される
      const feedbackMessages = screen.getAllByText('フィードバック募集中');
      expect(feedbackMessages.length).toBeGreaterThan(0);
    });

    it('development状態で開発中バッジが表示される', () => {
      render(<ToolCard {...defaultProps} status="development" />);
      
      const badges = screen.getAllByText('開発中');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('インタラクション', () => {
    it('カードをクリックするとonClickが呼ばれる', () => {
      const handleClick = jest.fn();
      render(<ToolCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('EnterキーでもonClickが呼ばれる', () => {
      const handleClick = jest.fn();
      render(<ToolCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('SpaceキーでもonClickが呼ばれる', () => {
      const handleClick = jest.fn();
      render(<ToolCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('その他のキーではonClickが呼ばれない', () => {
      const handleClick = jest.fn();
      render(<ToolCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'a' });
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なaria-labelが設定される', () => {
      render(<ToolCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'テストツール - これはテスト用のツールです');
    });

    it('説明のIDが正しく設定される', () => {
      render(<ToolCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-describedby', 'tool-1-description');
    });

    it('tabIndexが設定される', () => {
      render(<ToolCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('リンク', () => {
    it('hrefが提供された場合、リンクボタンが表示される', () => {
      render(<ToolCard {...defaultProps} />);
      
      // デスクトップ用のボタン
      const link = screen.getByText('ツールを使用する').closest('a');
      expect(link).toHaveAttribute('href', '/tools/test-tool');
    });

    it('hrefがない場合、リンクボタンは表示されない', () => {
      const { container } = render(<ToolCard {...defaultProps} href={undefined} />);
      
      expect(screen.queryByText('ツールを使用する')).not.toBeInTheDocument();
    });
  });

  describe('スナップショット', () => {
    it('デフォルトの見た目が変わっていない', () => {
      const { container } = render(<ToolCard {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});


