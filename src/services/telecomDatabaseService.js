// Telecom Database Integration Service
// Integrates with official telecom databases and libphonenumber metadata

const { getExampleNumber, parsePhoneNumber, getCountryCallingCode } = require('libphonenumber-js');
const { PhoneNumber } = require('awesome-phonenumber');

class TelecomDatabaseService {
  constructor() {
    this.officialSources = new Map();
    this.metadataCache = new Map();
    this.lastUpdate = null;
  }

  /**
   * Get official mobile patterns from libphonenumber metadata
   * @param {string} countryISO2 - Country ISO2 code (AU, US, etc.)
   * @returns {Object} Official mobile patterns and metadata
   */
  getOfficialMobilePatterns(countryISO2) {
    try {
      console.log(`📡 Fetching official patterns for ${countryISO2}...`);
      
      // Get example mobile number from libphonenumber
      const exampleNumber = getExampleNumber(countryISO2, 'mobile');
      
      if (!exampleNumber) {
        console.warn(`⚠️ No official mobile example for ${countryISO2}`);
        return null;
      }

      // Parse the example to understand the pattern
      const parsed = parsePhoneNumber(exampleNumber.number, countryISO2);
      
      // Extract pattern information
      const pattern = {
        countryCode: `+${getCountryCallingCode(countryISO2)}`,
        nationalNumber: parsed.nationalNumber,
        mobilePrefix: this.extractMobilePrefix(parsed.nationalNumber, countryISO2),
        totalLength: parsed.nationalNumber.length,
        exampleNumber: parsed.number,
        internationalFormat: parsed.formatInternational(),
        nationalFormat: parsed.formatNational(),
        source: 'libphonenumber-official'
      };

      console.log(`✅ Official pattern for ${countryISO2}:`, pattern);
      return pattern;

    } catch (error) {
      console.error(`❌ Failed to get official pattern for ${countryISO2}:`, error.message);
      return null;
    }
  }

  /**
   * Extract mobile prefix from official example
   * @param {string} nationalNumber - National number from libphonenumber
   * @param {string} countryISO2 - Country ISO2 code
   * @returns {string} Extracted mobile prefix
   */
  extractMobilePrefix(nationalNumber, countryISO2) {
    // Country-specific prefix extraction based on official patterns
    switch (countryISO2) {
      case 'AU': // Australia - mobile starts with 4
        return nationalNumber.substring(0, 3); // 4XX
      case 'NZ': // New Zealand - mobile starts with 2
        return nationalNumber.substring(0, 2); // 2X
      case 'GB': // UK - mobile starts with 7
        return nationalNumber.substring(0, 4); // 7XXX
      case 'NL': // Netherlands - mobile starts with 6
        return nationalNumber.substring(0, 2); // 6X
      case 'MY': // Malaysia - mobile starts with 1
        return nationalNumber.substring(0, 3); // 1XX
      default:
        // Generic: take first 2-3 digits
        return nationalNumber.substring(0, Math.min(3, nationalNumber.length));
    }
  }

  /**
   * Validate phone data against official sources
   * @param {Object} phoneData - Current phone data to validate
   * @returns {Promise<Object>} Validation report
   */
  async validateAgainstOfficialSources(phoneData) {
    console.log('🔍 Validating phone data against official telecom sources...');
    
    const validationReport = {
      totalCountries: Object.keys(phoneData).length,
      validatedCountries: 0,
      invalidCountries: 0,
      improvements: [],
      errors: []
    };

    for (const [countryName, countryData] of Object.entries(phoneData)) {
      try {
        const iso2 = countryData.iso2;
        if (!iso2) {
          validationReport.errors.push(`${countryName}: Missing ISO2 code`);
          continue;
        }

        // Get official pattern
        const officialPattern = this.getOfficialMobilePatterns(iso2);
        
        if (!officialPattern) {
          validationReport.errors.push(`${countryName}: No official pattern available`);
          validationReport.invalidCountries++;
          continue;
        }

        // Compare with current data
        const comparison = this.compareWithOfficial(countryData, officialPattern, countryName);
        
        if (comparison.needsUpdate) {
          validationReport.improvements.push({
            country: countryName,
            ...comparison
          });
        }

        validationReport.validatedCountries++;

      } catch (error) {
        validationReport.errors.push(`${countryName}: ${error.message}`);
        validationReport.invalidCountries++;
      }
    }

    console.log(`📊 Validation complete: ${validationReport.validatedCountries} validated, ${validationReport.invalidCountries} errors`);
    return validationReport;
  }

