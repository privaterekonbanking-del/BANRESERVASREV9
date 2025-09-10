// Enhanced API Service with Quota Tracking - UPDATED VERSION
// Copy this and replace your src/services/enhancedApiService.js

const { SmartPhoneGenerator } = require('../generators/smartPhoneGenerator');
const { QuotaTrackingService } = require('./quotaTrackingService');

class EnhancedApiService {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://apilayer.net/api/validate';
    this.fallbackUrl = 'http://apilayer.net/api/validate';
    this.config = { 
      maxRetries: 3, 
      retryDelay: 1000, 
      requestTimeout: 15000, 
      rateLimit: 100, 
      cacheTTL: 24 * 60 * 60 * 1000,
      monthlyLimit: 1000, // Default free plan
      ...options 
    };
    
    this.cache = new Map();
    this.stats = { totalRequests: 0, cacheHits: 0, cacheMisses: 0, validNumbers: 0, invalidNumbers: 0, errors: 0 };
    this.generator = new SmartPhoneGenerator();
    this.quotaExhausted = false;
    this.lastRequestTime = 0;
    
    // Initialize quota tracking
    this.quotaTracker = new QuotaTrackingService({
      monthlyLimit: this.config.monthlyLimit,
      resetDay: 1 // Adjust based on your plan reset date
    });
    
