import * as Sentry from '@sentry/react-native';

export class Logger {
  // Capture errors with context
  static error(error: any, context?: Record<string, any>) {
    if (context) {
      Sentry.setContext('error_context', context);
    }
    Sentry.captureException(error);
  }

  // Capture messages for important events
  static info(message: string, data?: Record<string, any>) {
    Sentry.captureMessage(message, 'info');
    if (data) {
      this.breadcrumb(message, 'info', data);
    }
  }

  static warning(message: string, data?: Record<string, any>) {
    Sentry.captureMessage(message, 'warning');
    if (data) {
      this.breadcrumb(message, 'warning', data);
    }
  }

  // Add breadcrumbs for user actions
  static breadcrumb(message: string, category: string = 'action', data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }

  // Specific breadcrumbs for common actions
  static userAction(action: string, data?: Record<string, any>) {
    this.breadcrumb(`User ${action}`, 'user.action', data);
  }

  static dataAction(action: string, data?: Record<string, any>) {
    this.breadcrumb(`Data ${action}`, 'data', data);
  }

  static navigationAction(screen: string, data?: Record<string, any>) {
    this.breadcrumb(`Navigated to ${screen}`, 'navigation', data);
  }

  // Database-specific logging methods
  static databaseError(error: any, operation: string, context?: Record<string, any>) {
    const errorContext = {
      operation,
      database: 'supabase',
      ...context
    };

    this.error(error, errorContext);
    this.breadcrumb(`Database operation failed: ${operation}`, 'database.error', errorContext);
  }

  static databaseSuccess(operation: string, context?: Record<string, any>) {
    this.breadcrumb(`Database operation succeeded: ${operation}`, 'database.success', context);
  }

  // Performance tracking
  static performanceWarning(operation: string, duration: number, threshold: number = 3000) {
    if (duration > threshold) {
      this.warning(`Slow operation: ${operation} took ${duration}ms`, {
        operation,
        duration,
        threshold
      });
    }
  }

  // Set user context (useful for debugging)
  static setUser(user: { id?: string; email?: string;[key: string]: any }) {
    Sentry.setUser(user);
  }

  // Add tags for filtering in Sentry
  static setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  // Set environment context
  static setEnvironment(env: string) {
    Sentry.setTag('environment', env);
  }

  // Critical error - for data loss scenarios
  static critical(error: any, context?: Record<string, any>) {
    if (context) {
      Sentry.setContext('critical_error_context', context);
    }
    Sentry.captureException(error);
    // Also add critical breadcrumb
    this.breadcrumb('Critical error occurred', 'critical', context);
  }
}

// Convenience exports
export const logError = Logger.error;
export const logInfo = Logger.info;
export const logWarning = Logger.warning;
export const logBreadcrumb = Logger.breadcrumb;
export const logUserAction = Logger.userAction;
export const logDataAction = Logger.dataAction;
export const logNavigation = Logger.navigationAction;
export const logDatabaseError = Logger.databaseError;
export const logDatabaseSuccess = Logger.databaseSuccess;
export const logCritical = Logger.critical; 