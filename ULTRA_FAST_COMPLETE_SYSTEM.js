// ULTRA FAST COMPLETE SYSTEM - 5000 numbers in 5 minutes
// Combines libphonenumber + ultra speed + all intelligence features

const { getExampleNumber, parsePhoneNumber, isPossiblePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');
const { enhancedPhoneData } = require('./data/enhancedPhoneData');

class UltraFastIntelligentSystem {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://apilayer.net/api/validate';
    
    // ULTRA FAST CONFIGURATION - 5000 numbers in 5 minutes
    this.config = { 
      rateLimit: 2000,         // 33 calls per second (2x faster than friend)
      requestTimeout: 2500,    // 2.5 second timeout
      maxRetries: 1,           // No retries for speed
      batchSize: 500,          // HUGE batches
      concurrentRequests: 20,  // 20 parallel requests
      monthlyLimit: 50000,     // Your actual limit
      ...options 
    };
    
    // Simple tracking for speed
    this.quota = { limit: this.config.monthlyLimit, used: 0, remaining: this.config.monthlyLimit };
    this.cache = new Map();
    this.stats = { validNumbers: 0, invalidNumbers: 0, totalRequests: 0 };
    
    // Intelligence systems (lightweight)
    this.discoveredPrefixes = new Map();
    this.prefixStats = new Map();
    this.learningData = new Map();
    
    console.log(`⚡ ULTRA FAST INTELLIGENT SYSTEM: ${(this.config.rateLimit/60).toFixed(1)} calls/second`);
  }

  /**
   * ULTRA FAST generation with all intelligence features
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Results
   */
  async generateNumbers(options = {}) {
    const { count = 5000, country = null, carrier = null, validateWithApi = true } = options;

    console.log(`⚡ TARGET: ${count} numbers in ${Math.ceil(count/1000)} minutes for ${country || 'Random'}`);
    
    const startTime = Date.now();
    
    // STEP 1: ULTRA FAST candidate generation with libphonenumber
    console.log(`📡 Step 1: Generating candidates with libphonenumber validation...`);
    const candidates = await this.generateLibPhoneNumberCandidates(count * 1.2, country, carrier);
    console.log(`⚡ Generated ${candidates.length} libphonenumber-validated candidates`);

    if (!validateWithApi) {
      return {
        results: candidates,
        summary: { generated: candidates.length, valid: candidates.length, invalid: 0 }
      };
    }

    // STEP 2: ULTRA FAST API validation
    console.log(`📡 Step 2: Ultra fast API validation...`);
    return await this.ultraFastApiValidation(candidates.slice(0, count));
  }

  /**
   * Generate candidates using libphonenumber validation
   * @param {number} count - Number of candidates
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {Promise<Array>} Validated candidates
   */
  async generateLibPhoneNumberCandidates(count, country, carrier) {
    const candidates = [];
    let attempts = 0;
    const maxAttempts = count * 2;

    // Get country data
    const countries = country ? [country] : Object.keys(enhancedPhoneData);
    
    while (candidates.length < count && attempts < maxAttempts) {
      attempts++;
      
      try {
        const selectedCountry = country || countries[Math.floor(Math.random() * countries.length)];
        const countryData = enhancedPhoneData[selectedCountry];
        
        if (!countryData) continue;

        // Use libphonenumber to generate realistic number
        const candidate = await this.generateLibPhoneNumberCandidate(selectedCountry, carrier, countryData);
        
        if (candidate && this.validateWithLibPhoneNumber(candidate)) {
          // Apply intelligence: check if we've learned this prefix is good
          const prefixQuality = this.getPrefixQuality(candidate.prefix, selectedCountry);
          
          if (prefixQuality >= 0.3) { // 30% confidence threshold for speed
            candidates.push(candidate);
          }
        }
      } catch (error) {
        // Skip errors for speed
        continue;
      }
    }

    console.log(`📊 libphonenumber validation: ${candidates.length}/${attempts} success rate (${((candidates.length/attempts)*100).toFixed(1)}%)`);
    return candidates;
  }

  /**
   * Generate single candidate using libphonenumber
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @param {Object} countryData - Country data
   * @returns {Object} Generated candidate
   */
  async generateLibPhoneNumberCandidate(country, carrier, countryData) {
    // Get carrier data
    const carriers = Object.keys(countryData.carriers);
    const selectedCarrier = carrier || carriers[Math.floor(Math.random() * carriers.length)];
    const carrierData = countryData.carriers[selectedCarrier];
    
    if (!carrierData?.prefixes?.length) return null;

    // Use intelligence: prefer high-performing prefixes
    const intelligentPrefix = this.selectIntelligentPrefix(carrierData.prefixes, country, selectedCarrier);
    const selectedPrefix = intelligentPrefix || carrierData.prefixes[Math.floor(Math.random() * carrierData.prefixes.length)];
    
    // Generate realistic suffix
    const remainingLength = countryData.phone_length - selectedPrefix.length;
    const suffix = this.generateRealisticSuffix(remainingLength);
    const nationalNumber = selectedPrefix + suffix;
    
    const countryCode = Array.isArray(countryData.country_code) 
      ? countryData.country_code[0] 
      : countryData.country_code;

    return {
      country,
      carrier: selectedCarrier,
      prefix: selectedPrefix,
      nationalNumber,
      e164: `${countryCode}${nationalNumber}`,
      intelligenceUsed: !!intelligentPrefix
    };
  }

  /**
   * Validate candidate with libphonenumber
   * @param {Object} candidate - Candidate to validate
   * @returns {boolean} Valid or not
   */
  validateWithLibPhoneNumber(candidate) {
    try {
      // Fast libphonenumber validation
      if (!isPossiblePhoneNumber(candidate.e164)) return false;
      if (!isValidPhoneNumber(candidate.e164)) return false;
      
      const parsed = parsePhoneNumber(candidate.e164);
      return parsed.getType() === 'MOBILE';
      
    } catch (error) {
      return false;
    }
  }

  /**
   * ULTRA FAST API validation with parallel processing
   * @param {Array} candidates - Candidates to validate
   * @returns {Promise<Object>} Results
   */
  async ultraFastApiValidation(candidates) {
    const results = [];
    let processed = 0, valid = 0, invalid = 0;
    const startTime = Date.now();

    console.log(`⚡ ULTRA FAST API: ${candidates.length} numbers with ${this.config.concurrentRequests} parallel calls...`);
    
    // Process in massive parallel batches
    const batchSize = this.config.batchSize;
    
    for (let i = 0; i < candidates.length; i += batchSize) {
      if (this.quota.remaining <= 0) {
        console.warn('🚨 Quota exhausted');
        break;
      }

      const batch = candidates.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(candidates.length / batchSize);
      
      console.log(`⚡ Batch ${batchNum}/${totalBatches}: ${batch.length} numbers...`);
      
      // PARALLEL PROCESSING - 20 concurrent requests
      const batchResults = await this.processParallelBatch(batch);
      results.push(...batchResults);
      
      // Update counters
      processed += batchResults.length;
      valid += batchResults.filter(r => r.valid).length;
      invalid += batchResults.filter(r => !r.valid).length;

      // LEARNING: Update intelligence from results
      this.updateIntelligenceFromResults(batchResults);

      // Progress display
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = (processed / elapsed).toFixed(1);
      const eta = ((candidates.length - processed) / parseFloat(speed) / 60).toFixed(1);
      const successRate = ((valid / processed) * 100).toFixed(1);
      
      console.log(`⚡ ${processed}/${candidates.length} | ✅${valid} ❌${invalid} | 📊${successRate}% | 📊${this.quota.remaining} LEFT | ⚡${speed}/sec | ETA: ${eta}min`);
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const finalSpeed = (processed / totalTime).toFixed(1);
    
    console.log(`\n🎯 ULTRA FAST COMPLETE: ${processed} numbers in ${(totalTime/60).toFixed(1)} minutes (${finalSpeed}/sec)`);
    
    return { 
      results, 
      summary: { 
        processed, valid, invalid,
        quotaUsed: this.quota.used,
        quotaRemaining: this.quota.remaining,
        successRate: ((valid / processed) * 100).toFixed(1),
        speed: `${finalSpeed} numbers/second`,
        totalTime: `${(totalTime/60).toFixed(1)} minutes`,
        intelligenceUsed: results.filter(r => r.intelligenceUsed).length
      } 
    };
  }

  /**
   * Process batch in parallel
   * @param {Array} batch - Batch to process
   * @returns {Promise<Array>} Batch results
   */
  async processParallelBatch(batch) {
    // Create semaphore for concurrent requests
    const semaphore = new Array(this.config.concurrentRequests).fill(null);
    const promises = [];

    for (const candidate of batch) {
      if (this.quota.remaining <= 0) break;
      
      // Wait for available slot
      const promise = this.waitForSlot(semaphore).then(async (slotIndex) => {
        try {
          const result = await this.ultraFastValidateSingle(candidate);
          semaphore[slotIndex] = null; // Free slot
          return { ...candidate, ...result };
        } catch (error) {
          semaphore[slotIndex] = null; // Free slot
          return { ...candidate, valid: false, error: error.message };
        }
      });
      
      promises.push(promise);
    }

    return await Promise.all(promises);
  }

  /**
   * Wait for available slot in semaphore
   * @param {Array} semaphore - Semaphore array
   * @returns {Promise<number>} Available slot index
   */
  async waitForSlot(semaphore) {
    return new Promise((resolve) => {
      const checkSlot = () => {
        const freeSlot = semaphore.findIndex(slot => slot === null);
        if (freeSlot !== -1) {
          semaphore[freeSlot] = 'occupied';
          resolve(freeSlot);
        } else {
          setTimeout(checkSlot, 10); // Check every 10ms
        }
      };
      checkSlot();
    });
  }

  /**
   * ULTRA FAST single API validation
   * @param {Object} candidate - Candidate to validate
   * @returns {Promise<Object>} Validation result
   */
  async ultraFastValidateSingle(candidate) {
    // INSTANT cache check
    const cached = this.cache.get(candidate.e164);
    if (cached) return { ...cached, cached: true };

    const cleanNumber = candidate.e164.replace(/[^\d+]/g, '');
    
    try {
      // LIGHTNING FAST API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);
      
      const response = await fetch(`${this.baseUrl}?access_key=${this.apiKey}&number=${cleanNumber}`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      // FAST quota update
      this.quota.used++;
      this.quota.remaining--;
      
      // Handle quota exhaustion
      if (data.success === false && data.error?.code === 104) {
        this.quota.remaining = 0;
        return { valid: false, quotaExhausted: true };
      }
      
      const result = {
        valid: data.valid || false,
        carrier: data.carrier || 'Unknown',
        lineType: data.line_type || 'Unknown',
        location: data.location || 'Unknown'
      };
      
      // FAST cache
      this.cache.set(candidate.e164, result);
      
      return result;
      
    } catch (error) {
      throw new Error(`Timeout or network error`);
    }
  }

  /**
   * Select intelligent prefix based on learning
   * @param {Array} prefixes - Available prefixes
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {string|null} Best prefix or null
   */
  selectIntelligentPrefix(prefixes, country, carrier) {
    // Get learned prefix performance
    const prefixPerformance = [];
    
    prefixes.forEach(prefix => {
      const key = `${country}_${carrier}_${prefix}`;
      const stats = this.prefixStats.get(key);
      
      if (stats && stats.attempts >= 5) { // Minimum learning threshold
        const successRate = stats.successes / stats.attempts;
        if (successRate >= 0.7) { // 70% success rate
          prefixPerformance.push({ prefix, successRate });
        }
      }
    });

    if (prefixPerformance.length > 0) {
      // Sort by success rate and pick best
      prefixPerformance.sort((a, b) => b.successRate - a.successRate);
      return prefixPerformance[0].prefix;
    }

    return null; // No learned data, use random
  }

  /**
   * Get prefix quality score
   * @param {string} prefix - Prefix to check
   * @param {string} country - Country name
   * @returns {number} Quality score (0-1)
   */
  getPrefixQuality(prefix, country) {
    const key = `${country}_${prefix}`;
    const stats = this.prefixStats.get(key);
    
    if (!stats || stats.attempts < 3) return 0.5; // Default neutral
    
    return stats.successes / stats.attempts;
  }

  /**
   * Update intelligence from API results
   * @param {Array} results - API validation results
   */
  updateIntelligenceFromResults(results) {
    results.forEach(result => {
      const key = `${result.country}_${result.prefix}`;
      
      if (!this.prefixStats.has(key)) {
        this.prefixStats.set(key, { attempts: 0, successes: 0 });
      }
      
      const stats = this.prefixStats.get(key);
      stats.attempts++;
      if (result.valid) stats.successes++;
      
      // Discover new valid prefixes
      if (result.valid && result.lineType === 'mobile') {
        const discoveryKey = `${result.country}_${result.carrier}`;
        if (!this.discoveredPrefixes.has(discoveryKey)) {
          this.discoveredPrefixes.set(discoveryKey, new Set());
        }
        this.discoveredPrefixes.get(discoveryKey).add(result.prefix);
      }
    });
  }

  /**
   * Generate realistic suffix
   * @param {number} length - Suffix length
   * @returns {string} Generated suffix
   */
  generateRealisticSuffix(length) {
    let suffix = '';
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        suffix += Math.floor(Math.random() * 8) + 2; // 2-9 for first digit
      } else if (i === length - 1) {
        suffix += Math.floor(Math.random() * 9) + 1; // 1-9 for last digit
      } else {
        suffix += Math.floor(Math.random() * 10); // 0-9 for middle
      }
    }
    return suffix;
  }

  /**
   * Export results to TXT format (horizontal comma-separated)
   * @param {Array} results - Results to export
   * @returns {Object} Export object
   */
  exportToTxt(results) {
    const validNumbers = results.filter(r => r.valid);
    const text = validNumbers.map(r => r.e164).join(',');
    
    return {
      format: 'txt',
      count: validNumbers.length,
      text: text
    };
  }

  /**
   * Get system stats
   * @returns {Object} System statistics
   */
  getStats() {
    return {
      ...this.stats,
      quotaUsed: this.quota.used,
      quotaRemaining: this.quota.remaining,
      quotaLimit: this.quota.limit,
      usagePercentage: ((this.quota.used / this.quota.limit) * 100).toFixed(1),
      discoveredPrefixes: this.discoveredPrefixes.size,
      learnedPrefixes: this.prefixStats.size,
      cacheSize: this.cache.size
    };
  }

  /**
   * Set quota limit
   * @param {number} limit - Monthly quota limit
   */
  setQuotaLimit(limit) {
    this.quota.limit = limit;
    this.quota.remaining = Math.max(0, limit - this.quota.used);
    console.log(`📊 Quota set: ${this.quota.used}/${limit} used, ${this.quota.remaining} remaining`);
  }
}