  /**
   * Compare current data with official pattern
   * @param {Object} currentData - Current country data
   * @param {Object} officialPattern - Official pattern from libphonenumber
   * @param {string} countryName - Country name
   * @returns {Object} Comparison results
   */
  compareWithOfficial(currentData, officialPattern, countryName) {
    const comparison = {
      needsUpdate: false,
      issues: [],
      suggestions: []
    };

    // Check country code
    if (currentData.country_code !== officialPattern.countryCode) {
      comparison.needsUpdate = true;
      comparison.issues.push(`Country code mismatch: ${currentData.country_code} vs ${officialPattern.countryCode}`);
      comparison.suggestions.push(`Update country_code to "${officialPattern.countryCode}"`);
    }

    // Check phone length
    if (currentData.phone_length !== officialPattern.totalLength) {
      comparison.needsUpdate = true;
      comparison.issues.push(`Phone length mismatch: ${currentData.phone_length} vs ${officialPattern.totalLength}`);
      comparison.suggestions.push(`Update phone_length to ${officialPattern.totalLength}`);
    }

    // Check mobile patterns
    const officialMobilePattern = this.generateMobilePattern(officialPattern, countryName);
    if (officialMobilePattern && !currentData.mobile_patterns?.includes(officialMobilePattern)) {
      comparison.needsUpdate = true;
      comparison.suggestions.push(`Add official mobile pattern: "${officialMobilePattern}"`);
    }

    // Check prefix alignment
    const officialPrefix = officialPattern.mobilePrefix;
    const currentPrefixes = Object.values(currentData.carriers)
      .flatMap(carrier => carrier.prefixes || []);
    
    const hasMatchingPrefix = currentPrefixes.some(prefix => 
      prefix.startsWith(officialPrefix) || officialPrefix.startsWith(prefix)
    );

    if (!hasMatchingPrefix) {
      comparison.needsUpdate = true;
      comparison.suggestions.push(`Consider adding prefixes starting with "${officialPrefix}"`);
    }

    return comparison;
  }

  /**
   * Generate mobile pattern from official data
   * @param {Object} officialPattern - Official pattern data
   * @param {string} countryName - Country name
   * @returns {string} Generated regex pattern
   */
  generateMobilePattern(officialPattern, countryName) {
    const nationalNumber = officialPattern.nationalNumber;
    const firstDigit = nationalNumber[0];
    const length = nationalNumber.length;
    
    // Generate pattern based on first digit and length
    return `^${firstDigit}[0-9]{${length-1}}$`;
  }

