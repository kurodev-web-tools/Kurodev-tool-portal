/**
 * Schedule Adjuster - Project Types
 */

export interface Schedule {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  participants: string[];
}

export interface ProjectSettings {
  timezone: string;
  bufferTime: number;
  autoAdjust: boolean;
  notifications: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  duration: number;
  participants: number;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  schedules: Schedule[];
  settings: ProjectSettings;
}

export interface ProjectFormValues {
  name: string;
  description: string;
  duration: string;
}

