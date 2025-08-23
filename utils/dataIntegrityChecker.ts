import { supabase } from '@/lib/supabase/client';

interface IntegrityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface IntegrityReport {
  userId: string;
  userName: string;
  checks: IntegrityCheck[];
  overallStatus: 'pass' | 'fail' | 'warning';
  timestamp: Date;
}

export class DataIntegrityChecker {
  private userId: string;
  private checks: IntegrityCheck[] = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  async runAllChecks(): Promise<IntegrityReport> {
    this.checks = [];

    // Get user profile first
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (userError || !userProfile) {
      return {
        userId: this.userId,
        userName: 'Unknown',
        checks: [{
          name: 'User Profile Access',
          status: 'fail',
          message: 'Cannot access user profile',
          details: userError
        }],
        overallStatus: 'fail',
        timestamp: new Date()
      };
    }

    // Run all integrity checks
    await this.checkFuelPointsConsistency(userProfile);
    await this.checkLevelProgression(userProfile);
    await this.checkChallengeProgress();
    await this.checkContestEntries();
    await this.checkHealthAssessmentData();
    await this.checkStreakCalculation(userProfile);
    await this.checkDuplicateEarnings();
    await this.checkDataTimestamps();

    // Determine overall status
    const overallStatus = this.checks.some(c => c.status === 'fail') ? 'fail' :
                         this.checks.some(c => c.status === 'warning') ? 'warning' : 'pass';

    return {
      userId: this.userId,
      userName: userProfile.user_name,
      checks: this.checks,
      overallStatus,
      timestamp: new Date()
    };
  }

  private async checkFuelPointsConsistency(userProfile: any): Promise<void> {
    try {
      // Get all FP earnings for user
      const { data: fpEarnings, error: fpError } = await supabase
        .from('fp_earnings')
        .select('amount')
        .eq('user_id', this.userId);

      if (fpError) {
        this.checks.push({
          name: 'FP Earnings Access',
          status: 'fail',
          message: 'Cannot access FP earnings data',
          details: fpError
        });
        return;
      }

      const calculatedTotal = fpEarnings?.reduce((sum, earning) => sum + earning.amount, 0) || 0;
      const profileTotal = userProfile.fuel_points || 0;
      const lifetimeTotal = userProfile.lifetime_fp_earned || 0;

      // Check current FP vs calculated total (allow small discrepancy for pending transactions)
      const fpDiscrepancy = Math.abs(calculatedTotal - profileTotal);
      if (fpDiscrepancy > 100) {
        this.checks.push({
          name: 'Current FP Consistency',
          status: 'fail',
          message: `FP mismatch: Profile shows ${profileTotal}, calculated ${calculatedTotal}`,
          details: { profileTotal, calculatedTotal, discrepancy: fpDiscrepancy }
        });
      } else if (fpDiscrepancy > 10) {
        this.checks.push({
          name: 'Current FP Consistency',
          status: 'warning',
          message: `Minor FP discrepancy: ${fpDiscrepancy} points`,
          details: { profileTotal, calculatedTotal, discrepancy: fpDiscrepancy }
        });
      } else {
        this.checks.push({
          name: 'Current FP Consistency',
          status: 'pass',
          message: `FP totals consistent (${profileTotal} FP)`,
          details: { profileTotal, calculatedTotal }
        });
      }

      // Check lifetime FP
      if (lifetimeTotal < calculatedTotal) {
        this.checks.push({
          name: 'Lifetime FP Consistency',
          status: 'fail',
          message: `Lifetime FP (${lifetimeTotal}) less than calculated total (${calculatedTotal})`,
          details: { lifetimeTotal, calculatedTotal }
        });
      } else {
        this.checks.push({
          name: 'Lifetime FP Consistency',
          status: 'pass',
          message: `Lifetime FP tracking correct (${lifetimeTotal} FP)`,
          details: { lifetimeTotal }
        });
      }

    } catch (error) {
      this.checks.push({
        name: 'FP Consistency Check',
        status: 'fail',
        message: 'Error checking FP consistency',
        details: error
      });
    }
  }