// USAGE EXAMPLE
async function ultraFastDemo(apiKey) {
  console.log('⚡ ULTRA FAST INTELLIGENT DEMO - 5000 numbers in 5 minutes\n');
  
  const system = new UltraFastIntelligentSystem(apiKey, {
    monthlyLimit: 50000, // Your actual limit
    rateLimit: 2000 // 33 calls per second
  });

  try {
    // Test speed with Saint Lucia
    const results = await system.generateNumbers({
      count: 5000,
      country: 'Saint Lucia',
      validateWithApi: true
    });

    console.log('\n🎯 RESULTS:');
    console.log(`✅ Valid: ${results.summary.valid}`);
    console.log(`📊 Success Rate: ${results.summary.successRate}%`);
    console.log(`⚡ Speed: ${results.summary.speed}`);
    console.log(`⏱️ Time: ${results.summary.totalTime}`);
    console.log(`🧠 Intelligence Used: ${results.summary.intelligenceUsed} numbers`);

    // Export
    const exported = system.exportToTxt(results.results);
    console.log(`📄 TXT Export: ${exported.count} numbers`);
    console.log(`📄 Preview: ${exported.text.substring(0, 100)}...`);

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

module.exports = { UltraFastIntelligentSystem, ultraFastDemo };

if (require.main === module) {
  const apiKey = process.env.NUMVERIFY_API_KEY || 'your-api-key-here';
  ultraFastDemo(apiKey);
}