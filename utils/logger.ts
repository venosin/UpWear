/**
 * Sistema de logging profesional para debugging y monitorización
 * Soporta diferentes niveles de log y configuración por ambiente
 */

// ==================== TIPOS ====================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stack?: string;
  source: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  enableFileLogging: boolean;
  maxLogSize: number;
  context?: Record<string, any>;
}

// ==================== CONFIGURACIÓN ====================

const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  enableFileLogging: false,
  maxLogSize: 1000, // Máximo número de logs en memoria
  context: {},
};

// ==================== CLASE LOGGER ====================

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();

    // Capturar errores no manejados
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  // ==================== MÉTODOS PRINCIPALES ====================

  /**
   * Log a nivel DEBUG
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log a nivel INFO
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a nivel WARN
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log a nivel ERROR
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log a nivel FATAL
   */
  fatal(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // ==================== MÉTODO CORE DE LOGGING ====================

  /**
   * Método principal para registrar logs
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    // No loggear si el nivel es menor al configurado
    if (level < this.config.level) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.config.context, ...context },
      userId: this.getUserId(),
      sessionId: this.sessionId,
      requestId: this.getRequestId(),
      stack: error?.stack,
      source: this.getSource(),
    };

    // Agregar al buffer de logs
    this.addLogToBuffer(logEntry);

    // Enviar a diferentes destinos
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logToRemote(logEntry);
    }

    // Enviar logs críticos inmediatamente
    if (level >= LogLevel.ERROR) {
      this.flushLogs();
    }
  }

  // ==================== DESTINOS DE LOG ====================

  /**
   * Enviar log a la consola
   */
  private logToConsole(logEntry: LogEntry): void {
    const { timestamp, level, message, context, source } = logEntry;
    const logLevel = LogLevel[level];

    // Formato de salida para consola
    const logOutput = [
      `%c[${timestamp}] ${logLevel}: ${message}`,
      this.getConsoleStyle(level),
      '',
      'Source:', source,
      context && 'Context:',
      context || '',
    ].filter(Boolean);

    console.log(...logOutput);

    // Mostrar stack trace si existe
    if (logEntry.stack) {
      console.groupCollapsed('Stack Trace');
      console.error(logEntry.stack);
      console.groupEnd();
    }
  }

  /**
   * Enviar log a endpoint remoto
   */
  private async logToRemote(logEntry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Fallback a console si falla el envío remoto
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  // ==================== MANEJO DE BUFFER ====================

  /**
   * Agregar log al buffer en memoria
   */
  private addLogToBuffer(logEntry: LogEntry): void {
    this.logs.push(logEntry);

    // Limitar tamaño del buffer
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }
  }

  /**
   * Enviar todos los logs acumulados
   */
  async flushLogs(): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint || this.logs.length === 0) {
      return;
    }

    const logsToSend = [...this.logs];
    this.logs = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });
    } catch (error) {
      // Re-add logs si falla el envío
      this.logs.unshift(...logsToSend);
      console.error('Failed to flush logs:', error);
    }
  }

  // ==================== MANEJO DE ERRORES GLOBALES ====================

  /**
   * Manejar errores globales no capturados
   */
  private handleGlobalError(event: ErrorEvent): void {
    this.error('Uncaught error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, event.error);
  }

  /**
   * Manejar promesas rechazadas no capturadas
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.error('Unhandled promise rejection', {
      reason: event.reason,
    }, event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
  }

  // ==================== UTILIDADES ====================

  /**
   * Obtener estilos para consola según nivel
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: 'color: #6B7280; font-weight: normal;',
      [LogLevel.INFO]: 'color: #059669; font-weight: normal;',
      [LogLevel.WARN]: 'color: #D97706; font-weight: normal;',
      [LogLevel.ERROR]: 'color: #DC2626; font-weight: bold;',
      [LogLevel.FATAL]: 'color: #7C2D12; font-weight: bold; background: #FEF2F2; padding: 2px 4px; border-radius: 4px;',
    };

    return styles[level] || styles[LogLevel.INFO];
  }

  /**
   * Generar ID de sesión único
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener ID del usuario actual
   */
  private getUserId(): string | undefined {
    // Implementar según tu sistema de autenticación
    if (typeof window !== 'undefined') {
      return (window as any).currentUser?.id;
    }
    return undefined;
  }

  /**
   * Obtener ID de request actual
   */
  private getRequestId(): string | undefined {
    if (typeof window !== 'undefined') {
      return (window as any).requestId;
    }
    return undefined;
  }

  /**
   * Obtener fuente del log (componente o archivo)
   */
  private getSource(): string {
    if (typeof window !== 'undefined') {
      return 'client';
    }
    return 'server';
  }

  // ==================== CONFIGURACIÓN ====================

  /**
   * Actualizar configuración del logger
   */
  configure(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtener logs actuales
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Limpiar logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// ==================== INSTANCIA GLOBAL ====================

// Crear instancia global del logger
const logger = new Logger();

// Exportar instancia y clase
export { logger, Logger, LogLevel };
export default logger;