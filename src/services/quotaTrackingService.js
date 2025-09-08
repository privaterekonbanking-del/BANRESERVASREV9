// Quota Tracking Service - Track and Display API Quota Usage
// Since NumVerify doesn't provide remaining quota, we track it locally

const fs = require('fs').promises;
const path = require('path');

class QuotaTrackingService {
  constructor(options = {}) {
    this.config = {
      monthlyLimit: 1000, // Default free plan limit
      resetDay: 1, // Day of month when quota resets
      warningThreshold: 0.8, // Warn at 80% usage
      criticalThreshold: 0.95, // Critical at 95% usage
      ...options
    };
    
    this.quotaData = {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      totalUsed: 0,
      dailyUsage: new Map(),
      lastApiCall: null,
      quotaExhausted: false,
      estimatedRemaining: this.config.monthlyLimit
    };
    
    this.quotaFile = 'numverify_quota_tracking.json';
  }

  /**
   * Initialize quota tracking
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.loadQuotaData();
      this.checkMonthlyReset();
      console.log(`📊 Quota initialized: ${this.getRemaining()}/${this.config.monthlyLimit} remaining`);
    } catch (error) {
      console.error('Failed to initialize quota tracking:', error.message);
    }
  }

  /**
   * Record API call usage
   * @param {number} callCount - Number of API calls made
   * @param {boolean} successful - Whether calls were successful
   * @returns {Object} Updated quota status
   */
  recordApiUsage(callCount = 1, successful = true) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Update total usage
    this.quotaData.totalUsed += callCount;
    this.quotaData.lastApiCall = new Date().toISOString();
    
    // Update daily usage
    const currentDailyUsage = this.quotaData.dailyUsage.get(today) || 0;
    this.quotaData.dailyUsage.set(today, currentDailyUsage + callCount);
    
    // Update remaining estimate
    this.quotaData.estimatedRemaining = Math.max(0, this.config.monthlyLimit - this.quotaData.totalUsed);
    
    // Check if quota exhausted
    if (this.quotaData.estimatedRemaining === 0) {
      this.quotaData.quotaExhausted = true;
    }
    
    // Save quota data
    this.saveQuotaData();
    
    const status = this.getQuotaStatus();
    
    // Display quota update
    this.displayQuotaUpdate(callCount, status);
    