  /**
   * Get enhanced metadata for country using awesome-phonenumber
   * @param {string} countryISO2 - Country ISO2 code
   * @returns {Object} Enhanced metadata
   */
  getEnhancedMetadata(countryISO2) {
    try {
      // Use awesome-phonenumber for additional metadata
      const phone = new PhoneNumber('', countryISO2);
      const metadata = phone.getRegionCode();
      
      return {
        regionCode: metadata,
        supportedTypes: ['mobile', 'fixed-line'],
        source: 'awesome-phonenumber'
      };
    } catch (error) {
      console.error(`Failed to get enhanced metadata for ${countryISO2}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch from external telecom databases (placeholder for future implementation)
   * @param {string} countryISO2 - Country ISO2 code
   * @returns {Promise<Object>} External database data
   */
  async fetchFromExternalSources(countryISO2) {
    // Placeholder for integration with:
    // - ACMA (Australia)
    // - TATT (Trinidad and Tobago)
    // - FCC (USA)
    // - Ofcom (UK)
    // etc.
    
    const externalSources = {
      'AU': 'https://www.acma.gov.au/numbering', // Australian Communications and Media Authority
      'TT': 'https://tatt.org.tt/', // Telecommunications Authority of Trinidad and Tobago
      'US': 'https://www.fcc.gov/general/numbering-resources',
      'GB': 'https://www.ofcom.org.uk/phones-telecoms-and-internet/information-for-industry/numbering'
    };

    if (externalSources[countryISO2]) {
      console.log(`🌐 External source available for ${countryISO2}: ${externalSources[countryISO2]}`);
      // Future implementation: scrape or API integration
    }

    return {
      available: !!externalSources[countryISO2],
      source: externalSources[countryISO2],
      implementation: 'future'
    };
  }

  /**
   * Generate comprehensive improvement report
   * @param {Object} phoneData - Current phone data
   * @returns {Promise<Object>} Comprehensive report
   */
  async generateImprovementReport(phoneData) {
    console.log('📊 Generating comprehensive improvement report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCountries: Object.keys(phoneData).length,
        officiallyValidated: 0,
        needsImprovement: 0,
        fullyCompliant: 0
      },
      countryReports: [],
      recommendations: []
    };

    // Validate each country
    for (const [countryName, countryData] of Object.entries(phoneData)) {
      const iso2 = countryData.iso2;
      
      if (!iso2) {
        report.countryReports.push({
          country: countryName,
          status: 'error',
          issue: 'Missing ISO2 code'
        });
        continue;
      }

      // Get official patterns
      const officialPattern = this.getOfficialMobilePatterns(iso2);
      const enhancedMetadata = this.getEnhancedMetadata(iso2);
      const externalSources = await this.fetchFromExternalSources(iso2);

      // Compare with current data
      const comparison = officialPattern ? 
        this.compareWithOfficial(countryData, officialPattern, countryName) : 
        { needsUpdate: true, issues: ['No official pattern available'] };

      const countryReport = {
        country: countryName,
        iso2,
        status: comparison.needsUpdate ? 'needs-improvement' : 'compliant',
        officialPattern,
        enhancedMetadata,
        externalSources,
        comparison,
        carrierCount: Object.keys(countryData.carriers).length,
        totalPrefixes: Object.values(countryData.carriers)
          .reduce((sum, carrier) => sum + (carrier.prefixes?.length || 0), 0)
      };

      report.countryReports.push(countryReport);

      if (comparison.needsUpdate) {
        report.summary.needsImprovement++;
      } else {
        report.summary.fullyCompliant++;
      }

      if (officialPattern) {
        report.summary.officiallyValidated++;
      }
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report.countryReports);

    return report;
  }

  /**
   * Generate specific recommendations
   * @param {Array} countryReports - Array of country reports
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(countryReports) {
    const recommendations = [];

    // Find countries without official patterns
    const noOfficialPattern = countryReports.filter(r => !r.officialPattern);
    if (noOfficialPattern.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'data_quality',
        description: `${noOfficialPattern.length} countries lack official pattern validation`,
        countries: noOfficialPattern.map(r => r.country),
        action: 'Implement manual pattern verification or alternative data sources'
      });
    }

    // Find countries with low prefix counts
    const lowPrefixCount = countryReports.filter(r => r.totalPrefixes < 10);
    if (lowPrefixCount.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'prefix_expansion',
        description: `${lowPrefixCount.length} countries have insufficient prefixes`,
        countries: lowPrefixCount.map(r => r.country),
        action: 'Use prefix discovery system to find more valid prefixes'
      });
    }

    // Find countries with external source availability
    const hasExternalSources = countryReports.filter(r => r.externalSources?.available);
    if (hasExternalSources.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'future_enhancement',
        description: `${hasExternalSources.length} countries have external telecom databases available`,
        countries: hasExternalSources.map(r => r.country),
        action: 'Consider implementing API integration with official telecom authorities'
      });
    }

    return recommendations;
  }

  /**
   * Update phone data with official patterns
   * @param {Object} phoneData - Current phone data
   * @param {string} countryName - Country to update
   * @returns {Promise<Object>} Update results
   */
  async updateWithOfficialData(phoneData, countryName) {
    const countryData = phoneData[countryName];
    if (!countryData?.iso2) {
      return { updated: false, reason: 'Missing ISO2 code' };
    }

    const officialPattern = this.getOfficialMobilePatterns(countryData.iso2);
    if (!officialPattern) {
      return { updated: false, reason: 'No official pattern available' };
    }

    const updates = {};
    let hasUpdates = false;

    // Update country code if different
    if (countryData.country_code !== officialPattern.countryCode) {
      updates.country_code = officialPattern.countryCode;
      hasUpdates = true;
    }

    // Update phone length if different
    if (countryData.phone_length !== officialPattern.totalLength) {
      updates.phone_length = officialPattern.totalLength;
      hasUpdates = true;
    }

    // Add official mobile pattern if not present
    const officialMobilePattern = this.generateMobilePattern(officialPattern, countryName);
    if (officialMobilePattern && !countryData.mobile_patterns?.includes(officialMobilePattern)) {
      updates.mobile_patterns = [...(countryData.mobile_patterns || []), officialMobilePattern];
      hasUpdates = true;
    }

    // Apply updates
    if (hasUpdates) {
      Object.assign(phoneData[countryName], updates);
      phoneData[countryName].lastOfficialUpdate = new Date().toISOString();
      phoneData[countryName].officialSource = 'libphonenumber';
      
      console.log(`✅ Updated ${countryName} with official data:`, updates);
      return { updated: true, updates, officialPattern };
    }

    return { updated: false, reason: 'No updates needed' };
  }

  /**
   * Bulk update all countries with official data
   * @param {Object} phoneData - Complete phone data
   * @returns {Promise<Object>} Bulk update results
   */
  async bulkUpdateWithOfficialData(phoneData) {
    console.log('🔄 Bulk updating all countries with official telecom data...');
    
    const results = {
      totalProcessed: 0,
      successfulUpdates: 0,
      errors: 0,
      updateDetails: []
    };

    for (const countryName of Object.keys(phoneData)) {
      try {
        const updateResult = await this.updateWithOfficialData(phoneData, countryName);
        results.totalProcessed++;
        
        if (updateResult.updated) {
          results.successfulUpdates++;
        }
        
        results.updateDetails.push({
          country: countryName,
          ...updateResult
        });

      } catch (error) {
        results.errors++;
        results.updateDetails.push({
          country: countryName,
          updated: false,
          error: error.message
        });
      }
    }

    console.log(`📊 Bulk update complete: ${results.successfulUpdates}/${results.totalProcessed} countries updated`);
    return results;
  }

  /**
   * Generate enhanced phone data with official validation
   * @param {Object} currentPhoneData - Current phone data
   * @returns {Promise<Object>} Enhanced phone data
   */
  async generateEnhancedPhoneData(currentPhoneData) {
    console.log('🔧 Generating enhanced phone data with official validation...');
    
    const enhanced = JSON.parse(JSON.stringify(currentPhoneData)); // Deep copy
    
    // Add official validation to each country
    for (const [countryName, countryData] of Object.entries(enhanced)) {
      if (countryData.iso2) {
        const officialPattern = this.getOfficialMobilePatterns(countryData.iso2);
        const enhancedMetadata = this.getEnhancedMetadata(countryData.iso2);
        
        // Add official data
        enhanced[countryName].officialValidation = {
          hasOfficialPattern: !!officialPattern,
          officialPattern,
          enhancedMetadata,
          validatedAt: new Date().toISOString(),
          source: 'libphonenumber'
        };

        // Add compliance score
        enhanced[countryName].complianceScore = this.calculateComplianceScore(countryData, officialPattern);
      }
    }

    return enhanced;
  }

  /**
   * Calculate compliance score for country data
   * @param {Object} countryData - Country data
   * @param {Object} officialPattern - Official pattern (if available)
   * @returns {number} Compliance score (0-100)
   */
  calculateComplianceScore(countryData, officialPattern) {
    let score = 0;

    // Has ISO2 code (10 points)
    if (countryData.iso2) score += 10;

    // Has mobile patterns (15 points)
    if (countryData.mobile_patterns?.length > 0) score += 15;

    // Has forbidden patterns (10 points)
    if (countryData.forbidden_patterns?.length > 0) score += 10;

    // Has service ranges (5 points)
    if (countryData.service_ranges?.length > 0) score += 5;

    // Multiple carriers (10 points)
    const carrierCount = Object.keys(countryData.carriers).length;
    if (carrierCount >= 3) score += 10;
    else if (carrierCount >= 2) score += 5;

    // Sufficient prefixes (20 points)
    const totalPrefixes = Object.values(countryData.carriers)
      .reduce((sum, carrier) => sum + (carrier.prefixes?.length || 0), 0);
    if (totalPrefixes >= 20) score += 20;
    else if (totalPrefixes >= 10) score += 10;
    else if (totalPrefixes >= 5) score += 5;

    // Has realistic ranges (15 points)
    const hasRealisticRanges = Object.values(countryData.carriers)
      .some(carrier => carrier.realistic_ranges);
    if (hasRealisticRanges) score += 15;

    // Matches official pattern (15 points)
    if (officialPattern) {
      const matchesOfficial = countryData.country_code === officialPattern.countryCode &&
                             countryData.phone_length === officialPattern.totalLength;
      if (matchesOfficial) score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Get countries needing improvement based on compliance scores
   * @param {Object} phoneData - Phone data with compliance scores
   * @returns {Array} Countries needing improvement
   */
  getCountriesNeedingImprovement(phoneData) {
    return Object.entries(phoneData)
      .filter(([country, data]) => (data.complianceScore || 0) < 80)
      .map(([country, data]) => ({
        country,
        complianceScore: data.complianceScore || 0,
        issues: this.identifyIssues(data)
      }))
      .sort((a, b) => a.complianceScore - b.complianceScore);
  }

  /**
   * Identify specific issues with country data
   * @param {Object} countryData - Country data
   * @returns {Array} Array of identified issues
   */
  identifyIssues(countryData) {
    const issues = [];

    if (!countryData.iso2) issues.push('Missing ISO2 code');
    if (!countryData.mobile_patterns?.length) issues.push('Missing mobile patterns');
    if (!countryData.forbidden_patterns?.length) issues.push('Missing forbidden patterns');
    if (Object.keys(countryData.carriers).length < 2) issues.push('Insufficient carriers');
    
    const totalPrefixes = Object.values(countryData.carriers)
      .reduce((sum, carrier) => sum + (carrier.prefixes?.length || 0), 0);
    if (totalPrefixes < 10) issues.push('Insufficient prefixes');

    const hasRealisticRanges = Object.values(countryData.carriers)
      .some(carrier => carrier.realistic_ranges);
    if (!hasRealisticRanges) issues.push('Missing realistic ranges');

    return issues;
  }
}

module.exports = { TelecomDatabaseService };