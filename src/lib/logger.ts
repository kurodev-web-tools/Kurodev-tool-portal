/**
 * 統一されたログシステム
 * 開発環境と本番環境で異なるログレベルを提供
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
  userId?: string;
}

class Logger {
  private currentLevel: LogLevel;
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // メモリ内に保持する最大ログ数

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.currentLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    component?: string
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      component,
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // 実際の実装では、認証コンテキストからユーザーIDを取得
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || undefined;
    }
    return undefined;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private addToMemory(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // 古いログを削除
    }
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, component, userId } = entry;
    const levelName = LogLevel[level];
    const componentStr = component ? `[${component}]` : '';
    const userStr = userId ? `[User:${userId}]` : '';
    return `${timestamp} ${levelName} ${componentStr}${userStr}: ${message}`;
  }

  private logToConsole(entry: LogEntry): void {
    const formattedMessage = this.formatMessage(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data);
        break;
    }
  }

  private logToExternal(entry: LogEntry): void {
    // 本番環境では外部ログサービス（Sentry、LogRocket等）に送信
    if (!this.isDevelopment && entry.level >= LogLevel.ERROR) {
      // 例: Sentry.captureException(entry.data);
      // 例: LogRocket.captureException(entry.data);
    }
  }

  private log(level: LogLevel, message: string, data?: any, component?: string): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, data, component);
    
    this.addToMemory(entry);
    this.logToConsole(entry);
    this.logToExternal(entry);
  }

  debug(message: string, data?: any, component?: string): void {
    this.log(LogLevel.DEBUG, message, data, component);
  }

  info(message: string, data?: any, component?: string): void {
    this.log(LogLevel.INFO, message, data, component);
  }

  warn(message: string, data?: any, component?: string): void {
    this.log(LogLevel.WARN, message, data, component);
  }

  error(message: string, data?: any, component?: string): void {
    this.log(LogLevel.ERROR, message, data, component);
  }

  // 開発者向けユーティリティ
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  // パフォーマンス測定
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // メモリ使用量の測定
  measureMemory(label: string): void {
    if (this.isDevelopment && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.debug(`Memory usage - ${label}`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
      });
    }
  }
}

// シングルトンインスタンス
export const logger = new Logger();

// 便利な関数
export const logDebug = (message: string, data?: any, component?: string) => 
  logger.debug(message, data, component);

export const logInfo = (message: string, data?: any, component?: string) => 
  logger.info(message, data, component);

export const logWarn = (message: string, data?: any, component?: string) => 
  logger.warn(message, data, component);

export const logError = (message: string, data?: any, component?: string) => 
  logger.error(message, data, component);

// React Hook
export const useLogger = (component: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(message, data, component),
    info: (message: string, data?: any) => logger.info(message, data, component),
    warn: (message: string, data?: any) => logger.warn(message, data, component),
    error: (message: string, data?: any) => logger.error(message, data, component),
  };
};