    return status;
  }

  /**
   * Get current quota status
   * @returns {Object} Quota status object
   */
  getQuotaStatus() {
    const remaining = this.getRemaining();
    const used = this.getUsed();
    const usagePercentage = (used / this.config.monthlyLimit * 100).toFixed(1);
    
    let status = 'normal';
    let statusColor = 'green';
    
    if (remaining === 0) {
      status = 'exhausted';
      statusColor = 'red';
    } else if (usagePercentage >= this.config.criticalThreshold * 100) {
      status = 'critical';
      statusColor = 'red';
    } else if (usagePercentage >= this.config.warningThreshold * 100) {
      status = 'warning';
      statusColor = 'yellow';
    }
    
    return {
      monthlyLimit: this.config.monthlyLimit,
      used,
      remaining,
      usagePercentage: parseFloat(usagePercentage),
      status,
      statusColor,
      quotaExhausted: this.quotaData.quotaExhausted,
      daysUntilReset: this.getDaysUntilReset(),
      estimatedDailyLimit: this.getEstimatedDailyLimit(),
      todayUsage: this.getTodayUsage()
    };
  }

  /**
   * Display quota update with colors
   * @param {number} callCount - API calls made
   * @param {Object} status - Current quota status
   */
  displayQuotaUpdate(callCount, status) {
    const colorCode = this.getColorCode(status.statusColor);
    const resetCode = '\x1b[0m';
    
    console.log(`${colorCode}📊 API QUOTA: ${status.used}/${status.monthlyLimit} used (${status.remaining} remaining) - ${status.usagePercentage}%${resetCode}`);
    
    if (callCount > 1) {
      console.log(`${colorCode}📈 Last batch: +${callCount} calls${resetCode}`);
    }
    
    // Show warnings
    if (status.status === 'warning') {
      console.log(`\x1b[33m⚠️  WARNING: ${status.usagePercentage}% quota used - approaching limit!\x1b[0m`);
    } else if (status.status === 'critical') {
      console.log(`\x1b[31m🚨 CRITICAL: ${status.usagePercentage}% quota used - very close to limit!\x1b[0m`);
    } else if (status.status === 'exhausted') {
      console.log(`\x1b[31m❌ QUOTA EXHAUSTED: No API calls remaining until reset in ${status.daysUntilReset} days\x1b[0m`);
    }
    
    // Show daily usage info
    if (status.todayUsage > 0) {
      console.log(`📅 Today's usage: ${status.todayUsage} calls (Estimated daily limit: ${status.estimatedDailyLimit})`);
    }
  }

  /**
   * Get color code for console output
   * @param {string} color - Color name
   * @returns {string} ANSI color code
   */
  getColorCode(color) {
    switch (color) {
      case 'green': return '\x1b[32m';
      case 'yellow': return '\x1b[33m';
      case 'red': return '\x1b[31m';
      default: return '';
    }
  }

  /**
   * Check if API calls are allowed
   * @param {number} requestedCalls - Number of calls requested
   * @returns {Object} Permission status
   */
  checkApiPermission(requestedCalls = 1) {
    const remaining = this.getRemaining();
    
    if (this.quotaData.quotaExhausted || remaining === 0) {
      return {
        allowed: false,
        reason: 'quota_exhausted',
        message: `API quota exhausted. Resets in ${this.getDaysUntilReset()} days.`,
        remaining: 0
      };
    }
    
    if (requestedCalls > remaining) {
      return {
        allowed: false,
        reason: 'insufficient_quota',
        message: `Requested ${requestedCalls} calls but only ${remaining} remaining.`,
        remaining,
        maxAllowed: remaining
      };
    }
    
    return {
      allowed: true,
      remaining,
      afterUsage: remaining - requestedCalls
    };
  }

  /**
   * Get estimated remaining calls
   * @returns {number} Estimated remaining calls
   */
  getRemaining() {
    return Math.max(0, this.config.monthlyLimit - this.quotaData.totalUsed);
  }

  /**
   * Get total used calls this month
   * @returns {number} Total used calls
   */
  getUsed() {
    return this.quotaData.totalUsed;
  }

  /**
   * Get today's usage
   * @returns {number} Today's API call count
   */
  getTodayUsage() {
    const today = new Date().toISOString().split('T')[0];
    return this.quotaData.dailyUsage.get(today) || 0;
  }

  /**
   * Get days until quota reset
   * @returns {number} Days until reset
   */
  getDaysUntilReset() {
    const now = new Date();
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, this.config.resetDay);
    const diffTime = nextReset - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get estimated daily limit based on remaining days
   * @returns {number} Estimated daily limit
   */
  getEstimatedDailyLimit() {
    const daysRemaining = this.getDaysUntilReset();
    const remaining = this.getRemaining();
    return daysRemaining > 0 ? Math.floor(remaining / daysRemaining) : 0;
  }

  /**
   * Check if monthly reset is needed
   */
  checkMonthlyReset() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (currentMonth !== this.quotaData.currentMonth || currentYear !== this.quotaData.currentYear) {
      console.log('🔄 Monthly quota reset detected');
      this.resetMonthlyQuota();
    }
  }

  /**
   * Reset monthly quota
   */
  resetMonthlyQuota() {
    const now = new Date();
    this.quotaData = {
      currentMonth: now.getMonth(),
      currentYear: now.getFullYear(),
      totalUsed: 0,
      dailyUsage: new Map(),
      lastApiCall: null,
      quotaExhausted: false,
      estimatedRemaining: this.config.monthlyLimit
    };
    
    console.log(`✅ Quota reset: ${this.config.monthlyLimit} calls available for new month`);
    this.saveQuotaData();
  }

  /**
   * Update monthly limit (when user upgrades plan)
   * @param {number} newLimit - New monthly limit
   */
  updateMonthlyLimit(newLimit) {
    const oldLimit = this.config.monthlyLimit;
    this.config.monthlyLimit = newLimit;
    this.quotaData.estimatedRemaining = Math.max(0, newLimit - this.quotaData.totalUsed);
    
    if (this.quotaData.estimatedRemaining > 0) {
      this.quotaData.quotaExhausted = false;
    }
    
    console.log(`📈 Quota limit updated: ${oldLimit} -> ${newLimit} (${this.getRemaining()} remaining)`);
    this.saveQuotaData();
  }

  /**
   * Get detailed usage statistics
   * @returns {Object} Usage statistics
   */
  getUsageStatistics() {
    const dailyUsageArray = Array.from(this.quotaData.dailyUsage.entries())
      .map(([date, usage]) => ({ date, usage }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30); // Last 30 days

    const totalDaysWithUsage = dailyUsageArray.length;
    const avgDailyUsage = totalDaysWithUsage > 0 
      ? (this.quotaData.totalUsed / totalDaysWithUsage).toFixed(1)
      : 0;

    return {
      monthlyUsage: {
        used: this.getUsed(),
        remaining: this.getRemaining(),
        limit: this.config.monthlyLimit,
        percentage: (this.getUsed() / this.config.monthlyLimit * 100).toFixed(1)
      },
      dailyStats: {
        today: this.getTodayUsage(),
        average: parseFloat(avgDailyUsage),
        estimatedDailyLimit: this.getEstimatedDailyLimit(),
        daysWithUsage: totalDaysWithUsage
      },
      recentUsage: dailyUsageArray.slice(0, 7), // Last 7 days
      projectedExhaustion: this.getProjectedExhaustionDate()
    };
  }

  /**
   * Get projected quota exhaustion date
   * @returns {string|null} Projected exhaustion date or null
   */
  getProjectedExhaustionDate() {
    const remaining = this.getRemaining();
    if (remaining === 0) return 'Already exhausted';
    
    const recentUsage = Array.from(this.quotaData.dailyUsage.values()).slice(-7);
    if (recentUsage.length === 0) return null;
    
    const avgDailyUsage = recentUsage.reduce((sum, usage) => sum + usage, 0) / recentUsage.length;
    if (avgDailyUsage === 0) return null;
    
    const daysUntilExhaustion = Math.floor(remaining / avgDailyUsage);
    const exhaustionDate = new Date();
    exhaustionDate.setDate(exhaustionDate.getDate() + daysUntilExhaustion);
    
    return exhaustionDate.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Save quota data to file
   * @returns {Promise<void>}
   */
  async saveQuotaData() {
    try {
      const dataToSave = {
        ...this.quotaData,
        dailyUsage: Array.from(this.quotaData.dailyUsage.entries()), // Convert Map to Array
        config: this.config,
        lastSaved: new Date().toISOString()
      };

      const filePath = path.join(process.cwd(), this.quotaFile);
      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Failed to save quota data:', error.message);
    }
  }

  /**
   * Load quota data from file
   * @returns {Promise<void>}
   */
  async loadQuotaData() {
    try {
      const filePath = path.join(process.cwd(), this.quotaFile);
      const data = await fs.readFile(filePath, 'utf8');
      const quotaData = JSON.parse(data);
      
      this.quotaData = {
        ...quotaData,
        dailyUsage: new Map(quotaData.dailyUsage || []) // Convert Array back to Map
      };
      
      if (quotaData.config) {
        this.config = { ...this.config, ...quotaData.config };
      }
      
      console.log(`📂 Loaded quota data: ${this.getUsed()}/${this.config.monthlyLimit} used`);
    } catch (error) {
      console.log('📂 No previous quota data found, starting fresh');
    }
  }

  /**
   * Display comprehensive quota report
   */
  displayQuotaReport() {
    const status = this.getQuotaStatus();
    const stats = this.getUsageStatistics();
    
    console.log('\n📊 NUMVERIFY QUOTA REPORT');
    console.log('=========================');
    
    // Current status with color
    const colorCode = this.getColorCode(status.statusColor);
    console.log(`${colorCode}📈 Current Usage: ${status.used}/${status.monthlyLimit} (${status.usagePercentage}%)${'\x1b[0m'}`);
    console.log(`${colorCode}📉 Remaining: ${status.remaining} calls${'\x1b[0m'}`);
    
    // Status indicators
    if (status.status === 'exhausted') {
      console.log('\x1b[31m❌ STATUS: QUOTA EXHAUSTED\x1b[0m');
    } else if (status.status === 'critical') {
      console.log('\x1b[31m🚨 STATUS: CRITICAL (95%+ used)\x1b[0m');
    } else if (status.status === 'warning') {
      console.log('\x1b[33m⚠️  STATUS: WARNING (80%+ used)\x1b[0m');
    } else {
      console.log('\x1b[32m✅ STATUS: NORMAL\x1b[0m');
    }
    
    // Daily stats
    console.log(`📅 Today's Usage: ${stats.dailyStats.today} calls`);
    console.log(`📊 Daily Average: ${stats.dailyStats.average} calls`);
    console.log(`🎯 Estimated Daily Limit: ${stats.dailyStats.estimatedDailyLimit} calls`);
    
    // Reset info
    console.log(`🔄 Quota Resets: ${status.daysUntilReset} days (Day ${this.config.resetDay} of month)`);
    
    // Projection
    if (stats.projectedExhaustion && stats.projectedExhaustion !== 'Already exhausted') {
      console.log(`📅 Projected Exhaustion: ${stats.projectedExhaustion}`);
    }
    
    console.log('=========================\n');
  }

  /**
   * Get quota progress bar for web interface
   * @returns {Object} Progress bar data
   */
  getQuotaProgressBar() {
    const status = this.getQuotaStatus();
    
    return {
      percentage: status.usagePercentage,
      used: status.used,
      remaining: status.remaining,
      total: status.monthlyLimit,
      color: status.statusColor,
      status: status.status,
      progressBarHTML: `
        <div class="quota-progress-container">
          <div class="quota-progress-bar">
            <div class="quota-progress-fill ${status.statusColor}" style="width: ${status.usagePercentage}%"></div>
          </div>
          <div class="quota-text">${status.used}/${status.monthlyLimit} (${status.remaining} remaining)</div>
        </div>
      `,
      css: `
        .quota-progress-container { margin: 10px 0; }
        .quota-progress-bar { 
          width: 100%; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden;
        }
        .quota-progress-fill { 
          height: 100%; transition: width 0.3s ease;
        }
        .quota-progress-fill.green { background: #4caf50; }
        .quota-progress-fill.yellow { background: #ff9800; }
        .quota-progress-fill.red { background: #f44336; }
        .quota-text { 
          text-align: center; margin-top: 5px; font-weight: bold;
        }
      `
    };
  }

  /**
   * Export quota data for analysis
   * @returns {Object} Exportable quota data
   */
  exportQuotaData() {
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        planType: this.config.monthlyLimit === 1000 ? 'Free' : 'Paid',
        monthlyLimit: this.config.monthlyLimit
      },
      currentStatus: this.getQuotaStatus(),
      usageStatistics: this.getUsageStatistics(),
      rawData: {
        ...this.quotaData,
        dailyUsage: Array.from(this.quotaData.dailyUsage.entries())
      }
    };
  }

  /**
   * Set plan type and limits
   * @param {string} planType - Plan type (free, basic, professional, enterprise)
   */
  setPlanType(planType) {
    const planLimits = {
      'free': 1000,
      'basic': 10000,
      'professional': 100000,
      'enterprise': 1000000
    };

    if (planLimits[planType]) {
      this.updateMonthlyLimit(planLimits[planType]);
      console.log(`📋 Plan updated to ${planType}: ${planLimits[planType]} calls/month`);
    } else {
      console.error(`❌ Unknown plan type: ${planType}`);
    }
  }
}

module.exports = { QuotaTrackingService };