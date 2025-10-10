import { renderHook, waitFor } from '@testing-library/react';
import { useTemplateManagement } from '../useTemplateManagement';
import { loadTemplates } from '@/lib/templateLoader';

// templateLoaderをモック
jest.mock('@/lib/templateLoader');
jest.mock('@/lib/genreMapping', () => ({
  createGenreDisplayMapping: jest.fn((genres: string[]) => 
    genres.reduce((acc, genre) => ({ ...acc, [genre]: genre }), {})
  )
}));

const mockTemplates = [
  {
    id: '1',
    name: 'テンプレート1',
    genre: 'gaming',
    initialText: 'ゲーム配信',
    initialTextColor: '#FFFFFF',
    initialFontSize: '48px',
    initialImageSrc: '/templates/gaming-1.jpg',
    supportedAspectRatios: ['16:9', '9:16']
  },
  {
    id: '2',
    name: 'テンプレート2',
    genre: 'talk',
    initialText: '雑談',
    initialTextColor: '#000000',
    initialFontSize: '36px',
    initialImageSrc: '/templates/talk-1.jpg',
    supportedAspectRatios: ['16:9', '1:1']
  },
  {
    id: '3',
    name: 'テンプレート3',
    genre: 'gaming',
    initialText: 'ゲーム実況',
    initialTextColor: '#FF0000',
    initialFontSize: '52px',
    initialImageSrc: '/templates/gaming-2.jpg',
    supportedAspectRatios: ['16:9']
  }
];

describe('useTemplateManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadTemplates as jest.Mock).mockResolvedValue(mockTemplates);
  });

  describe('初期読み込み', () => {
    it('テンプレートを読み込む', async () => {
      const { result } = renderHook(() => 
        useTemplateManagement({ aspectRatio: '16:9' })
      );
      
      expect(result.current.isLoading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.templates).toHaveLength(3);
      expect(loadTemplates).toHaveBeenCalledTimes(1);
    });

    it('読み込みエラー時は空配列になる', async () => {
      (loadTemplates as jest.Mock).mockRejectedValue(new Error('読み込み失敗'));
      
      const { result } = renderHook(() => 
        useTemplateManagement({ aspectRatio: '16:9' })
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.templates).toEqual([]);
    });
  });

  describe('アスペクト比フィルタリング', () => {
    it('指定したアスペクト比に対応するテンプレートのみ返す', async () => {
      const { result } = renderHook(() => 
        useTemplateManagement({ aspectRatio: '1:1' })
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.filteredTemplates).toHaveLength(1);
      expect(result.current.filteredTemplates[0].id).toBe('2');
    });

    it('customアスペクト比では全てのテンプレートを表示', async () => {
      const { result } = renderHook(() => 
        useTemplateManagement({ aspectRatio: 'custom' })
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.filteredTemplates).toHaveLength(3);
    });

    it('対応するテンプレートがない場合は空配列', async () => {
      const { result } = renderHook(() => 
        useTemplateManagement({ aspectRatio: '4:3' })
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.filteredTemplates).toHaveLength(0);
    });
  });

  describe('ジャンル管理', () => {
    it('利用可能なジャンルを取得できる', async () => {
      const { result } = renderHook(() => 
        useTemplateManagement({ aspectRatio: '16:9' })
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.availableGenres).toEqual(['gaming', 'talk']);
    });

    it('ジャンル別にテンプレートをグループ化できる', async () => {
      const { result } = renderHook(() => 
        useTemplateManagement({ aspectRatio: '16:9' })
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.templatesByGenre['gaming']).toHaveLength(2);
      expect(result.current.templatesByGenre['talk']).toHaveLength(1);
    });

    it('アスペクト比変更時にジャンルも更新される', async () => {
      const { result, rerender } = renderHook(
        ({ aspectRatio }) => useTemplateManagement({ aspectRatio }),
        { initialProps: { aspectRatio: '16:9' } }
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.availableGenres).toEqual(['gaming', 'talk']);
      
      // アスペクト比を変更
      rerender({ aspectRatio: '9:16' });
      
      expect(result.current.availableGenres).toEqual(['gaming']);
    });
  });

  describe('genreNames', () => {
    it('ジャンルの表示名マッピングが生成される', async () => {
      const { result } = renderHook(() => 
        useTemplateManagement({ aspectRatio: '16:9' })
      );
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.genreNames).toBeDefined();
      expect(typeof result.current.genreNames).toBe('object');
    });
  });
});


