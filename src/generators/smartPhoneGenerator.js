// Smart Phone Number Generator - Merged Solution
// Combines approaches from original code, Claude Opus, and GPT-5

const { parsePhoneNumber, isValidPhoneNumber, isPossiblePhoneNumber } = require('libphonenumber-js');
const { enhancedPhoneData } = require('../data/enhancedPhoneData');

class SmartPhoneGenerator {
  constructor() {
    this.generatedNumbers = new Set(); // Deduplication cache
    this.validationCache = new Map(); // Cache for API results
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in ms
  }

  /**
   * Generate realistic phone numbers with multi-stage validation
   * @param {Object} options - Generation options
   * @returns {Array} Array of validated phone number objects
   */
  async generateRealisticNumbers(options = {}) {
    const {
      count = 10,
      country = null,
      carrier = null,
      preValidateOnly = false,
      maxAttempts = count * 3 // Prevent infinite loops
    } = options;

    const results = [];
    let attempts = 0;

    while (results.length < count && attempts < maxAttempts) {
      attempts++;

      try {
        // Stage 1: Generate candidate number
        const candidate = this.generateCandidateNumber(country, carrier);
        
        if (!candidate) continue;

        // Stage 2: Check for duplicates
        const e164 = candidate.e164;
        if (this.generatedNumbers.has(e164)) {
          continue; // Skip duplicates
        }

        // Stage 3: Offline validation with libphonenumber
        if (!this.validateOffline(candidate)) {
          continue; // Skip invalid patterns
        }

        // Stage 4: Pattern and format validation
        if (!this.validateRealisticPatterns(candidate)) {
          continue; // Skip unrealistic numbers
        }

        // Add to dedup cache
        this.generatedNumbers.add(e164);

        // If only pre-validation requested, add to results
        if (preValidateOnly) {
          results.push({
            ...candidate,
            preValidated: true,
            apiValidated: false
          });
        } else {
          // Stage 5: API validation would go here
          results.push({
            ...candidate,
            preValidated: true,
            apiValidated: null // To be validated by API
          });
        }

      } catch (error) {
        console.error(`Generation attempt ${attempts} failed:`, error.message);
        continue;
      }
    }

    console.log(`Generated ${results.length} realistic numbers in ${attempts} attempts (${((results.length/attempts) * 100).toFixed(1)}% success rate)`);
    return results;
  }

