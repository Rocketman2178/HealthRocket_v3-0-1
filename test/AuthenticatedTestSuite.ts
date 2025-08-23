import { supabase } from '@/lib/supabase/client';
import { signIn, signOut } from '@/lib/supabase/auth';
import { TEST_USERS, TestUser } from '@/utils/testUsers';
import { performanceMonitor, measureDatabaseQuery, measureRPCCall } from '@/utils/performanceMonitor';
import { runDataIntegrityCheck } from '@/utils/dataIntegrityChecker';

interface TestSuiteResult {
  testUser: TestUser;
  startTime: Date;
  endTime: Date;
  duration: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  performanceReport: any;
  integrityReport: any;
  errors: string[];
  warnings: string[];
}

interface ConcurrentTestResult {
  totalUsers: number;
  successfulLogins: number;
  failedLogins: number;
  dataIsolationViolations: number;
  performanceIssues: number;
  results: TestSuiteResult[];
}

export class AuthenticatedTestSuite {
  private results: TestSuiteResult[] = [];

  async runSingleUserTests(testUser: TestUser): Promise<TestSuiteResult> {
    const startTime = new Date();
    const result: TestSuiteResult = {
      testUser,
      startTime,
      endTime: new Date(),
      duration: 0,
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      performanceReport: null,
      integrityReport: null,
      errors: [],
      warnings: [],
    };

    try {
      // Clear previous performance data
      performanceMonitor.clear();

      // Step 1: Authentication
      result.testsRun++;
      const loginResult = await measureDatabaseQuery(
        'User Login',
        () => signIn(testUser.email, testUser.password)
      );

      if (!loginResult.success) {
        result.testsFailed++;
        result.errors.push(`Login failed: ${loginResult.error}`);
        return result;
      }
      result.testsPassed++;

      const userId = loginResult.data?.user?.id;
      if (!userId) {
        result.testsFailed++;
        result.errors.push('No user ID returned from login');
        return result;
      }

      // Step 2: Basic Data Access Tests
      await this.runBasicDataAccessTests(userId, result);

      // Step 3: RPC Function Tests
      await this.runRPCFunctionTests(userId, result);

      // Step 4: Security Tests
      await this.runSecurityTests(userId, result);

      // Step 5: Performance Tests
      await this.runPerformanceTests(userId, result);

      // Step 6: Data Integrity Check
      result.integrityReport = await runDataIntegrityCheck(userId);

      // Step 7: Cleanup
      await signOut();

      // Generate performance report
      result.performanceReport = performanceMonitor.getReport();

    } catch (error) {
      result.testsFailed++;
      result.errors.push(`Test suite error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();
    }

    return result;
  }

  private async runBasicDataAccessTests(userId: string, result: TestSuiteResult): Promise<void> {
    const tests = [
      {
        name: 'User Profile Access',
        test: () => measureDatabaseQuery(
          'User Profile Query',
          () => supabase.from('users').select('*').eq('id', userId).single()
        )
      },
      {
        name: 'FP Earnings Access',
        test: () => measureDatabaseQuery(
          'FP Earnings Query',
          () => supabase.from('fp_earnings').select('*').eq('user_id', userId).limit(10)
        )
      },
      {
        name: 'Challenge Access',
        test: () => measureDatabaseQuery(
          'User Challenges Query',
          () => supabase.from('user_challenges').select('*').eq('user_id', userId)
        )
      },
      {
        name: 'Contest Access',
        test: () => measureDatabaseQuery(
          'Contest Entries Query',
          () => supabase.from('active_contests').select('*').eq('user_id', userId)
        )
      },
    ];

    for (const test of tests) {
      result.testsRun++;
      try {
        const { data, error } = await test.test();
        if (error) {
          result.testsFailed++;
          result.errors.push(`${test.name}: ${error.message}`);
        } else {
          result.testsPassed++;
        }
      } catch (error) {
        result.testsFailed++;
        result.errors.push(`${test.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async runRPCFunctionTests(userId: string, result: TestSuiteResult): Promise<void> {
    const rpcTests = [
      {
        name: 'Dashboard RPC',
        test: () => measureRPCCall(
          'get_user_dashboard',
          () => supabase.rpc('get_user_dashboard', { p_user_id: userId })
        )
      },
      {
        name: 'Earn FP RPC',
        test: () => measureRPCCall(
          'earn_fuel_points',
          () => supabase.rpc('earn_fuel_points', {
            p_user_id: userId,
            p_source: 'daily_boost',
            p_amount: 1,
            p_source_id: 'test-boost',
            p_metadata: { test: true }
          })
        )
      },
    ];

    for (const test of rpcTests) {
      result.testsRun++;
      try {
        const { data, error } = await test.test();
        if (error) {
          result.testsFailed++;
          result.errors.push(`${test.name}: ${error.message}`);
        } else {
          result.testsPassed++;
        }
      } catch (error) {
        result.testsFailed++;
        result.errors.push(`${test.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async runSecurityTests(userId: string, result: TestSuiteResult): Promise<void> {
    result.testsRun++;
    try {
      // Try to access all users (should be restricted by RLS)
      const { data: allUsers, error } = await measureDatabaseQuery(
        'RLS Security Test',
        () => supabase.from('users').select('*')
      );

      if (error) {
        // Error is expected due to RLS
        result.testsPassed++;
      } else if (allUsers && allUsers.length === 1 && allUsers[0].id === userId) {
        // Only own data returned - RLS working correctly
        result.testsPassed++;
      } else if (allUsers && allUsers.length > 1) {
        // Security violation - can see other users' data
        result.testsFailed++;
        result.errors.push(`SECURITY VIOLATION: Can access ${allUsers.length} users' data`);
      } else {
        result.warnings.push('Unexpected RLS behavior');
        result.testsPassed++;
      }
    } catch (error) {
      result.testsFailed++;
      result.errors.push(`Security test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runPerformanceTests(userId: string, result: TestSuiteResult): Promise<void> {
    const performanceTests = [
      {
        name: 'Bulk FP Query Performance',
        test: () => measureDatabaseQuery(
          'Bulk FP Query',
          () => supabase.from('fp_earnings').select('*').eq('user_id', userId).limit(100)
        )
      },
      {
        name: 'Complex Join Query Performance',
        test: () => measureDatabaseQuery(
          'Complex Join Query',
          () => supabase
            .from('user_challenges')
            .select(`
              *,
              challenge_library (
                title,
                description,
                daily_fp_reward
              )
            `)
            .eq('user_id', userId)
        )
      },
    ];

    for (const test of performanceTests) {
      result.testsRun++;
      try {
        const { data, error } = await test.test();
        if (error) {
          result.testsFailed++;
          result.errors.push(`${test.name}: ${error.message}`);
        } else {
          result.testsPassed++;
        }
      } catch (error) {
        result.testsFailed++;
        result.errors.push(`${test.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  async runConcurrentUserTests(): Promise<ConcurrentTestResult> {
    const startTime = new Date();
    const concurrentResult: ConcurrentTestResult = {
      totalUsers: TEST_USERS.length,
      successfulLogins: 0,
      failedLogins: 0,
      dataIsolationViolations: 0,
      performanceIssues: 0,
      results: [],
    };

    // Run tests for all users concurrently
    const testPromises = TEST_USERS.map(user => this.runSingleUserTests(user));
    const results = await Promise.allSettled(testPromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const testResult = result.value;
        concurrentResult.results.push(testResult);
        
        if (testResult.testsPassed > 0) {
          concurrentResult.successfulLogins++;
        } else {
          concurrentResult.failedLogins++;
        }

        // Check for security violations
        if (testResult.errors.some(e => e.includes('SECURITY VIOLATION'))) {
          concurrentResult.dataIsolationViolations++;
        }

        // Check for performance issues
        if (testResult.performanceReport?.averageResponseTime > 1000) {
          concurrentResult.performanceIssues++;
        }
      } else {
        concurrentResult.failedLogins++;
        console.error(`Test failed for user ${TEST_USERS[index].email}:`, result.reason);
      }
    });

    return concurrentResult;
  }

  generateDetailedReport(results: TestSuiteResult[]): string {
    let report = '# Health Rocket V3 - Authenticated Test Suite Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    // Summary
    const totalTests = results.reduce((sum, r) => sum + r.testsRun, 0);
    const totalPassed = results.reduce((sum, r) => sum + r.testsPassed, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.testsFailed, 0);
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    report += '## Summary\n';
    report += `- Total Users Tested: ${results.length}\n`;
    report += `- Total Tests Run: ${totalTests}\n`;
    report += `- Tests Passed: ${totalPassed}\n`;
    report += `- Tests Failed: ${totalFailed}\n`;
    report += `- Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%\n`;
    report += `- Average Test Duration: ${averageDuration.toFixed(0)}ms\n\n`;

    // Individual Results
    report += '## Individual Test Results\n\n';
    results.forEach(result => {
      report += `### ${result.testUser.name} (${result.testUser.email})\n`;
      report += `- Role: ${result.testUser.role}\n`;
      report += `- Tests Run: ${result.testsRun}\n`;
      report += `- Passed: ${result.testsPassed}\n`;
      report += `- Failed: ${result.testsFailed}\n`;
      report += `- Duration: ${result.duration}ms\n`;

      if (result.errors.length > 0) {
        report += '- Errors:\n';
        result.errors.forEach(error => {
          report += `  - ${error}\n`;
        });
      }

      if (result.warnings.length > 0) {
        report += '- Warnings:\n';
        result.warnings.forEach(warning => {
          report += `  - ${warning}\n`;
        });
      }

      if (result.performanceReport) {
        report += `- Average Response Time: ${result.performanceReport.averageResponseTime.toFixed(2)}ms\n`;
        if (result.performanceReport.slowestQuery) {
          report += `- Slowest Query: ${result.performanceReport.slowestQuery.name} (${result.performanceReport.slowestQuery.duration.toFixed(2)}ms)\n`;
        }
      }

      if (result.integrityReport) {
        const passedChecks = result.integrityReport.checks.filter((c: any) => c.status === 'pass').length;
        const totalChecks = result.integrityReport.checks.length;
        report += `- Data Integrity: ${passedChecks}/${totalChecks} checks passed\n`;
      }

      report += '\n';
    });

    return report;
  }
}

export const runFullTestSuite = async (): Promise<{
  singleUserResults: TestSuiteResult[];
  concurrentResults: ConcurrentTestResult;
  report: string;
}> => {
  const testSuite = new AuthenticatedTestSuite();
  
  console.log('🚀 Starting authenticated test suite...');
  
  // Run single user tests first
  const singleUserResults: TestSuiteResult[] = [];
  for (const user of TEST_USERS) {
    console.log(`Testing user: ${user.email}`);
    const result = await testSuite.runSingleUserTests(user);
    singleUserResults.push(result);
  }
  
  console.log('🔄 Running concurrent user tests...');
  const concurrentResults = await testSuite.runConcurrentUserTests();
  
  console.log('📊 Generating report...');
  const report = testSuite.generateDetailedReport(singleUserResults);
  
  console.log('✅ Test suite completed');
  
  return {
    singleUserResults,
    concurrentResults,
    report,
  };
};