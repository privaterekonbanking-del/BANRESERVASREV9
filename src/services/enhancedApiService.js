// Enhanced NumVerify API Service - Merged Solution
// Combines caching, rate limiting, and intelligent validation from all approaches

const { SmartPhoneGenerator } = require('../generators/smartPhoneGenerator');

class EnhancedApiService {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://apilayer.net/api/validate';
    this.fallbackUrl = 'http://apilayer.net/api/validate';
    
    // Configuration
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      requestTimeout: 15000,
      rateLimit: 100, // requests per minute
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      maxConcurrency: 5,
      ...options
    };
    
    // State management
    this.cache = new Map();
    this.requestQueue = [];
    this.activeRequests = 0;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.quotaExhausted = false;
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      validNumbers: 0,
      invalidNumbers: 0,
      errors: 0,
      quotaExhausted: 0
    };
    
    // Initialize smart generator
    this.generator = new SmartPhoneGenerator();
  }

  /**
   * Generate and validate phone numbers with intelligent pre-filtering
   * @param {Object} options - Generation and validation options
   * @returns {Promise<Object>} Results with validated numbers
   */
  async generateAndValidate(options = {}) {
    const {
      count = 10,
      country = null,
      carrier = null,
      preValidateOnly = false,
      progressCallback = null
    } = options;

    console.log(`Starting generation and validation of ${count} numbers...`);

    // Stage 1: Generate realistic candidates
    const candidates = await this.generator.generateRealisticNumbers({
      count: count * 2, // Generate extra candidates for better success rate
      country,
      carrier,
      preValidateOnly: true
    });

    if (preValidateOnly) {
      return {
        results: candidates,
        summary: {
          generated: candidates.length,
          preValidated: candidates.length,
          apiValidated: 0,
          valid: 0,
          invalid: 0
        }
      };
    }

    // Stage 2: API validation with intelligent batching
    const validationResults = await this.validateBatch(
      candidates.slice(0, count), // Take only requested count
      progressCallback
    );

    return validationResults;
  }

  /**
   * Validate a batch of phone numbers with rate limiting and caching
   * @param {Array} candidates - Array of candidate phone number objects
   * @param {Function} progressCallback - Optional progress callback
   * @returns {Promise<Object>} Validation results
   */
  async validateBatch(candidates, progressCallback = null) {
    const results = [];
    let processed = 0;
    let valid = 0;
    let invalid = 0;

    // Check quota status
    if (this.quotaExhausted) {
      console.warn('API quota exhausted, skipping validation');
      return {
        results: candidates.map(c => ({ ...c, apiValidated: false, quotaExhausted: true })),
        summary: { processed: 0, valid: 0, invalid: 0, quotaExhausted: true }
      };
    }

    for (const candidate of candidates) {
      try {
        // Check cache first
        const cached = this.getCachedResult(candidate.e164);
        if (cached) {
          this.stats.cacheHits++;
          results.push({
            ...candidate,
            ...cached,
            apiValidated: true,
            cached: true
          });
          
          if (cached.valid) valid++;
          else invalid++;
          processed++;
          
          if (progressCallback) {
            progressCallback({
              processed,
              total: candidates.length,
              valid,
              invalid,
              cached: true
            });
          }
          continue;
        }

        // Rate limiting
        await this.enforceRateLimit();

        // API validation
        const validationResult = await this.validateSingle(candidate.e164);
        
        if (validationResult.quotaExhausted) {
          this.quotaExhausted = true;
          console.warn('API quota exhausted during batch processing');
          break;
        }

        // Cache result
        this.cacheResult(candidate.e164, validationResult);
        
        // Add to results
        results.push({
          ...candidate,
          ...validationResult,
          apiValidated: true,
          cached: false
        });

        if (validationResult.valid) valid++;
        else invalid++;
        processed++;

        // Progress callback
        if (progressCallback) {
          progressCallback({
            processed,
            total: candidates.length,
            valid,
            invalid,
            cached: false,
            remainingQuota: this.estimateRemainingQuota()
          });
        }

      } catch (error) {
        console.error(`Validation failed for ${candidate.e164}:`, error.message);
        this.stats.errors++;
        
        results.push({
          ...candidate,
          valid: false,
          error: error.message,
          apiValidated: false
        });
        invalid++;
        processed++;
      }
    }

    return {
      results,
      summary: {
        processed,
        valid,
        invalid,
        total: candidates.length,
        cacheHits: this.stats.cacheHits,
        cacheMisses: this.stats.cacheMisses,
        quotaExhausted: this.quotaExhausted
      }
    };
  }

  /**
   * Validate a single phone number with NumVerify API
   * @param {string} phoneNumber - E164 formatted phone number
   * @returns {Promise<Object>} Validation result
   */
  async validateSingle(phoneNumber) {
    if (!phoneNumber || !this.apiKey) {
      throw new Error('Phone number and API key are required');
    }

    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    let lastError;

    // Try different endpoints
    const endpoints = [this.baseUrl, this.fallbackUrl];
    
    for (let endpointIndex = 0; endpointIndex < endpoints.length; endpointIndex++) {
      const url = endpoints[endpointIndex];
      
      for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
        try {
          const response = await this.makeRequest(url, cleanNumber);
          
          if (response.success === false) {
            return this.handleApiError(response.error, cleanNumber);
          }

          this.stats.totalRequests++;
          this.stats.cacheMisses++;

          return {
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

        } catch (error) {
          lastError = error;
          console.error(`Attempt ${attempt}/${this.config.maxRetries} failed for ${cleanNumber}:`, error.message);
          
          if (attempt < this.config.maxRetries) {
            await this.delay(this.config.retryDelay * attempt);
          }
        }
      }
    }

    throw new Error(`All validation attempts failed: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Make HTTP request to NumVerify API
   * @param {string} url - API endpoint URL
   * @param {string} phoneNumber - Clean phone number
   * @returns {Promise<Object>} API response
   */
  async makeRequest(url, phoneNumber) {
    const params = new URLSearchParams({
      access_key: this.apiKey.trim(),
      number: phoneNumber
    });

    const fullUrl = `${url}?${params.toString()}`;
    
    // Try direct request first
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PhoneValidator/2.0'
        },
        timeout: this.config.requestTimeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
      
    } catch (corsError) {
      // Fallback to CORS proxy for browser environments
      console.log('Direct request failed, trying CORS proxy...');
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
   * Handle NumVerify API errors
   * @param {Object} error - Error object from API
   * @param {string} phoneNumber - Phone number that failed
   * @returns {Object} Standardized error response
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
        this.stats.quotaExhausted++;
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
   * @param {string} phoneNumber - E164 phone number
   * @param {Object} result - Validation result
   */
  cacheResult(phoneNumber, result) {
    this.cache.set(phoneNumber, {
      ...result,
      cachedAt: Date.now()
    });
  }

  /**
   * Get cached validation result
   * @param {string} phoneNumber - E164 phone number
   * @returns {Object|null} Cached result or null
   */
  getCachedResult(phoneNumber) {
    const cached = this.cache.get(phoneNumber);
    
    if (!cached) return null;
    
    // Check if cache entry has expired
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
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 60000 / this.config.rateLimit; // ms per request
    
    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await this.delay(delay);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Estimate remaining API quota (rough estimate)
   * @returns {number} Estimated remaining requests
   */
  estimateRemainingQuota() {
    if (this.quotaExhausted) return 0;
    
    // This is a rough estimate - actual quota depends on your NumVerify plan
    const assumedMonthlyLimit = 1000; // Adjust based on your plan
    return Math.max(0, assumedMonthlyLimit - this.stats.totalRequests);
  }

  /**
   * Get service statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      generatorStats: this.generator.getStats(),
      quotaExhausted: this.quotaExhausted,
      estimatedRemainingQuota: this.estimateRemainingQuota()
    };
  }

  /**
   * Clear all caches and reset stats
   */
  reset() {
    this.cache.clear();
    this.generator.clearCaches();
    this.quotaExhausted = false;
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      validNumbers: 0,
      invalidNumbers: 0,
      errors: 0,
      quotaExhausted: 0
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
        generatorVersion: '2.0',
        stats: this.getStats()
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
}

module.exports = { EnhancedApiService };