    // Initialize quota tracker
    this.initializeQuotaTracker();
  }

  /**
   * Initialize quota tracking system
   * @returns {Promise<void>}
   */
  async initializeQuotaTracker() {
    try {
      await this.quotaTracker.initialize();
    } catch (error) {
      console.error('Quota tracker initialization failed:', error.message);
    }
  }

  /**
   * Generate and validate with quota tracking
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Results with quota information
   */
  async generateAndValidate(options = {}) {
    const { count = 10, country = null, carrier = null, preValidateOnly = false, progressCallback = null } = options;
    
    // Check quota before starting
    const quotaCheck = this.quotaTracker.checkApiPermission(count);
    if (!quotaCheck.allowed) {
      console.warn(`🚨 ${quotaCheck.message}`);
      
      if (quotaCheck.maxAllowed > 0) {
        console.log(`💡 Suggestion: Generate ${quotaCheck.maxAllowed} numbers instead`);
        // Optionally reduce count to available quota
        options.count = quotaCheck.maxAllowed;
      } else {
        return {
          results: [],
          summary: { 
            processed: 0, valid: 0, invalid: 0, 
            quotaExhausted: true,
            quotaStatus: this.quotaTracker.getQuotaStatus()
          }
        };
      }
    }

    console.log(`Starting generation and validation of ${options.count || count} numbers...`);
    
    // Show initial quota status
    this.quotaTracker.displayQuotaReport();

    const candidates = await this.generator.generateRealisticNumbers({
      count: (options.count || count) * 2, country, carrier, preValidateOnly: true
    });

    if (preValidateOnly) {
      return { 
        results: candidates, 
        summary: { 
          generated: candidates.length, 
          preValidated: candidates.length, 
          apiValidated: 0, 
          valid: 0, 
          invalid: 0,
          quotaStatus: this.quotaTracker.getQuotaStatus()
        } 
      };
    }

    return await this.validateBatchWithQuotaTracking(candidates.slice(0, options.count || count), progressCallback);
  }

  /**
   * Validate batch with quota tracking and live updates
   * @param {Array} candidates - Candidates to validate
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<Object>} Validation results with quota info
   */
  async validateBatchWithQuotaTracking(candidates, progressCallback = null) {
    const results = [];
    let processed = 0, valid = 0, invalid = 0;

    // Initial quota check
    let quotaStatus = this.quotaTracker.getQuotaStatus();
    if (quotaStatus.quotaExhausted) {
      console.warn('🚨 API quota already exhausted, skipping validation');
      return { 
        results: candidates.map(c => ({ ...c, apiValidated: false, quotaExhausted: true })), 
        summary: { processed: 0, valid: 0, invalid: 0, quotaExhausted: true, quotaStatus } 
      };
    }

    for (const candidate of candidates) {
      try {
        // Check quota before each call
        const permission = this.quotaTracker.checkApiPermission(1);
        if (!permission.allowed) {
          console.warn(`🚨 Quota limit reached during batch processing (${permission.reason})`);
          break;
        }

        // Check cache first
        const cached = this.getCachedResult(candidate.e164);
        if (cached) {
          this.stats.cacheHits++;
          results.push({ ...candidate, ...cached, apiValidated: true, cached: true });
          if (cached.valid) valid++; else invalid++;
          processed++;
          
          // Update progress with quota info
          if (progressCallback) {
            quotaStatus = this.quotaTracker.getQuotaStatus();
            progressCallback({
              processed, total: candidates.length, valid, invalid, cached: true,
              quotaStatus,
              remaining: quotaStatus.remaining,
              usagePercentage: quotaStatus.usagePercentage
            });
          }
          continue;
        }

        await this.enforceRateLimit();
        const validationResult = await this.validateSingleWithQuota(candidate.e164);
        
        if (validationResult.quotaExhausted) {
          console.warn('🚨 API quota exhausted during validation');
          break;
        }

        this.cacheResult(candidate.e164, validationResult);
        results.push({ ...candidate, ...validationResult, apiValidated: true, cached: false });
        
        if (validationResult.valid) valid++; else invalid++;
        processed++;

        // Update progress with quota info
        if (progressCallback) {
          quotaStatus = this.quotaTracker.getQuotaStatus();
          progressCallback({
            processed, total: candidates.length, valid, invalid, cached: false,
            quotaStatus,
            remaining: quotaStatus.remaining,
            usagePercentage: quotaStatus.usagePercentage,
            successRate: processed > 0 ? ((valid / processed) * 100).toFixed(1) : 0
          });
        }

      } catch (error) {
        console.error(`Validation failed for ${candidate.e164}:`, error.message);
        this.stats.errors++;
        results.push({ ...candidate, valid: false, error: error.message, apiValidated: false });
        invalid++;
        processed++;
      }
    }

    // Final quota status
    quotaStatus = this.quotaTracker.getQuotaStatus();
    
    return { 
      results, 
      summary: { 
        processed, valid, invalid, total: candidates.length, 
        cacheHits: this.stats.cacheHits, 
        cacheMisses: this.stats.cacheMisses, 
        quotaExhausted: quotaStatus.quotaExhausted,
        quotaStatus,
        successRate: processed > 0 ? ((valid / processed) * 100).toFixed(1) : 0
      } 
    };
  }

  /**
   * Validate single number with quota tracking
   * @param {string} phoneNumber - Phone number to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateSingleWithQuota(phoneNumber) {
    // Record API usage
    const quotaStatus = this.quotaTracker.recordApiUsage(1, false); // Will update to true if successful
    
    try {
      const result = await this.validateSingle(phoneNumber);
      
      // Update quota tracker with success
      this.quotaTracker.recordApiUsage(0, true); // 0 because we already recorded the call
      
      return result;
      
    } catch (error) {
      // Check if quota-related error
      if (error.message.includes('limit') || error.message.includes('quota')) {
        this.quotaTracker.quotaData.quotaExhausted = true;
        return { 
          valid: false, 
          error: 'API quota exhausted', 
          quotaExhausted: true, 
          provider: 'numverify' 
        };
      }
      
      throw error;
    }
  }

  /**
   * Original validateSingle method (unchanged)
   * @param {string} phoneNumber - Phone number to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateSingle(phoneNumber) {
    if (!phoneNumber || !this.apiKey) throw new Error('Phone number and API key are required');
    
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const endpoints = [this.baseUrl, this.fallbackUrl];
    let lastError;

    for (const url of endpoints) {
      for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
        try {
          const response = await this.makeRequest(url, cleanNumber);
          if (response.success === false) return this.handleApiError(response.error, cleanNumber);
          
          this.stats.totalRequests++;
          this.stats.cacheMisses++;
          
          const result = {
            valid: response.valid || false,
            carrier: response.carrier || 'Unknown',
            lineType: response.line_type || 'Unknown',
            location: response.location || 'Unknown',
            countryCode: response.country_code || null,
            countryName: response.country_name || null,
            provider: 'numverify',
            timestamp: new Date().toISOString()
          };

          // Update stats
          if (result.valid) this.stats.validNumbers++;
          else this.stats.invalidNumbers++;

          return result;
          
        } catch (error) {
          lastError = error;
          if (attempt < this.config.maxRetries) await this.delay(this.config.retryDelay * attempt);
        }
      }
    }
    throw new Error(`All validation attempts failed: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Get comprehensive stats including quota
   * @returns {Object} Enhanced statistics
   */
  getStats() {
    const baseStats = {
      ...this.stats, 
      cacheSize: this.cache.size, 
      generatorStats: this.generator.getStats(), 
      quotaExhausted: this.quotaExhausted
    };

    // Add quota information
    baseStats.quotaStatus = this.quotaTracker.getQuotaStatus();
    baseStats.quotaStatistics = this.quotaTracker.getUsageStatistics();
    baseStats.quotaProgressBar = this.quotaTracker.getQuotaProgressBar();

    return baseStats;
  }

  /**
   * Display comprehensive status including quota
   */
  displayStatus() {
    console.log('\n📊 API SERVICE STATUS');
    console.log('====================');
    
    // API Stats
    console.log(`📡 API Calls: ${this.stats.totalRequests} total`);
    console.log(`✅ Valid: ${this.stats.validNumbers} | ❌ Invalid: ${this.stats.invalidNumbers}`);
    console.log(`💾 Cache: ${this.stats.cacheHits} hits, ${this.cache.size} entries`);
    
    // Quota Status
    this.quotaTracker.displayQuotaReport();
  }

  /**
   * Set NumVerify plan type
   * @param {string} planType - Plan type (free, basic, professional, enterprise)
   */
  setPlanType(planType) {
    this.quotaTracker.setPlanType(planType);
  }

  // Keep all existing methods unchanged...
  async makeRequest(url, phoneNumber) {
    const params = new URLSearchParams({ access_key: this.apiKey.trim(), number: phoneNumber });
    const fullUrl = `${url}?${params.toString()}`;
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': 'PhoneValidator/2.0' },
        timeout: this.config.requestTimeout
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (corsError) {
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const proxiedUrl = corsProxy + encodeURIComponent(fullUrl);
      const response = await fetch(proxiedUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`Proxied request failed: HTTP ${response.status}`);
      return await response.json();
    }
  }

  handleApiError(error, phoneNumber) {
    const errorCode = error?.code;
    switch (errorCode) {
      case 101: throw new Error('Invalid API key. Please check your NumVerify API key.');
      case 102: throw new Error('Account inactive. Please check your NumVerify account status.');
      case 104:
        this.quotaExhausted = true;
        this.quotaTracker.quotaData.quotaExhausted = true;
        return { valid: false, error: 'Monthly request limit reached', quotaExhausted: true, provider: 'numverify' };
      default: return { valid: false, error: error?.info || error?.message || 'Unknown API error', provider: 'numverify', phoneNumber };
    }
  }

  cacheResult(phoneNumber, result) {
    this.cache.set(phoneNumber, { ...result, cachedAt: Date.now() });
  }

  getCachedResult(phoneNumber) {
    const cached = this.cache.get(phoneNumber);
    if (!cached) return null;
    if (Date.now() - cached.cachedAt > this.config.cacheTTL) {
      this.cache.delete(phoneNumber);
      return null;
    }
    return cached;
  }

  async enforceRateLimit() {
    const now = Date.now();
    const minInterval = 60000 / this.config.rateLimit;
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < minInterval) {
      await this.delay(minInterval - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  reset() {
    this.cache.clear();
    this.generator.clearCaches();
    this.quotaExhausted = false;
    this.stats = { totalRequests: 0, cacheHits: 0, cacheMisses: 0, validNumbers: 0, invalidNumbers: 0, errors: 0 };
  }
}

module.exports = { EnhancedApiService };