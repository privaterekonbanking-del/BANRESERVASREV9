// COMPLETE FIXED API SERVICE - All Methods Included
// Replace your src/services/enhancedApiService.js with this COMPLETE version

const { SmartPhoneGenerator } = require('../generators/smartPhoneGenerator');

class EnhancedApiService {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://apilayer.net/api/validate';
    this.fallbackUrl = 'http://apilayer.net/api/validate';
    
    // ULTRA FAST CONFIGURATION
    this.config = { 
      maxRetries: 1,           // FAST: 1 retry only
      retryDelay: 300,         // FAST: 300ms delay
      requestTimeout: 3000,    // FAST: 3 second timeout
      rateLimit: 1000,         // FAST: 16 calls per second
      batchSize: 100,          // FAST: Large batches
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      monthlyLimit: 50000,     // Your actual limit
      ...options 
    };
    
    this.cache = new Map();
    this.stats = { totalRequests: 0, cacheHits: 0, cacheMisses: 0, validNumbers: 0, invalidNumbers: 0, errors: 0 };
    this.generator = new SmartPhoneGenerator();
    this.quotaExhausted = false;
    this.lastRequestTime = 0;
    
    // SIMPLE quota tracking for speed
    this.quota = {
      limit: this.config.monthlyLimit,
      used: 0,
      remaining: this.config.monthlyLimit
    };

