// Prefix Discovery System - Learn Real Prefixes from NumVerify API
// This system discovers and validates real carrier prefixes automatically

const fs = require('fs').promises;
const path = require('path');

class PrefixDiscoveryService {
  constructor(apiService) {
    this.apiService = apiService;
    this.discoveredPrefixes = new Map(); // country -> carrier -> Set of valid prefixes
    this.prefixStats = new Map(); // prefix -> {attempts, successes, successRate}
    this.discoveryCache = new Map(); // Cache discovery results
    this.saveInterval = 100; // Save every 100 discoveries
    this.discoveryCount = 0;
  }

  /**
   * Discover valid prefixes by testing patterns with NumVerify
   * @param {string} country - Country to discover prefixes for
   * @param {string} carrier - Carrier to discover prefixes for
   * @param {number} testCount - Number of test attempts
   * @returns {Promise<Object>} Discovery results
   */
  async discoverPrefixesForCarrier(country, carrier, testCount = 50) {
    console.log(`🔍 Discovering real prefixes for ${country} - ${carrier}...`);
    
    const results = {
      country,
      carrier,
      validPrefixes: new Set(),
      invalidPrefixes: new Set(),
      successRate: 0,
      totalTested: 0,
      apiCallsMade: 0
    };

    // Get existing prefix patterns to test variations
    const existingPrefixes = this.getExistingPrefixes(country, carrier);
    
    for (let i = 0; i < testCount; i++) {
      try {
        // Generate test number based on existing patterns
        const testNumber = this.generateTestNumber(country, carrier, existingPrefixes);
        
        if (!testNumber) continue;

        // Test with API
        const validation = await this.apiService.validateSingle(testNumber.e164);
        results.apiCallsMade++;
        results.totalTested++;

        // Extract prefix from test number
        const prefix = this.extractPrefix(testNumber.nationalNumber, country);
        
        if (validation.valid && validation.lineType === 'mobile') {
          // Valid number found - record the prefix
          results.validPrefixes.add(prefix);
          this.recordValidPrefix(country, carrier, prefix, testNumber);
          
          console.log(`✅ Found valid prefix: ${country} ${carrier} ${prefix} -> ${testNumber.e164}`);
        } else {
          results.invalidPrefixes.add(prefix);
          this.recordInvalidPrefix(country, carrier, prefix);
        }

        // Update statistics
        this.updatePrefixStats(prefix, validation.valid);

        // Save periodically
        if (++this.discoveryCount % this.saveInterval === 0) {
          await this.saveDiscoveryData();
        }

        // Rate limiting
        await this.delay(100);

      } catch (error) {
        console.error(`Discovery error for ${country} ${carrier}:`, error.message);
        
        if (error.message.includes('quota') || error.message.includes('limit')) {
          console.warn('🚨 API quota reached during discovery');
          break;
        }
      }
    }

    results.successRate = results.totalTested > 0 ? 
      (results.validPrefixes.size / results.totalTested * 100).toFixed(1) : 0;

    console.log(`📊 Discovery complete: ${results.validPrefixes.size} valid prefixes found (${results.successRate}% success rate)`);
    
    return results;
  }

  /**
   * Generate test number for prefix discovery
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @param {Array} existingPrefixes - Known prefixes to test variations
   * @returns {Object} Test number object
   */
  generateTestNumber(country, carrier, existingPrefixes) {
    const { enhancedPhoneData } = require('../data/enhancedPhoneData');
    const countryData = enhancedPhoneData[country];
    
    if (!countryData) return null;

    // Strategy 1: Test variations of existing prefixes
    if (existingPrefixes.length > 0 && Math.random() < 0.7) {
      const basePrefix = existingPrefixes[Math.floor(Math.random() * existingPrefixes.length)];
      return this.generateVariation(basePrefix, countryData, country);
    }

    // Strategy 2: Test systematic prefix ranges
    return this.generateSystematicTest(countryData, country);
  }

  /**
   * Generate variation of known prefix
   * @param {string} basePrefix - Base prefix to vary
   * @param {Object} countryData - Country data
   * @param {string} country - Country name
   * @returns {Object} Test number
   */
  generateVariation(basePrefix, countryData, country) {
    // Create variations: increment/decrement last digits
    const variations = [];
    const baseNum = parseInt(basePrefix);
    
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue; // Skip the original
      const variation = (baseNum + i).toString().padStart(basePrefix.length, '0');
      variations.push(variation);
    }

