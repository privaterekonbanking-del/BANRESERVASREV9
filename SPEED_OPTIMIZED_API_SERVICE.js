// SPEED OPTIMIZED API SERVICE - Fixes Performance Issues
// Replace your enhancedApiService.js with this FAST version

const { SmartPhoneGenerator } = require('../generators/smartPhoneGenerator');

class SpeedOptimizedApiService {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://apilayer.net/api/validate';
    this.fallbackUrl = 'http://apilayer.net/api/validate';
    this.config = { 
      maxRetries: 2, // REDUCED from 3
      retryDelay: 500, // REDUCED from 1000ms
      requestTimeout: 8000, // REDUCED from 15000ms
      rateLimit: 200, // INCREASED from 100 (2x faster)
      cacheTTL: 24 * 60 * 60 * 1000,
      monthlyLimit: 50000, // SET TO YOUR ACTUAL LIMIT
      batchSize: 50, // Process in batches of 50
      ...options 
    };
    
    this.cache = new Map();
    this.stats = { totalRequests: 0, cacheHits: 0, cacheMisses: 0, validNumbers: 0, invalidNumbers: 0, errors: 0 };
    this.generator = new SmartPhoneGenerator();
    this.quotaExhausted = false;
    this.lastRequestTime = 0;
    
    // SIMPLE QUOTA TRACKING (no file I/O during generation)
    this.quotaData = {
      monthlyLimit: this.config.monthlyLimit,
      used: 0,
      remaining: this.config.monthlyLimit,
      startTime: Date.now()
    };
  }

  /**
   * FAST generation and validation
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Results
   */
  async generateAndValidate(options = {}) {
    const { count = 10, country = null, carrier = null, preValidateOnly = false, progressCallback = null } = options;
    
    console.log(`🚀 FAST MODE: Starting generation of ${count} numbers...`);
    
    // Quick quota check
    if (count > this.quotaData.remaining) {
      console.warn(`🚨 Insufficient quota: ${count} requested, ${this.quotaData.remaining} available`);
      console.log(`💡 Generating ${this.quotaData.remaining} numbers instead`);
      options.count = this.quotaData.remaining;
    }

    // FAST generation - no complex logic
    const startTime = Date.now();
    const candidates = await this.generator.generateRealisticNumbers({
      count: (options.count || count) * 1.5, // Less overhead
      country, 
      carrier, 
      preValidateOnly: true
    });

    console.log(`⚡ Generated ${candidates.length} candidates in ${Date.now() - startTime}ms`);

    if (preValidateOnly) {
      return { 
        results: candidates, 
        summary: { 
          generated: candidates.length, 
          preValidated: candidates.length, 
          apiValidated: 0, 
          valid: 0, 
          invalid: 0,
          quotaRemaining: this.quotaData.remaining
        } 
      };
    }

    return await this.validateBatchFast(candidates.slice(0, options.count || count), progressCallback);
  }

  /**
   * FAST batch validation with minimal overhead
   * @param {Array} candidates - Candidates to validate
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<Object>} Validation results
   */
  async validateBatchFast(candidates, progressCallback = null) {
    const results = [];
    let processed = 0, valid = 0, invalid = 0;
    const startTime = Date.now();

    console.log(`⚡ FAST VALIDATION: Processing ${candidates.length} numbers...`);
    
    // Process in batches for better performance
    const batchSize = this.config.batchSize;
    const totalBatches = Math.ceil(candidates.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, candidates.length);
      const batch = candidates.slice(batchStart, batchEnd);
      
      console.log(`⚡ Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} numbers)...`);
      
      // Process batch
      for (const candidate of batch) {
        try {
          // Quick quota check
          if (this.quotaData.remaining <= 0) {
            console.warn('🚨 Quota exhausted during batch processing');
            break;
          }

          // Check cache first (FAST)
          const cached = this.getCachedResult(candidate.e164);
          if (cached) {
            this.stats.cacheHits++;
            results.push({ ...candidate, ...cached, apiValidated: true, cached: true });
            if (cached.valid) valid++; else invalid++;
            processed++;
            continue; // Skip API call
          }

          // MINIMAL rate limiting
          await this.fastRateLimit();
          
          // FAST API validation
          const validationResult = await this.validateSingleFast(candidate.e164);
          
          if (validationResult.quotaExhausted) {
            console.warn('🚨 API quota exhausted');
            break;
          }

          // Cache result
          this.cacheResult(candidate.e164, validationResult);
          results.push({ ...candidate, ...validationResult, apiValidated: true, cached: false });
          
          if (validationResult.valid) valid++; else invalid++;
          processed++;

          // Update quota tracking (SIMPLE)
          this.quotaData.used++;
          this.quotaData.remaining--;

          // FAST progress callback (every 10 numbers)
          if (progressCallback && processed % 10 === 0) {
            const quotaStatus = {
              used: this.quotaData.used,
              remaining: this.quotaData.remaining,
              monthlyLimit: this.quotaData.monthlyLimit,
              usagePercentage: (this.quotaData.used / this.quotaData.monthlyLimit * 100).toFixed(1)
            };
            
            progressCallback({
              processed, 
              total: candidates.length, 
              valid, 
              invalid, 
              cached: false,
              quotaStatus,
              successRate: ((valid / processed) * 100).toFixed(1),
              speed: (processed / ((Date.now() - startTime) / 1000)).toFixed(1) // Numbers per second
            });
          }

        } catch (error) {
          console.error(`⚡ Fast validation error: ${error.message}`);
          this.stats.errors++;
          results.push({ ...candidate, valid: false, error: error.message, apiValidated: false });
          invalid++;
          processed++;
        }
      }
      
      // Quota exhausted - break out of batch loop
      if (this.quotaData.remaining <= 0) break;
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const speed = (processed / totalTime).toFixed(1);
    
    console.log(`⚡ FAST VALIDATION COMPLETE: ${processed} numbers in ${totalTime.toFixed(1)}s (${speed}/sec)`);
    
    return { 
      results, 
      summary: { 
        processed, 
        valid, 
        invalid, 
        total: candidates.length, 
        cacheHits: this.stats.cacheHits,
        quotaUsed: this.quotaData.used,
        quotaRemaining: this.quotaData.remaining,
        successRate: processed > 0 ? ((valid / processed) * 100).toFixed(1) : 0,
        speed: `${speed} numbers/second`,
        totalTime: `${totalTime.toFixed(1)} seconds`
      } 
    };
  }

  /**
   * FAST single validation with minimal overhead
   * @param {string} phoneNumber - Phone number to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateSingleFast(phoneNumber) {
    if (!phoneNumber || !this.apiKey) {
      throw new Error('Phone number and API key are required');
    }
    
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Try only primary endpoint for speed
    try {
      const response = await this.makeRequestFast(this.baseUrl, cleanNumber);
      
      if (response.success === false) {
        return this.handleApiErrorFast(response.error);
      }
      
      this.stats.totalRequests++;
      this.stats.cacheMisses++;
      
      const result = {
        valid: response.valid || false,
        carrier: response.carrier || 'Unknown',
        lineType: response.line_type || 'Unknown',
        location: response.location || 'Unknown',
        provider: 'numverify'
      };

      if (result.valid) this.stats.validNumbers++;
      else this.stats.invalidNumbers++;

      return result;
      
    } catch (error) {
      // Single retry only
      try {
        const response = await this.makeRequestFast(this.fallbackUrl, cleanNumber);
        if (response.success === false) {
          return this.handleApiErrorFast(response.error);
        }
        
        return {
          valid: response.valid || false,
          carrier: response.carrier || 'Unknown',
          lineType: response.line_type || 'Unknown',
          provider: 'numverify'
        };
        
      } catch (retryError) {
        throw new Error(`API validation failed: ${retryError.message}`);
      }
    }
  }

  /**
   * FAST HTTP request with minimal timeout
   * @param {string} url - API endpoint
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Object>} API response
   */
  async makeRequestFast(url, phoneNumber) {
    const params = new URLSearchParams({ 
      access_key: this.apiKey.trim(), 
      number: phoneNumber 
    });
    const fullUrl = `${url}?${params.toString()}`;
    
    // FAST request with shorter timeout
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: this.config.requestTimeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * FAST API error handling
   * @param {Object} error - API error
   * @returns {Object} Error response
   */
  handleApiErrorFast(error) {
    const errorCode = error?.code;
    
    switch (errorCode) {
      case 104: // Quota exhausted
        this.quotaExhausted = true;
        this.quotaData.remaining = 0;
        return { 
          valid: false, 
          error: 'Monthly request limit reached', 
          quotaExhausted: true, 
          provider: 'numverify' 
        };
      case 101:
        throw new Error('Invalid API key');
      case 102:
        throw new Error('Account inactive');
      default:
        return { 
          valid: false, 
          error: error?.info || 'API error', 
          provider: 'numverify' 
        };
    }
  }

  /**
   * FAST rate limiting - minimal delay
   * @returns {Promise<void>}
   */
  async fastRateLimit() {
    const now = Date.now();
    const minInterval = 60000 / this.config.rateLimit; // Faster rate
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 300))); // Max 300ms delay
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Simple cache operations
   */
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

  /**
   * Get stats with quota info
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      quotaUsed: this.quotaData.used,
      quotaRemaining: this.quotaData.remaining,
      quotaLimit: this.quotaData.monthlyLimit,
      usagePercentage: (this.quotaData.used / this.quotaData.monthlyLimit * 100).toFixed(1),
      generatorStats: this.generator.getStats(),
      quotaExhausted: this.quotaExhausted
    };
  }

  /**
   * Set quota limit
   * @param {number} limit - Monthly quota limit
   */
  setQuotaLimit(limit) {
    this.config.monthlyLimit = limit;
    this.quotaData.monthlyLimit = limit;
    this.quotaData.remaining = Math.max(0, limit - this.quotaData.used);
    console.log(`📊 Quota limit set to: ${limit} calls/month (${this.quotaData.remaining} remaining)`);
  }

  /**
   * Reset quota (for new month)
   */
  resetQuota() {
    this.quotaData.used = 0;
    this.quotaData.remaining = this.config.monthlyLimit;
    this.quotaExhausted = false;
    console.log(`🔄 Quota reset: ${this.config.monthlyLimit} calls available`);
  }

  /**
   * Simple reset
   */
  reset() {
    this.cache.clear();
    this.generator.clearCaches();
    this.quotaExhausted = false;
    this.stats = { totalRequests: 0, cacheHits: 0, cacheMisses: 0, validNumbers: 0, invalidNumbers: 0, errors: 0 };
  }
}

module.exports = { SpeedOptimizedApiService };