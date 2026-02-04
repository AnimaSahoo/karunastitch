/**
 * Environment-based logger utility
 * Logs only in development mode to prevent information disclosure in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log error messages - only logs in development mode
   * In production, errors are silently handled to prevent information disclosure
   */
  error: (context: string, error: unknown): void => {
    if (isDev) {
      console.error(`[${context}]`, error);
    }
    // In production, you could optionally send to a monitoring service
    // Example: sendToMonitoringService(context, error);
  },

  /**
   * Log warning messages - only logs in development mode
   */
  warn: (context: string, message: string, data?: unknown): void => {
    if (isDev) {
      console.warn(`[${context}]`, message, data ?? '');
    }
  },

  /**
   * Log info messages - only logs in development mode
   */
  info: (context: string, message: string, data?: unknown): void => {
    if (isDev) {
      console.info(`[${context}]`, message, data ?? '');
    }
  },

  /**
   * Log debug messages - only logs in development mode
   */
  debug: (context: string, message: string, data?: unknown): void => {
    if (isDev) {
      console.debug(`[${context}]`, message, data ?? '');
    }
  },
};
