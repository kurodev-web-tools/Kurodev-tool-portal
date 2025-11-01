import { ThumbnailProject, ProjectList } from '../types/project';
import { Layer } from '@/types/layers';
import { toPng } from 'html-to-image';

const STORAGE_KEY = 'thumbnail-generator-projects';
const MAX_AUTO_SAVE_PROJECTS = 10; // 自動保存プロジェクトの最大数

/**
 * プロジェクトリストを取得
 */
export const getProjectList = (): ProjectList => {
  if (typeof window === 'undefined') {
    return { projects: [], lastSavedProjectId: null };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('プロジェクトリストの読み込みに失敗しました:', error);
  }
  
  return { projects: [], lastSavedProjectId: null };
};

/**
 * プロジェクトリストを保存
 */
export const saveProjectList = (projectList: ProjectList): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projectList));
  } catch (error) {
    console.error('プロジェクトリストの保存に失敗しました:', error);
    throw error;
  }
};

/**
 * プロジェクトを保存
 */
export const saveProject = async (
  name: string,
  layers: Layer[],
  selectedLayerId: string | null,
  templateId: string | null,
  aspectRatio: string,
  isAutoSave: boolean = false
): Promise<ThumbnailProject> => {
  // サムネイル画像を生成
  let thumbnail: string | null = null;
  try {
    const element = document.getElementById('thumbnail-preview') as HTMLElement;
    if (element) {
      thumbnail = await toPng(element, {
        width: 320,
        height: 180,
        pixelRatio: 1,
        cacheBust: false,
      });
    }
  } catch (error) {
    console.error('サムネイル生成に失敗しました:', error);
  }

  const project: ThumbnailProject = {
    id: isAutoSave ? `autosave-${Date.now()}` : `project-${Date.now()}`,
    name,
    layers: JSON.parse(JSON.stringify(layers)), // ディープコピー
    selectedLayerId,
    templateId,
    aspectRatio,
    thumbnail,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isAutoSave,
  };

  const projectList = getProjectList();
  
  if (isAutoSave) {
    // 自動保存の場合、古い自動保存プロジェクトを削除
    projectList.projects = projectList.projects.filter(p => !p.isAutoSave);
    // 新しい自動保存プロジェクトを追加
    projectList.projects.push(project);
    // 最大数を超えた古い自動保存プロジェクトを削除
    const autoSaveProjects = projectList.projects.filter(p => p.isAutoSave);
    if (autoSaveProjects.length > MAX_AUTO_SAVE_PROJECTS) {
      autoSaveProjects.sort((a, b) => a.updatedAt - b.updatedAt);
      const toRemove = autoSaveProjects.slice(0, autoSaveProjects.length - MAX_AUTO_SAVE_PROJECTS);
      projectList.projects = projectList.projects.filter(p => !toRemove.includes(p));
    }
  } else {
    // 手動保存の場合、既存のプロジェクトを更新または新規追加
    const existingIndex = projectList.projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      projectList.projects[existingIndex] = project;
    } else {
      projectList.projects.push(project);
    }
    projectList.lastSavedProjectId = project.id;
  }
  
  // 更新日時でソート（新しい順）
  projectList.projects.sort((a, b) => b.updatedAt - a.updatedAt);
  
  saveProjectList(projectList);
  return project;
};

/**
 * プロジェクトを読み込み
 */
export const loadProject = (projectId: string): ThumbnailProject | null => {
  const projectList = getProjectList();
  const project = projectList.projects.find(p => p.id === projectId);
  return project ? JSON.parse(JSON.stringify(project)) : null; // ディープコピー
};

/**
 * プロジェクトを削除
 */
export const deleteProject = (projectId: string): void => {
  const projectList = getProjectList();
  projectList.projects = projectList.projects.filter(p => p.id !== projectId);
  if (projectList.lastSavedProjectId === projectId) {
    projectList.lastSavedProjectId = null;
  }
  saveProjectList(projectList);
};

/**
 * プロジェクトを複製
 */
export const duplicateProject = (projectId: string): ThumbnailProject | null => {
  const project = loadProject(projectId);
  if (!project) return null;

  const duplicated: ThumbnailProject = {
    ...project,
    id: `project-${Date.now()}`,
    name: `${project.name} (コピー)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isAutoSave: false,
  };

  const projectList = getProjectList();
  projectList.projects.push(duplicated);
  projectList.projects.sort((a, b) => b.updatedAt - a.updatedAt);
  saveProjectList(projectList);

  return duplicated;
};

/**
 * プロジェクト名を更新
 */
export const updateProjectName = (projectId: string, newName: string): void => {
  const projectList = getProjectList();
  const project = projectList.projects.find(p => p.id === projectId);
  if (project) {
    project.name = newName;
    project.updatedAt = Date.now();
    projectList.projects.sort((a, b) => b.updatedAt - a.updatedAt);
    saveProjectList(projectList);
  }
};