  /**
   * Generate a candidate phone number using enhanced patterns
   * @param {string} country - Specific country or null for random
   * @param {string} carrier - Specific carrier or null for random
   * @returns {Object} Candidate phone number object
   */
  generateCandidateNumber(country = null, carrier = null) {
    // Select country
    const countries = Object.keys(enhancedPhoneData);
    const selectedCountry = country || countries[Math.floor(Math.random() * countries.length)];
    
    if (!enhancedPhoneData[selectedCountry]) {
      throw new Error(`Country "${selectedCountry}" not found in enhanced data`);
    }

    const countryData = enhancedPhoneData[selectedCountry];
    
    // Select carrier
    const carriers = Object.keys(countryData.carriers);
    const selectedCarrier = carrier || carriers[Math.floor(Math.random() * carriers.length)];
    
    if (!countryData.carriers[selectedCarrier]) {
      throw new Error(`Carrier "${selectedCarrier}" not found for ${selectedCountry}`);
    }

    const carrierData = countryData.carriers[selectedCarrier];

    // Generate number using realistic patterns
    const phoneNumber = this.generateRealisticNumber(countryData, carrierData, selectedCountry);
    
    return {
      country: selectedCountry,
      carrier: selectedCarrier,
      iso2: countryData.iso2,
      countryCode: Array.isArray(countryData.country_code) 
        ? countryData.country_code[0] 
        : countryData.country_code,
      nationalNumber: phoneNumber.national,
      e164: phoneNumber.e164,
      pattern: carrierData.number_pattern,
      generationMethod: 'smart_realistic',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate realistic number based on country and carrier patterns
   * @param {Object} countryData - Country configuration
   * @param {Object} carrierData - Carrier configuration  
   * @param {string} countryName - Country name
   * @returns {Object} Generated phone number with national and E164 formats
   */
  generateRealisticNumber(countryData, carrierData, countryName) {
    const prefixes = carrierData.prefixes.filter(p => p !== ""); // Remove empty prefixes
    
    if (prefixes.length === 0) {
      throw new Error(`No valid prefixes for carrier in ${countryName}`);
    }

    // Select weighted random prefix (could implement carrier market share weighting)
    const selectedPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // Generate remaining digits based on country-specific logic
    let nationalNumber;
    
    if (countryName === "Dominican Republic") {
      // Special case: Dominican Republic uses area codes
      const areaCodes = countryData.country_code;
      const selectedAreaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
      
      // Generate 7-digit local number starting with selected prefix
      const localNumber = this.generateRealisticSuffix(7, selectedPrefix, countryData);
      nationalNumber = localNumber;
      
      return {
        national: nationalNumber,
        e164: `${selectedAreaCode}${nationalNumber}`
      };
    } else if (countryData.country_code.startsWith('+1')) {
      // Caribbean/NANP countries
      const totalLength = countryData.phone_length;
      const remainingLength = totalLength - selectedPrefix.length;
      
      if (remainingLength <= 0) {
        console.warn(`Prefix ${selectedPrefix} too long for ${countryName}, using fallback`);
        // Fallback: use first digit of prefix and generate rest
        const firstDigit = selectedPrefix[0];
        const suffix = this.generateRealisticSuffix(totalLength - 1, firstDigit, countryData);
        nationalNumber = firstDigit + suffix;
      } else {
        const suffix = this.generateRealisticSuffix(remainingLength, selectedPrefix, countryData);
        nationalNumber = selectedPrefix + suffix;
      }
      
      return {
        national: nationalNumber,
        e164: `${countryData.country_code}${nationalNumber}`
      };
    } else {
      // Standard mobile number generation
      const totalLength = countryData.phone_length;
      const remainingLength = totalLength - selectedPrefix.length;
      
      if (remainingLength <= 0) {
        throw new Error(`Prefix too long for country ${countryName}`);
      }
      
      const suffix = this.generateRealisticSuffix(remainingLength, selectedPrefix, countryData);
      nationalNumber = selectedPrefix + suffix;
      
      const countryCode = Array.isArray(countryData.country_code) 
        ? countryData.country_code[0] 
        : countryData.country_code;
      
      return {
        national: nationalNumber,
        e164: `${countryCode}${nationalNumber}`
      };
    }
  }

  /**
   * Generate realistic suffix avoiding common patterns
   * @param {number} length - Length of suffix to generate
   * @param {string} prefix - Prefix for context-aware generation
   * @param {Object} countryData - Country data for forbidden patterns
   * @returns {string} Generated suffix
   */
  generateRealisticSuffix(length, prefix, countryData) {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
      let suffix = '';
      
      // Generate digits with some realistic patterns
      for (let i = 0; i < length; i++) {
        if (i === 0 && length > 3) {
          // First digit: avoid 0 and 1 for mobile numbers
          suffix += Math.floor(Math.random() * 8) + 2; // 2-9
        } else if (i === length - 1) {
          // Last digit: avoid 0 for better realism
          suffix += Math.floor(Math.random() * 9) + 1; // 1-9
        } else {
          suffix += Math.floor(Math.random() * 10); // 0-9
        }
      }
      
      // Check against forbidden patterns
      if (!this.containsForbiddenPattern(suffix, countryData.forbidden_patterns)) {
        return suffix;
      }
      
      attempts++;
    }
    
    // Fallback: generate simple random if all attempts failed
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }

  /**
   * Check if number contains forbidden patterns
   * @param {string} number - Number to check
   * @param {Array} forbiddenPatterns - Array of forbidden patterns
   * @returns {boolean} True if contains forbidden pattern
   */
  containsForbiddenPattern(number, forbiddenPatterns = []) {
    return forbiddenPatterns.some(pattern => {
      if (pattern.length <= number.length) {
        return number.includes(pattern);
      }
      return false;
    });
  }

  /**
   * Offline validation using libphonenumber
   * @param {Object} candidate - Candidate phone number object
   * @returns {boolean} True if valid
   */
  validateOffline(candidate) {
    try {
      // Parse the number
      const phoneNumber = parsePhoneNumber(candidate.e164);
      
      if (!phoneNumber) {
        return false;
      }

      // Check if it's a possible number
      if (!isPossiblePhoneNumber(candidate.e164)) {
        return false;
      }

      // Check if it's a valid number
      if (!isValidPhoneNumber(candidate.e164)) {
        return false;
      }

      // Check if it's a mobile number
      if (phoneNumber.getType() !== 'MOBILE') {
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Offline validation failed for ${candidate.e164}:`, error.message);
      return false;
    }
  }

  /**
   * Validate against realistic patterns and business rules
   * @param {Object} candidate - Candidate phone number object
   * @returns {boolean} True if passes realistic validation
   */
  validateRealisticPatterns(candidate) {
    const countryData = enhancedPhoneData[candidate.country];
    
    if (!countryData) return false;

    // Check against country mobile patterns
    const mobilePatterns = countryData.mobile_patterns || [];
    const nationalNumber = candidate.nationalNumber;
    
    if (mobilePatterns.length > 0) {
      const matchesPattern = mobilePatterns.some(pattern => {
        const regex = new RegExp(pattern);
        return regex.test(nationalNumber);
      });
      
      if (!matchesPattern) {
        return false;
      }
    }

    // Check service ranges (avoid emergency numbers, etc.)
    const serviceRanges = countryData.service_ranges || [];
    const startsWithService = serviceRanges.some(service => 
      nationalNumber.startsWith(service)
    );
    
    if (startsWithService) {
      return false;
    }

    // Additional business logic checks
    if (this.isObviouslyFake(nationalNumber)) {
      return false;
    }

    return true;
  }

  /**
   * Check for obviously fake patterns
   * @param {string} number - Phone number to check
   * @returns {boolean} True if obviously fake
   */
  isObviouslyFake(number) {
    // Check for repeated digits
    if (/(\d)\1{4,}/.test(number)) {
      return true; // 5+ consecutive identical digits
    }

    // Check for ascending/descending sequences
    if (/01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321|43210/.test(number)) {
      return true;
    }

    // Check for common fake patterns
    const fakePatterns = [
      '1234567890', '0987654321', '1111111111', '0000000000',
      '5555555555', '1234567', '7654321'
    ];
    
    return fakePatterns.some(pattern => number.includes(pattern));
  }

  /**
   * Get generation statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalGenerated: this.generatedNumbers.size,
      cacheSize: this.validationCache.size,
      countries: Object.keys(enhancedPhoneData).length,
      totalCarriers: Object.values(enhancedPhoneData)
        .reduce((sum, country) => sum + Object.keys(country.carriers).length, 0)
    };
  }

  /**
   * Clear caches
   */
  clearCaches() {
    this.generatedNumbers.clear();
    this.validationCache.clear();
  }
}

module.exports = { SmartPhoneGenerator };