    console.log(`⚡ ULTRA FAST API SERVICE: ${(this.config.rateLimit/60).toFixed(1)} calls/second`);
  }

  /**
   * Generate and validate - MAIN METHOD
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Results
   */
  async generateAndValidate(options = {}) {
    const { count = 10, country = null, carrier = null, preValidateOnly = false, progressCallback = null } = options;
    
    console.log(`⚡ ULTRA FAST MODE: ${count} numbers...`);
    
    // Display quota
    this.displayQuota();
    
    // Quick quota check
    if (count > this.quota.remaining) {
      console.warn(`🚨 Adjusting count: ${count} → ${this.quota.remaining} (quota limit)`);
      options.count = this.quota.remaining;
    }

    const startTime = Date.now();
    
    // Generate candidates
    const candidates = await this.generator.generateRealisticNumbers({
      count: (options.count || count) * 1.2,
      country, carrier, preValidateOnly: true
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
          quotaUsed: this.quota.used,
          quotaRemaining: this.quota.remaining
        } 
      };
    }

    // FIXED: Call the correct method name
    return await this.validateBatch(candidates.slice(0, options.count || count), progressCallback);
  }

  /**
   * VALIDATEBATCH METHOD - This was missing!
   * @param {Array} candidates - Candidates to validate
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<Object>} Validation results
   */
  async validateBatch(candidates, progressCallback = null) {
    const results = [];
    let processed = 0, valid = 0, invalid = 0;
    const startTime = Date.now();

    console.log(`⚡ ULTRA FAST VALIDATION: ${candidates.length} numbers...`);
    
    // Process in batches for speed
    const batchSize = this.config.batchSize;
    
    for (let i = 0; i < candidates.length; i += batchSize) {
      if (this.quota.remaining <= 0) {
        console.warn('🚨 Quota exhausted - stopping');
        break;
      }

      const batch = candidates.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(candidates.length / batchSize);
      
      console.log(`⚡ Batch ${batchNum}/${totalBatches}: ${batch.length} numbers...`);
      
      // Process batch
      for (const candidate of batch) {
        try {
          // Check quota
          if (this.quota.remaining <= 0) break;

          // Check cache first
          const cached = this.getCachedResult(candidate.e164);
          if (cached) {
            this.stats.cacheHits++;
            results.push({ ...candidate, ...cached, apiValidated: true, cached: true });
            if (cached.valid) valid++; else invalid++;
            processed++;
            continue;
          }

          // Rate limiting
          await this.enforceRateLimit();
          
          // API validation
          const validationResult = await this.validateSingle(candidate.e164);
          
          if (validationResult.quotaExhausted) {
            console.warn('🚨 API quota exhausted');
            break;
          }

          // Cache and add result
          this.cacheResult(candidate.e164, validationResult);
          results.push({ ...candidate, ...validationResult, apiValidated: true, cached: false });
          
          if (validationResult.valid) valid++; else invalid++;
          processed++;

          // Update quota
          this.quota.used++;
          this.quota.remaining--;

          // Progress callback
          if (progressCallback && processed % 50 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = (processed / elapsed).toFixed(1);
            
            progressCallback({
              processed, total: candidates.length, valid, invalid,
              quotaUsed: this.quota.used,
              quotaRemaining: this.quota.remaining,
              successRate: ((valid / processed) * 100).toFixed(1),
              speed: `${speed}/sec`
            });
          }

        } catch (error) {
          console.error(`Validation error: ${error.message}`);
          this.stats.errors++;
          results.push({ ...candidate, valid: false, error: error.message, apiValidated: false });
          invalid++;
          processed++;
        }
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const speed = (processed / totalTime).toFixed(1);
    
    console.log(`⚡ VALIDATION COMPLETE: ${processed} numbers in ${totalTime.toFixed(1)}s (${speed}/sec)`);
    
    return { 
      results, 
      summary: { 
        processed, valid, invalid, total: candidates.length,
        cacheHits: this.stats.cacheHits,
        cacheMisses: this.stats.cacheMisses,
        quotaExhausted: this.quota.remaining <= 0,
        quotaUsed: this.quota.used,
        quotaRemaining: this.quota.remaining,
        successRate: processed > 0 ? ((valid / processed) * 100).toFixed(1) : 0,
        speed: `${speed} numbers/second`,
        totalTime: `${totalTime.toFixed(1)} seconds`
      } 
    };
  }

  /**
   * VALIDATESINGLE METHOD - Core validation
   * @param {string} phoneNumber - Phone number to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateSingle(phoneNumber) {
    if (!phoneNumber || !this.apiKey) {
      throw new Error('Phone number and API key are required');
    }
    
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    try {
      const response = await this.makeRequest(this.baseUrl, cleanNumber);
      
      if (response.success === false) {
        return this.handleApiError(response.error, cleanNumber);
      }
      
      this.stats.totalRequests++;
      this.stats.cacheMisses++;
      
      const result = {
        valid: response.valid || false,
        carrier: response.carrier || 'Unknown',
        lineType: response.line_type || 'Unknown',
        location: response.location || 'Unknown',
        countryCode: response.country_code || null,
        countryName: response.country_name || null,
        nationalFormat: response.national_format || null,
        internationalFormat: response.international_format || null,
        provider: 'numverify',
        timestamp: new Date().toISOString()
      };

      if (result.valid) this.stats.validNumbers++;
      else this.stats.invalidNumbers++;

      return result;
      
    } catch (error) {
      // Single retry with fallback URL
      try {
        const response = await this.makeRequest(this.fallbackUrl, cleanNumber);
        if (response.success === false) {
          return this.handleApiError(response.error, cleanNumber);
        }
        
        return {
          valid: response.valid || false,
          carrier: response.carrier || 'Unknown',
          lineType: response.line_type || 'Unknown',
          provider: 'numverify'
        };
        
      } catch (retryError) {
        throw new Error(`All validation attempts failed: ${retryError.message}`);
      }
    }
  }

  /**
   * MAKEREQUEST METHOD - HTTP request handler
   * @param {string} url - API URL
   * @param {string} phoneNumber - Clean phone number
   * @returns {Promise<Object>} API response
   */
  async makeRequest(url, phoneNumber) {
    const params = new URLSearchParams({
      access_key: this.apiKey.trim(),
      number: phoneNumber
    });

    const fullUrl = `${url}?${params.toString()}`;
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'UltraFastPhoneValidator/3.0'
        },
        timeout: this.config.requestTimeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
      
    } catch (corsError) {
      // Fallback to CORS proxy
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const proxiedUrl = corsProxy + encodeURIComponent(fullUrl);
      
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Proxied request failed: HTTP ${response.status}`);
      }

      return await response.json();
    }
  }

  /**
   * Handle API errors
   * @param {Object} error - Error object
   * @param {string} phoneNumber - Phone number
   * @returns {Object} Error response
   */
  handleApiError(error, phoneNumber) {
    const errorCode = error?.code;
    const errorMessage = error?.info || error?.message || 'Unknown API error';

    switch (errorCode) {
      case 101:
        throw new Error('Invalid API key. Please check your NumVerify API key.');
      case 102:
        throw new Error('Account inactive. Please check your NumVerify account status.');
      case 104:
        this.quotaExhausted = true;
        this.quota.remaining = 0;
        return {
          valid: false,
          error: 'Monthly request limit reached',
          quotaExhausted: true,
          provider: 'numverify'
        };
      case 105:
        throw new Error('HTTPS access not supported on current plan');
      default:
        return {
          valid: false,
          error: errorMessage,
          provider: 'numverify',
          phoneNumber
        };
    }
  }

  /**
   * Cache validation result
   * @param {string} phoneNumber - Phone number
   * @param {Object} result - Validation result
   */
  cacheResult(phoneNumber, result) {
    this.cache.set(phoneNumber, {
      ...result,
      cachedAt: Date.now()
    });
  }

  /**
   * Get cached result
   * @param {string} phoneNumber - Phone number
   * @returns {Object|null} Cached result or null
   */
  getCachedResult(phoneNumber) {
    const cached = this.cache.get(phoneNumber);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.cachedAt > this.config.cacheTTL) {
      this.cache.delete(phoneNumber);
      return null;
    }
    
    return cached;
  }

  /**
   * Enforce rate limiting
   * @returns {Promise<void>}
   */
  async enforceRateLimit() {
    const now = Date.now();
    const minInterval = 60000 / this.config.rateLimit; // ~60ms for 1000/min
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Display quota information
   */
  displayQuota() {
    console.log(`📊 API QUOTA: ${this.quota.used}/${this.quota.limit} used | ${this.quota.remaining} REMAINING (${((this.quota.used/this.quota.limit)*100).toFixed(1)}%)`);
  }

  /**
   * Set quota limit
   * @param {number} limit - Monthly quota limit
   */
  setQuotaLimit(limit) {
    this.quota.limit = limit;
    this.quota.remaining = Math.max(0, limit - this.quota.used);
    console.log(`📊 Quota updated: ${this.quota.used}/${limit} used, ${this.quota.remaining} remaining`);
  }

  /**
   * Get comprehensive statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      quotaUsed: this.quota.used,
      quotaRemaining: this.quota.remaining,
      quotaLimit: this.quota.limit,
      usagePercentage: ((this.quota.used / this.quota.limit) * 100).toFixed(1),
      quotaExhausted: this.quotaExhausted,
      generatorStats: this.generator.getStats()
    };
  }

  /**
   * Export results to JSON format
   * @param {Array} results - Validation results
   * @returns {Object} Formatted export object
   */
  exportResults(results) {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalNumbers: results.length,
        validNumbers: results.filter(r => r.valid).length,
        provider: 'numverify',
        generatorVersion: '3.0-ultrafast',
        quotaUsed: this.quota.used,
        quotaRemaining: this.quota.remaining
      },
      numbers: results.map(result => ({
        e164: result.e164,
        national: result.nationalNumber,
        country: result.country,
        carrier: result.carrier,
        countryCode: result.countryCode,
        valid: result.valid,
        lineType: result.lineType,
        location: result.location,
        preValidated: result.preValidated,
        apiValidated: result.apiValidated,
        cached: result.cached || false,
        generationMethod: result.generationMethod,
        timestamp: result.timestamp,
        error: result.error || null
      }))
    };
  }

  /**
   * Reset all caches and statistics
   */
  reset() {
    this.cache.clear();
    this.generator.clearCaches();
    this.quotaExhausted = false;
    this.stats = { totalRequests: 0, cacheHits: 0, cacheMisses: 0, validNumbers: 0, invalidNumbers: 0, errors: 0 };
    console.log('🔄 API service reset complete');
  }

  /**
   * Validate multiple numbers efficiently - ALIAS for validateBatch
   * @param {Array} phoneNumbers - Array of phone numbers
   * @param {Function} progressCallback - Progress callback
   * @param {Function} errorCallback - Error callback
   * @returns {Promise<Object>} Validation results
   */
  async validateMultipleNumbers(phoneNumbers, progressCallback = null, errorCallback = null) {
    // Convert phone numbers to candidate format
    const candidates = phoneNumbers.map(phoneNumber => ({
      e164: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
      nationalNumber: phoneNumber,
      country: 'Unknown',
      carrier: 'Unknown',
      generationMethod: 'external'
    }));

    return await this.validateBatch(candidates, progressCallback);
  }
}

module.exports = { EnhancedApiService };