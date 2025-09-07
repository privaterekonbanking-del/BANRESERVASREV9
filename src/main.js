// Main Integration - Complete Merged Solution
// Combines all three approaches into a unified phone number generator and validator

const { EnhancedApiService } = require('./services/enhancedApiService');
const { SmartPhoneGenerator } = require('./generators/smartPhoneGenerator');
const { enhancedPhoneData } = require('./data/enhancedPhoneData');

class PhoneNumberSystem {
  constructor(apiKey, options = {}) {
    this.apiService = new EnhancedApiService(apiKey, options);
    this.generator = new SmartPhoneGenerator();
    
    this.config = {
      defaultCount: 10,
      preValidationEnabled: true,
      exportFormat: 'json',
      ...options
    };
  }

  /**
   * Generate realistic phone numbers with optional API validation
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated numbers with validation results
   */
  async generateNumbers(options = {}) {
    const {
      count = this.config.defaultCount,
      country = null,
      carrier = null,
      validateWithApi = true,
      exportResults = false,
      progressCallback = null
    } = options;

    console.log(`🚀 Starting phone number generation...`);
    console.log(`📊 Parameters: ${count} numbers, Country: ${country || 'Random'}, Carrier: ${carrier || 'Random'}`);

    try {
      let results;

      if (validateWithApi) {
        // Full pipeline: Generation + Pre-validation + API validation
        results = await this.apiService.generateAndValidate({
          count,
          country,
          carrier,
          preValidateOnly: false,
          progressCallback: (progress) => {
            console.log(`📈 Progress: ${progress.processed}/${progress.total} (Valid: ${progress.valid}, Invalid: ${progress.invalid})`);
            if (progressCallback) progressCallback(progress);
          }
        });
      } else {
        // Pre-validation only
        const candidates = await this.generator.generateRealisticNumbers({
          count,
          country,
          carrier,
          preValidateOnly: true
        });

        results = {
          results: candidates,
          summary: {
            generated: candidates.length,
            preValidated: candidates.length,
            apiValidated: 0,
            valid: candidates.length,
            invalid: 0
          }
        };
      }

      // Display results
      this.displayResults(results);

      // Export if requested
      if (exportResults) {
        const exported = this.exportResults(results.results, {
          format: this.config.exportFormat,
          includeMetadata: true
        });
        console.log(`💾 Results exported to memory (${exported.numbers.length} numbers)`);
        return { ...results, exported };
      }

      return results;

    } catch (error) {
      console.error(`❌ Generation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Generate numbers for specific country and carrier combinations
   * @param {Array} combinations - Array of {country, carrier, count} objects
   * @returns {Promise<Object>} Combined results
   */
  async generateBulk(combinations) {
    console.log(`🔄 Starting bulk generation for ${combinations.length} combinations...`);
    
    const allResults = [];
    let totalGenerated = 0;
    let totalValid = 0;

    for (const combo of combinations) {
      try {
        console.log(`\n📍 Processing: ${combo.country} - ${combo.carrier} (${combo.count} numbers)`);
        
        const result = await this.generateNumbers({
          count: combo.count,
          country: combo.country,
          carrier: combo.carrier,
          validateWithApi: true
        });

        allResults.push({
          combination: combo,
          ...result
        });

        totalGenerated += result.summary.processed || result.summary.generated;
        totalValid += result.summary.valid;

      } catch (error) {
        console.error(`❌ Failed for ${combo.country} - ${combo.carrier}:`, error.message);
        allResults.push({
          combination: combo,
          error: error.message,
          results: [],
          summary: { generated: 0, valid: 0, invalid: 0 }
        });
      }
    }

    console.log(`\n✅ Bulk generation complete: ${totalGenerated} generated, ${totalValid} valid`);
    return {
      combinations: allResults,
      totalSummary: {
        totalGenerated,
        totalValid,
        totalInvalid: totalGenerated - totalValid,
        combinations: combinations.length
      }
    };
  }

  /**
   * Validate existing phone numbers
   * @param {Array} phoneNumbers - Array of phone numbers to validate
   * @returns {Promise<Object>} Validation results
   */
  async validateExisting(phoneNumbers) {
    console.log(`🔍 Validating ${phoneNumbers.length} existing phone numbers...`);

    const candidates = phoneNumbers.map(number => ({
      e164: number.startsWith('+') ? number : `+${number}`,
      nationalNumber: number,
      country: 'Unknown',
      carrier: 'Unknown',
      generationMethod: 'external'
    }));

    const results = await this.apiService.validateBatch(candidates, (progress) => {
      console.log(`📈 Validation progress: ${progress.processed}/${progress.total}`);
    });

    this.displayResults(results);
    return results;
  }

  /**
   * Display formatted results
   * @param {Object} results - Results object to display
   */
  displayResults(results) {
    const { summary } = results;
    
    console.log(`\n📊 RESULTS SUMMARY`);
    console.log(`================`);
    console.log(`📱 Total Generated: ${summary.generated || summary.processed || 0}`);
    console.log(`✅ Valid Numbers: ${summary.valid || 0}`);
    console.log(`❌ Invalid Numbers: ${summary.invalid || 0}`);
    
    if (summary.cacheHits > 0) {
      console.log(`💾 Cache Hits: ${summary.cacheHits}`);
    }
    
    if (summary.quotaExhausted) {
      console.log(`⚠️  API Quota Exhausted`);
    }

    // Show sample valid numbers
    const validNumbers = results.results.filter(r => r.valid);
    if (validNumbers.length > 0) {
      console.log(`\n📞 Sample Valid Numbers:`);
      validNumbers.slice(0, 5).forEach(number => {
        console.log(`   ${number.e164} (${number.country} - ${number.carrier})`);
      });
      
      if (validNumbers.length > 5) {
        console.log(`   ... and ${validNumbers.length - 5} more`);
      }
    }
  }

  /**
   * Export results in various formats
   * @param {Array} results - Results to export
   * @param {Object} options - Export options
   * @returns {Object} Exported data
   */
  exportResults(results, options = {}) {
    const {
      format = 'json',
      includeMetadata = true,
      onlyValid = false
    } = options;

    const filteredResults = onlyValid ? results.filter(r => r.valid) : results;
    
    switch (format) {
      case 'json':
        return this.apiService.exportResults(filteredResults);
      
      case 'csv':
        return this.exportToCsv(filteredResults);
      
      case 'txt':
        return this.exportToText(filteredResults);
      
      default:
        return this.apiService.exportResults(filteredResults);
    }
  }

  /**
   * Export results to CSV format
   * @param {Array} results - Results to export
   * @returns {Object} CSV export object
   */
  exportToCsv(results) {
    const headers = [
      'E164', 'National', 'Country', 'Carrier', 'Valid', 
      'LineType', 'Location', 'PreValidated', 'APIValidated'
    ];
    
    const rows = results.map(r => [
      r.e164,
      r.nationalNumber,
      r.country,
      r.carrier,
      r.valid,
      r.lineType || '',
      r.location || '',
      r.preValidated,
      r.apiValidated
    ]);

    return {
      format: 'csv',
      headers,
      rows,
      csv: [headers, ...rows].map(row => row.join(',')).join('\n')
    };
  }

  /**
   * Export results to text format
   * @param {Array} results - Results to export
   * @returns {Object} Text export object
   */
  exportToText(results) {
    const validNumbers = results.filter(r => r.valid);
    const text = validNumbers.map(r => r.e164).join('\n');
    
    return {
      format: 'txt',
      count: validNumbers.length,
      text
    };
  }

  /**
   * Get available countries and carriers
   * @returns {Object} Available options
   */
  getAvailableOptions() {
    const countries = Object.keys(enhancedPhoneData);
    const carriersByCountry = {};
    
    countries.forEach(country => {
      carriersByCountry[country] = Object.keys(enhancedPhoneData[country].carriers);
    });

    return {
      countries,
      carriersByCountry,
      totalCountries: countries.length,
      totalCarriers: Object.values(carriersByCountry)
        .reduce((sum, carriers) => sum + carriers.length, 0)
    };
  }

  /**
   * Get system statistics
   * @returns {Object} System statistics
   */
  getStats() {
    return {
      apiService: this.apiService.getStats(),
      generator: this.generator.getStats(),
      availableOptions: this.getAvailableOptions()
    };
  }

  /**
   * Reset all caches and statistics
   */
  reset() {
    this.apiService.reset();
    this.generator.clearCaches();
    console.log('🔄 System reset complete');
  }
}

// Example usage and testing
async function runExamples(apiKey) {
  console.log('🎯 PHONE NUMBER SYSTEM - MERGED SOLUTION DEMO\n');
  
  const system = new PhoneNumberSystem(apiKey, {
    rateLimit: 50, // 50 requests per minute
    maxRetries: 2
  });

  try {
    // Example 1: Generate random numbers with API validation
    console.log('📱 Example 1: Generate 5 random numbers with API validation');
    const result1 = await system.generateNumbers({
      count: 5,
      validateWithApi: true,
      exportResults: false
    });

    // Example 2: Generate Caribbean numbers only (pre-validation only)
    console.log('\n🏝️  Example 2: Generate 3 Caribbean numbers (pre-validation only)');
    const result2 = await system.generateNumbers({
      count: 3,
      country: 'Trinidad and Tobago',
      validateWithApi: false
    });

    // Example 3: Bulk generation
    console.log('\n🔄 Example 3: Bulk generation for multiple countries');
    const bulkResult = await system.generateBulk([
      { country: 'Australia', carrier: 'Telstra', count: 2 },
      { country: 'New Zealand', carrier: 'Spark', count: 2 },
      { country: 'Aruba', carrier: 'Setar', count: 2 }
    ]);

    // Show statistics
    console.log('\n📊 System Statistics:');
    console.log(JSON.stringify(system.getStats(), null, 2));

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Export for use as module
module.exports = { 
  PhoneNumberSystem,
  EnhancedApiService,
  SmartPhoneGenerator,
  enhancedPhoneData,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  const apiKey = process.env.NUMVERIFY_API_KEY || 'your-api-key-here';
  if (apiKey === 'your-api-key-here') {
    console.log('⚠️  Please set NUMVERIFY_API_KEY environment variable or update the apiKey in main.js');
    console.log('💡 You can still run pre-validation examples without an API key');
  }
  runExamples(apiKey);
}