    const selectedPrefix = variations[Math.floor(Math.random() * variations.length)];
    return this.buildTestNumber(selectedPrefix, countryData, country);
  }

  /**
   * Generate systematic test number
   * @param {Object} countryData - Country data
   * @param {string} country - Country name
   * @returns {Object} Test number
   */
  generateSystematicTest(countryData, country) {
    // Generate based on mobile patterns
    const patterns = countryData.mobile_patterns || [];
    
    if (patterns.length === 0) {
      // Fallback: generate based on country-specific rules
      return this.generateCountrySpecificTest(countryData, country);
    }

    // Use regex pattern to generate realistic prefix
    const pattern = patterns[0];
    const prefix = this.generateFromPattern(pattern, countryData.phone_length);
    
    return this.buildTestNumber(prefix, countryData, country);
  }

  /**
   * Build complete test number
   * @param {string} prefix - Prefix to test
   * @param {Object} countryData - Country data
   * @param {string} country - Country name
   * @returns {Object} Complete test number
   */
  buildTestNumber(prefix, countryData, country) {
    const remainingLength = countryData.phone_length - prefix.length;
    const suffix = this.generateRandomSuffix(remainingLength);
    const nationalNumber = prefix + suffix;
    
    const countryCode = Array.isArray(countryData.country_code) 
      ? countryData.country_code[0] 
      : countryData.country_code;

    return {
      nationalNumber,
      e164: `${countryCode}${nationalNumber}`,
      prefix,
      country
    };
  }

  /**
   * Extract prefix from validated number
   * @param {string} nationalNumber - National number
   * @param {string} country - Country name
   * @returns {string} Extracted prefix
   */
  extractPrefix(nationalNumber, country) {
    // Extract meaningful prefix based on country
    if (country === 'Australia' || country === 'New Zealand') {
      return nationalNumber.substring(0, 3); // First 3 digits
    } else if (country.includes('Trinidad') || country.includes('Dominican')) {
      return nationalNumber.substring(0, 3); // First 3 digits
    } else {
      return nationalNumber.substring(0, Math.min(4, nationalNumber.length));
    }
  }

  /**
   * Record valid prefix discovery
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @param {string} prefix - Valid prefix
   * @param {Object} testNumber - Test number object
   */
  recordValidPrefix(country, carrier, prefix, testNumber) {
    if (!this.discoveredPrefixes.has(country)) {
      this.discoveredPrefixes.set(country, new Map());
    }
    
    if (!this.discoveredPrefixes.get(country).has(carrier)) {
      this.discoveredPrefixes.get(country).set(carrier, new Set());
    }
    
    this.discoveredPrefixes.get(country).get(carrier).add(prefix);
    
    // Cache the discovery
    const cacheKey = `${country}_${carrier}_${prefix}`;
    this.discoveryCache.set(cacheKey, {
      valid: true,
      testNumber: testNumber,
      discoveredAt: new Date().toISOString(),
      confirmedBy: 'numverify'
    });
  }

  /**
   * Record invalid prefix
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @param {string} prefix - Invalid prefix
   */
  recordInvalidPrefix(country, carrier, prefix) {
    const cacheKey = `${country}_${carrier}_${prefix}`;
    this.discoveryCache.set(cacheKey, {
      valid: false,
      discoveredAt: new Date().toISOString(),
      confirmedBy: 'numverify'
    });
  }

  /**
   * Update prefix statistics
   * @param {string} prefix - Prefix to update stats for
   * @param {boolean} isValid - Whether the prefix was valid
   */
  updatePrefixStats(prefix, isValid) {
    if (!this.prefixStats.has(prefix)) {
      this.prefixStats.set(prefix, { attempts: 0, successes: 0, successRate: 0 });
    }
    
    const stats = this.prefixStats.get(prefix);
    stats.attempts++;
    if (isValid) stats.successes++;
    stats.successRate = ((stats.successes / stats.attempts) * 100).toFixed(1);
    
    this.prefixStats.set(prefix, stats);
  }

  /**
   * Get existing prefixes from phone data
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {Array} Array of existing prefixes
   */
  getExistingPrefixes(country, carrier) {
    try {
      const { enhancedPhoneData } = require('../data/enhancedPhoneData');
      const carrierData = enhancedPhoneData[country]?.carriers[carrier];
      return carrierData?.prefixes || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Save discovery data to file
   * @returns {Promise<void>}
   */
  async saveDiscoveryData() {
    try {
      const discoveryData = {
        timestamp: new Date().toISOString(),
        discoveredPrefixes: this.mapToObject(this.discoveredPrefixes),
        prefixStats: this.mapToObject(this.prefixStats),
        totalDiscoveries: this.discoveryCount
      };

      const filePath = path.join(process.cwd(), 'discovered_prefixes.json');
      await fs.writeFile(filePath, JSON.stringify(discoveryData, null, 2));
      
      console.log(`💾 Discovery data saved (${this.discoveryCount} discoveries)`);
    } catch (error) {
      console.error('Failed to save discovery data:', error.message);
    }
  }

  /**
   * Load previously discovered data
   * @returns {Promise<void>}
   */
  async loadDiscoveryData() {
    try {
      const filePath = path.join(process.cwd(), 'discovered_prefixes.json');
      const data = await fs.readFile(filePath, 'utf8');
      const discoveryData = JSON.parse(data);
      
      this.discoveredPrefixes = this.objectToMap(discoveryData.discoveredPrefixes);
      this.prefixStats = this.objectToMap(discoveryData.prefixStats);
      this.discoveryCount = discoveryData.totalDiscoveries || 0;
      
      console.log(`📂 Loaded discovery data (${this.discoveryCount} previous discoveries)`);
    } catch (error) {
      console.log('📂 No previous discovery data found, starting fresh');
    }
  }

  /**
   * Get discovered prefixes for a carrier
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {Array} Array of discovered valid prefixes
   */
  getDiscoveredPrefixes(country, carrier) {
    const countryMap = this.discoveredPrefixes.get(country);
    if (!countryMap) return [];
    
    const carrierSet = countryMap.get(carrier);
    if (!carrierSet) return [];
    
    return Array.from(carrierSet);
  }

  /**
   * Generate discovery report
   * @returns {Object} Discovery statistics and report
   */
  generateDiscoveryReport() {
    const report = {
      totalCountries: this.discoveredPrefixes.size,
      totalCarriers: 0,
      totalValidPrefixes: 0,
      countriesWithDiscoveries: [],
      topPerformingPrefixes: [],
      discoveryStats: {
        totalDiscoveries: this.discoveryCount,
        averageSuccessRate: 0
      }
    };

    // Count carriers and prefixes
    this.discoveredPrefixes.forEach((carriers, country) => {
      report.totalCarriers += carriers.size;
      
      const countryData = { country, carriers: [], totalPrefixes: 0 };
      
      carriers.forEach((prefixes, carrier) => {
        report.totalValidPrefixes += prefixes.size;
        countryData.totalPrefixes += prefixes.size;
        countryData.carriers.push({
          carrier,
          prefixCount: prefixes.size,
          prefixes: Array.from(prefixes).slice(0, 5) // Show first 5
        });
      });
      
      report.countriesWithDiscoveries.push(countryData);
    });

    // Top performing prefixes
    const sortedPrefixes = Array.from(this.prefixStats.entries())
      .sort((a, b) => parseFloat(b[1].successRate) - parseFloat(a[1].successRate))
      .slice(0, 10);

    report.topPerformingPrefixes = sortedPrefixes.map(([prefix, stats]) => ({
      prefix,
      successRate: stats.successRate,
      attempts: stats.attempts,
      successes: stats.successes
    }));

    // Calculate average success rate
    const totalSuccessRates = Array.from(this.prefixStats.values())
      .reduce((sum, stats) => sum + parseFloat(stats.successRate), 0);
    
    report.discoveryStats.averageSuccessRate = this.prefixStats.size > 0 
      ? (totalSuccessRates / this.prefixStats.size).toFixed(1)
      : 0;

    return report;
  }

  /**
   * Update phone data with discovered prefixes
   * @param {string} country - Country to update
   * @param {string} carrier - Carrier to update
   * @returns {Promise<Object>} Update results
   */
  async updatePhoneDataWithDiscoveries(country, carrier) {
    const discoveredPrefixes = this.getDiscoveredPrefixes(country, carrier);
    
    if (discoveredPrefixes.length === 0) {
      return { updated: false, reason: 'No discovered prefixes found' };
    }

    try {
      // Load current phone data
      const { enhancedPhoneData } = require('../data/enhancedPhoneData');
      
      if (!enhancedPhoneData[country]?.carriers[carrier]) {
        return { updated: false, reason: 'Country/carrier not found in phone data' };
      }

      // Merge discovered prefixes with existing ones
      const existingPrefixes = enhancedPhoneData[country].carriers[carrier].prefixes || [];
      const mergedPrefixes = [...new Set([...existingPrefixes, ...discoveredPrefixes])];
      
      // Update the data structure
      enhancedPhoneData[country].carriers[carrier].prefixes = mergedPrefixes;
      enhancedPhoneData[country].carriers[carrier].discoveredPrefixes = discoveredPrefixes;
      enhancedPhoneData[country].carriers[carrier].lastDiscoveryUpdate = new Date().toISOString();

      console.log(`🔄 Updated ${country} ${carrier}: ${existingPrefixes.length} -> ${mergedPrefixes.length} prefixes`);
      
      return {
        updated: true,
        previousCount: existingPrefixes.length,
        newCount: mergedPrefixes.length,
        discoveredCount: discoveredPrefixes.length
      };

    } catch (error) {
      console.error(`Failed to update phone data:`, error.message);
      return { updated: false, reason: error.message };
    }
  }

  // Helper methods
  generateRandomSuffix(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }

  extractPrefix(nationalNumber, country) {
    // Country-specific prefix extraction logic
    if (country === 'Australia' || country === 'New Zealand') {
      return nationalNumber.substring(0, 3);
    } else if (country.includes('Trinidad') || country.includes('Dominican')) {
      return nationalNumber.substring(0, 3);
    } else {
      return nationalNumber.substring(0, Math.min(4, nationalNumber.length));
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  mapToObject(map) {
    const obj = {};
    map.forEach((value, key) => {
      if (value instanceof Map) {
        obj[key] = this.mapToObject(value);
      } else if (value instanceof Set) {
        obj[key] = Array.from(value);
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }

  objectToMap(obj) {
    const map = new Map();
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        map.set(key, this.objectToMap(value));
      } else if (Array.isArray(value)) {
        map.set(key, new Set(value));
      } else {
        map.set(key, value);
      }
    });
    return map;
  }
}

module.exports = { PrefixDiscoveryService };