// SIMPLE FAST WORKING SYSTEM - Using YOUR Original Working Prefixes
// No complex libphonenumber, just fast processing of YOUR working data

const { enhancedPhoneData } = require('./data/enhancedPhoneData');

class SimpleFastSystem {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://apilayer.net/api/validate';
    
    // SIMPLE FAST CONFIG
    this.config = { 
      rateLimit: 300,         // 5 calls per second (safe and fast)
      requestTimeout: 8000,   // 8 second timeout
      batchSize: 50,          // Moderate batches
      monthlyLimit: 50000,    // Your actual limit
      ...options 
    };
    
    this.quota = { limit: this.config.monthlyLimit, used: 0, remaining: this.config.monthlyLimit };
    this.cache = new Map();
    this.stats = { validNumbers: 0, invalidNumbers: 0, totalRequests: 0 };
    this.lastRequestTime = 0;

    console.log(`🚀 SIMPLE FAST SYSTEM: ${(this.config.rateLimit/60).toFixed(1)} calls/second`);
  }

  /**
   * Generate phone numbers using YOUR original working logic
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Results
   */
  async generateNumbers(options = {}) {
    const { count = 1000, country = null, carrier = null, validateWithApi = true } = options;

    console.log(`🚀 GENERATING: ${count} ${country || 'random'} numbers...`);
    
    // Use YOUR original working generation logic
    const candidates = [];
    for (let i = 0; i < count; i++) {
      try {
        const candidate = this.generateSingleNumber(country, carrier);
        if (candidate) {
          candidates.push(candidate);
        }
      } catch (error) {
        console.error(`Generation error ${i}:`, error.message);
      }
    }

    console.log(`✅ Generated ${candidates.length} candidates`);

    if (!validateWithApi) {
      return {
        results: candidates.map(c => ({ ...c, valid: true, preValidated: true })),
        summary: { processed: candidates.length, valid: candidates.length, invalid: 0 }
      };
    }

    return await this.validateBatchSimple(candidates);
  }

  /**
   * Generate single number using YOUR original working logic
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {Object} Generated number
   */
  generateSingleNumber(country, carrier) {
    // Get country data
    const countries = Object.keys(enhancedPhoneData);
    const selectedCountry = country || countries[Math.floor(Math.random() * countries.length)];
    const countryData = enhancedPhoneData[selectedCountry];
    
    if (!countryData) return null;

    // Get carrier data
    const carriers = Object.keys(countryData.carriers);
    const selectedCarrier = carrier || carriers[Math.floor(Math.random() * carriers.length)];
    const carrierData = countryData.carriers[selectedCarrier];
    
    if (!carrierData || !carrierData.prefixes || carrierData.prefixes.length === 0) {
      return null;
    }

    // Use YOUR original prefix selection
    const randomPrefix = carrierData.prefixes[Math.floor(Math.random() * carrierData.prefixes.length)];
    
    // Calculate remaining digits using YOUR original logic
    const remainingDigits = countryData.phone_length - randomPrefix.length;
    
    if (remainingDigits <= 0) {
      console.warn(`Prefix too long for ${selectedCountry}: ${randomPrefix}`);
      return null;
    }

    // Generate suffix using YOUR original logic
    const randomSuffix = this.generateRandomDigits(remainingDigits);
    
    // Format number using YOUR original logic
    let fullNumber;
    let localNumber;
    
    if (Array.isArray(countryData.country_code)) {
      // Dominican Republic case
      const randomCountryCode = countryData.country_code[Math.floor(Math.random() * countryData.country_code.length)];
      fullNumber = `${randomCountryCode}${randomPrefix}${randomSuffix}`;
      localNumber = `${randomPrefix}${randomSuffix}`;
    } else if (randomPrefix.includes('-')) {
      // Caribbean countries with area codes
      const parts = randomPrefix.split('-');
      const prefix = parts[1];
      fullNumber = `${countryData.country_code.replace('-', '')}${prefix}${randomSuffix}`;
      localNumber = `${prefix}${randomSuffix}`;
    } else {
      // Standard countries
      fullNumber = `${countryData.country_code}${randomPrefix}${randomSuffix}`;
      localNumber = `${randomPrefix}${randomSuffix}`;
    }
    
    return {
      country: selectedCountry,
      carrier: selectedCarrier,
      countryCode: Array.isArray(countryData.country_code) ? countryData.country_code[0] : countryData.country_code,
      prefix: randomPrefix,
      localNumber: localNumber,
      fullNumber: fullNumber,
      e164: fullNumber,
      nationalNumber: localNumber,
      pattern: carrierData.number_pattern
    };
  }

  /**
   * Generate random digits - YOUR original logic
   * @param {number} length - Number of digits
   * @returns {string} Random digits
   */
  generateRandomDigits(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  /**
   * Simple fast validation
   * @param {Array} candidates - Candidates to validate
   * @returns {Promise<Object>} Results
   */
  async validateBatchSimple(candidates) {
    const results = [];
    let processed = 0, valid = 0, invalid = 0;
    const startTime = Date.now();

    console.log(`🔍 VALIDATING: ${candidates.length} numbers...`);
    
    for (const candidate of candidates) {
      try {
        // Check quota
        if (this.quota.remaining <= 0) {
          console.warn('🚨 Quota exhausted');
          break;
        }

        // Simple rate limiting
        await this.simpleRateLimit();
        
        // API validation
        const validationResult = await this.validateSingleSimple(candidate.e164);
        
        if (validationResult.quotaExhausted) {
          console.warn('🚨 API quota exhausted');
          break;
        }

        results.push({ ...candidate, ...validationResult });
        
        if (validationResult.valid) valid++; else invalid++;
        processed++;

        // Progress every 100 numbers
        if (processed % 100 === 0) {
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = (processed / elapsed).toFixed(1);
          const successRate = ((valid / processed) * 100).toFixed(1);
          
          console.log(`🔍 ${processed}/${candidates.length} | ✅${valid} ❌${invalid} | 📊${successRate}% | 📊${this.quota.remaining} LEFT | ⚡${speed}/sec`);
        }

      } catch (error) {
        console.error(`Validation error: ${error.message}`);
        results.push({ ...candidate, valid: false, error: error.message });
        invalid++;
        processed++;
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const speed = (processed / totalTime).toFixed(1);
    
    console.log(`\n🎯 SIMPLE VALIDATION COMPLETE: ${processed} numbers in ${(totalTime/60).toFixed(1)} minutes (${speed}/sec)`);
    
    return { 
      results, 
      summary: { 
        processed, valid, invalid,
        quotaUsed: this.quota.used,
        quotaRemaining: this.quota.remaining,
        successRate: ((valid / processed) * 100).toFixed(1),
        speed: `${speed} numbers/second`,
        totalTime: `${(totalTime/60).toFixed(1)} minutes`
      } 
    };
  }

  /**
   * Simple API validation
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Object>} Result
   */
  async validateSingleSimple(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    try {
      const response = await fetch(`${this.baseUrl}?access_key=${this.apiKey}&number=${cleanNumber}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: this.config.requestTimeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update quota
      this.quota.used++;
      this.quota.remaining = Math.max(0, this.quota.limit - this.quota.used);
      
      // Handle quota exhaustion
      if (data.success === false && data.error?.code === 104) {
        this.quota.remaining = 0;
        return { valid: false, quotaExhausted: true };
      }
      
      return {
        valid: data.valid || false,
        carrier: data.carrier || 'Unknown',
        lineType: data.line_type || 'Unknown',
        location: data.location || 'Unknown'
      };
      
    } catch (error) {
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  /**
   * Simple rate limiting
   * @returns {Promise<void>}
   */
  async simpleRateLimit() {
    const now = Date.now();
    const minInterval = 60000 / this.config.rateLimit; // 200ms for 300/min
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Export to TXT format
   * @param {Array} results - Results
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
   * Set quota limit
   * @param {number} limit - Quota limit
   */
  setQuotaLimit(limit) {
    this.quota.limit = limit;
    this.quota.remaining = Math.max(0, limit - this.quota.used);
    console.log(`📊 Quota set: ${this.quota.used}/${limit} used, ${this.quota.remaining} remaining`);
  }

  /**
   * Get stats
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      quotaUsed: this.quota.used,
      quotaRemaining: this.quota.remaining,
      quotaLimit: this.quota.limit,
      usagePercentage: ((this.quota.used / this.quota.limit) * 100).toFixed(1)
    };
  }
}

module.exports = { SimpleFastSystem };

// Test with YOUR original data
async function testWithOriginalData(apiKey) {
  console.log('🧪 TESTING WITH YOUR ORIGINAL WORKING DATA\n');
  
  const system = new SimpleFastSystem(apiKey);
  system.setQuotaLimit(10000);
  
  try {
    // Test with small batch first
    console.log('🧪 Testing 100 numbers first...');
    const testResult = await system.generateNumbers({
      count: 100,
      country: 'Australia', // Known working country
      validateWithApi: true
    });

    console.log(`🎯 Test Results: ${testResult.summary.valid}/${testResult.summary.processed} valid (${testResult.summary.successRate}%)`);
    
    if (parseFloat(testResult.summary.successRate) > 70) {
      console.log('✅ System working! Ready for larger batches.');
    } else {
      console.log('❌ Still issues with prefixes.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  const apiKey = process.env.NUMVERIFY_API_KEY || 'your-api-key-here';
  testWithOriginalData(apiKey);
}