  private async checkLevelProgression(userProfile: any): Promise<void> {
    try {
      const currentLevel = userProfile.level || 1;
      const totalFP = userProfile.lifetime_fp_earned || 0;

      // Simple level calculation (adjust based on your actual formula)
      const expectedLevel = Math.floor(totalFP / 500) + 1;

      if (Math.abs(currentLevel - expectedLevel) > 1) {
        this.checks.push({
          name: 'Level Progression',
          status: 'fail',
          message: `Level mismatch: Current ${currentLevel}, expected ~${expectedLevel}`,
          details: { currentLevel, expectedLevel, totalFP }
        });
      } else {
        this.checks.push({
          name: 'Level Progression',
          status: 'pass',
          message: `Level progression correct (Level ${currentLevel})`,
          details: { currentLevel, totalFP }
        });
      }
    } catch (error) {
      this.checks.push({
        name: 'Level Progression',
        status: 'fail',
        message: 'Error checking level progression',
        details: error
      });
    }
  }

  private async checkChallengeProgress(): Promise<void> {
    try {
      const { data: userChallenges, error: challengeError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', this.userId);

      if (challengeError) {
        this.checks.push({
          name: 'Challenge Progress Access',
          status: 'fail',
          message: 'Cannot access challenge data',
          details: challengeError
        });
        return;
      }

      const activeChallenges = userChallenges?.filter(c => c.status === 'active') || [];
      const completedChallenges = userChallenges?.filter(c => c.status === 'completed') || [];

      // Check for invalid progress
      const invalidProgress = userChallenges?.filter(c => 
        c.verification_count > c.required_verifications ||
        c.verification_count < 0
      ) || [];

      if (invalidProgress.length > 0) {
        this.checks.push({
          name: 'Challenge Progress Validation',
          status: 'fail',
          message: `${invalidProgress.length} challenges have invalid progress`,
          details: invalidProgress
        });
      } else {
        this.checks.push({
          name: 'Challenge Progress Validation',
          status: 'pass',
          message: `Challenge progress valid (${activeChallenges.length} active, ${completedChallenges.length} completed)`,
          details: { active: activeChallenges.length, completed: completedChallenges.length }
        });
      }

    } catch (error) {
      this.checks.push({
        name: 'Challenge Progress Check',
        status: 'fail',
        message: 'Error checking challenge progress',
        details: error
      });
    }
  }

  private async checkContestEntries(): Promise<void> {
    try {
      const { data: contestEntries, error: contestError } = await supabase
        .from('active_contests')
        .select('*')
        .eq('user_id', this.userId);

      if (contestError) {
        this.checks.push({
          name: 'Contest Entries Access',
          status: 'warning',
          message: 'Cannot access contest data (may be restricted)',
          details: contestError
        });
        return;
      }

      // Check for invalid verification counts
      const invalidEntries = contestEntries?.filter(e => 
        e.verification_count < 0 || 
        (e.is_winner && e.verification_count === 0)
      ) || [];

      if (invalidEntries.length > 0) {
        this.checks.push({
          name: 'Contest Entry Validation',
          status: 'fail',
          message: `${invalidEntries.length} contest entries have invalid data`,
          details: invalidEntries
        });
      } else {
        this.checks.push({
          name: 'Contest Entry Validation',
          status: 'pass',
          message: `Contest entries valid (${contestEntries?.length || 0} entries)`,
          details: { totalEntries: contestEntries?.length || 0 }
        });
      }

    } catch (error) {
      this.checks.push({
        name: 'Contest Entry Check',
        status: 'fail',
        message: 'Error checking contest entries',
        details: error
      });
    }
  }

  private async checkHealthAssessmentData(): Promise<void> {
    try {
      const { data: assessments, error: assessmentError } = await supabase
        .from('health_assessments')
        .select('*')
        .eq('user_id', this.userId)
        .order('completed_at', { ascending: false });

      if (assessmentError) {
        this.checks.push({
          name: 'Health Assessment Access',
          status: 'warning',
          message: 'Cannot access health assessment data',
          details: assessmentError
        });
        return;
      }

      if (!assessments || assessments.length === 0) {
        this.checks.push({
          name: 'Health Assessment Data',
          status: 'warning',
          message: 'No health assessments found',
          details: null
        });
        return;
      }

      // Check score ranges (should be 1-10)
      const invalidScores = assessments.filter(a => 
        a.mindset_score < 1 || a.mindset_score > 10 ||
        a.sleep_score < 1 || a.sleep_score > 10 ||
        a.exercise_score < 1 || a.exercise_score > 10 ||
        a.nutrition_score < 1 || a.nutrition_score > 10 ||
        a.biohacking_score < 1 || a.biohacking_score > 10 ||
        a.overall_health_score < 1 || a.overall_health_score > 10
      );

      if (invalidScores.length > 0) {
        this.checks.push({
          name: 'Health Assessment Scores',
          status: 'fail',
          message: `${invalidScores.length} assessments have invalid scores`,
          details: invalidScores
        });
      } else {
        this.checks.push({
          name: 'Health Assessment Scores',
          status: 'pass',
          message: `Health assessment scores valid (${assessments.length} assessments)`,
          details: { totalAssessments: assessments.length }
        });
      }

    } catch (error) {
      this.checks.push({
        name: 'Health Assessment Check',
        status: 'fail',
        message: 'Error checking health assessments',
        details: error
      });
    }
  }

  private async checkStreakCalculation(userProfile: any): Promise<void> {
    try {
      const currentStreak = userProfile.burn_streak_days || 0;
      const longestStreak = userProfile.longest_burn_streak || 0;

      // Current streak should not exceed longest streak
      if (currentStreak > longestStreak) {
        this.checks.push({
          name: 'Streak Calculation',
          status: 'fail',
          message: `Current streak (${currentStreak}) exceeds longest streak (${longestStreak})`,
          details: { currentStreak, longestStreak }
        });
      } else {
        this.checks.push({
          name: 'Streak Calculation',
          status: 'pass',
          message: `Streak data consistent (${currentStreak} current, ${longestStreak} longest)`,
          details: { currentStreak, longestStreak }
        });
      }

    } catch (error) {
      this.checks.push({
        name: 'Streak Calculation',
        status: 'fail',
        message: 'Error checking streak calculation',
        details: error
      });
    }
  }

  private async checkDuplicateEarnings(): Promise<void> {
    try {
      const { data: fpEarnings, error: fpError } = await supabase
        .from('fp_earnings')
        .select('user_id, source, source_id, date, amount')
        .eq('user_id', this.userId);

      if (fpError) {
        this.checks.push({
          name: 'Duplicate Earnings Check',
          status: 'fail',
          message: 'Cannot access FP earnings for duplicate check',
          details: fpError
        });
        return;
      }

      // Check for potential duplicates (same source, source_id, and date)
      const earningsMap = new Map();
      const duplicates: any[] = [];

      fpEarnings?.forEach(earning => {
        const key = `${earning.source}-${earning.source_id}-${earning.date}`;
        if (earningsMap.has(key)) {
          duplicates.push({ original: earningsMap.get(key), duplicate: earning });
        } else {
          earningsMap.set(key, earning);
        }
      });

      if (duplicates.length > 0) {
        this.checks.push({
          name: 'Duplicate Earnings Check',
          status: 'warning',
          message: `Found ${duplicates.length} potential duplicate earnings`,
          details: duplicates
        });
      } else {
        this.checks.push({
          name: 'Duplicate Earnings Check',
          status: 'pass',
          message: `No duplicate earnings found (${fpEarnings?.length || 0} records)`,
          details: { totalRecords: fpEarnings?.length || 0 }
        });
      }

    } catch (error) {
      this.checks.push({
        name: 'Duplicate Earnings Check',
        status: 'fail',
        message: 'Error checking for duplicate earnings',
        details: error
      });
    }
  }

  private async checkDataTimestamps(): Promise<void> {
    try {
      const { data: recentEarnings, error: earningsError } = await supabase
        .from('fp_earnings')
        .select('created_at, date')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (earningsError) {
        this.checks.push({
          name: 'Data Timestamps',
          status: 'warning',
          message: 'Cannot check timestamp consistency',
          details: earningsError
        });
        return;
      }

      // Check for future dates or inconsistent timestamps
      const now = new Date();
      const futureEarnings = recentEarnings?.filter(e => 
        new Date(e.created_at) > now || new Date(e.date) > now
      ) || [];

      if (futureEarnings.length > 0) {
        this.checks.push({
          name: 'Data Timestamps',
          status: 'fail',
          message: `Found ${futureEarnings.length} records with future timestamps`,
          details: futureEarnings
        });
      } else {
        this.checks.push({
          name: 'Data Timestamps',
          status: 'pass',
          message: 'Timestamp consistency verified',
          details: { recordsChecked: recentEarnings?.length || 0 }
        });
      }

    } catch (error) {
      this.checks.push({
        name: 'Data Timestamps',
        status: 'fail',
        message: 'Error checking data timestamps',
        details: error
      });
    }
  }
}

export const runDataIntegrityCheck = async (userId: string): Promise<IntegrityReport> => {
  const checker = new DataIntegrityChecker(userId);
  return await checker.runAllChecks();
};