interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: any;
}

interface PerformanceReport {
  totalTests: number;
  averageResponseTime: number;
  slowestQuery: PerformanceMetric | null;
  fastestQuery: PerformanceMetric | null;
  metrics: PerformanceMetric[];
  memoryUsage?: any;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeMetrics: Map<string, PerformanceMetric> = new Map();

  startTimer(name: string, metadata?: any): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };
    
    this.activeMetrics.set(name, metric);
  }

  endTimer(name: string): number | null {
    const metric = this.activeMetrics.get(name);
    if (!metric) {
      console.warn(`No active timer found for: ${name}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    this.metrics.push(metric);
    this.activeMetrics.delete(name);
    
    return metric.duration;
  }

  async measureAsync<T>(name: string, asyncFunction: () => Promise<T>, metadata?: any): Promise<T> {
    this.startTimer(name, metadata);
    try {
      const result = await asyncFunction();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  getReport(): PerformanceReport {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined);
    const durations = completedMetrics.map(m => m.duration!);
    
    const report: PerformanceReport = {
      totalTests: completedMetrics.length,
      averageResponseTime: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      slowestQuery: completedMetrics.reduce((slowest, current) => 
        !slowest || (current.duration! > slowest.duration!) ? current : slowest, null as PerformanceMetric | null),
      fastestQuery: completedMetrics.reduce((fastest, current) => 
        !fastest || (current.duration! < fastest.duration!) ? current : fastest, null as PerformanceMetric | null),
      metrics: [...completedMetrics],
      memoryUsage: this.getMemoryUsage(),
    };

    return report;
  }

  private getMemoryUsage(): any {
    // Web API for memory usage (if available)
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  clear(): void {
    this.metrics = [];
    this.activeMetrics.clear();
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  getAverageTime(name: string): number {
    const metrics = this.getMetricsByName(name);
    const durations = metrics.filter(m => m.duration !== undefined).map(m => m.duration!);
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  logReport(): void {
    const report = this.getReport();
    console.group('🚀 Performance Report');
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Average Response Time: ${report.averageResponseTime.toFixed(2)}ms`);
    
    if (report.slowestQuery) {
      console.log(`Slowest Query: ${report.slowestQuery.name} (${report.slowestQuery.duration!.toFixed(2)}ms)`);
    }
    
    if (report.fastestQuery) {
      console.log(`Fastest Query: ${report.fastestQuery.name} (${report.fastestQuery.duration!.toFixed(2)}ms)`);
    }
    
    if (report.memoryUsage) {
      console.log('Memory Usage:', report.memoryUsage);
    }
    
    console.groupEnd();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions for common database operations
export const measureDatabaseQuery = async <T>(
  queryName: string,
  queryFunction: () => Promise<T>,
  metadata?: any
): Promise<T> => {
  return performanceMonitor.measureAsync(queryName, queryFunction, metadata);
};

export const measureRPCCall = async <T>(
  rpcName: string,
  rpcFunction: () => Promise<T>,
  parameters?: any
): Promise<T> => {
  return performanceMonitor.measureAsync(
    `RPC: ${rpcName}`,
    rpcFunction,
    { parameters }
  );
};

export const measureAuthOperation = async <T>(
  operationName: string,
  authFunction: () => Promise<T>
): Promise<T> => {
  return performanceMonitor.measureAsync(
    `Auth: ${operationName}`,
    authFunction
  );
};

// Performance thresholds (in milliseconds)
export const PERFORMANCE_THRESHOLDS = {
  FAST: 100,
  ACCEPTABLE: 500,
  SLOW: 1000,
  CRITICAL: 3000,
};

export const getPerformanceRating = (duration: number): 'excellent' | 'good' | 'acceptable' | 'slow' | 'critical' => {
  if (duration <= PERFORMANCE_THRESHOLDS.FAST) return 'excellent';
  if (duration <= PERFORMANCE_THRESHOLDS.ACCEPTABLE) return 'good';
  if (duration <= PERFORMANCE_THRESHOLDS.SLOW) return 'acceptable';
  if (duration <= PERFORMANCE_THRESHOLDS.CRITICAL) return 'slow';
  return 'critical';
};

export const getPerformanceColor = (rating: string): string => {
  switch (rating) {
    case 'excellent': return '#10B981';
    case 'good': return '#84CC16';
    case 'acceptable': return '#F59E0B';
    case 'slow': return '#EF4444';
    case 'critical': return '#DC2626';
    default: return '#6B7280';
  }
};