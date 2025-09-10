// Adaptive Learning System - Improves Prefixes Based on API Results
// This system learns from API validation results and continuously improves prefix accuracy

const fs = require('fs').promises;
const path = require('path');

class AdaptiveLearningService {
  constructor() {
    this.learningData = new Map(); // prefix -> learning metrics
    this.carrierPerformance = new Map(); // carrier -> performance metrics
    this.countryPatterns = new Map(); // country -> discovered patterns
    this.adaptiveRules = new Map(); // learned rules for generation
    this.learningHistory = [];
    this.confidenceThreshold = 0.7; // 70% confidence required
    this.minSampleSize = 10; // Minimum samples before trusting data
  }

  /**
   * Learn from API validation results
   * @param {Array} validationResults - Results from API validation
   * @returns {Promise<Object>} Learning insights
   */
  async learnFromValidationResults(validationResults) {
    console.log(`🧠 Learning from ${validationResults.length} validation results...`);
    
    const insights = {
      totalProcessed: validationResults.length,
      newPrefixesLearned: 0,
      improvedCarriers: 0,
      newPatterns: 0,
      learningUpdates: []
    };

    for (const result of validationResults) {
      if (!result.e164 || !result.country) continue;

      // Extract learning data
      const learningData = this.extractLearningData(result);
      
      // Update prefix performance
      const prefixUpdate = await this.updatePrefixPerformance(learningData);
      if (prefixUpdate.isNew) insights.newPrefixesLearned++;

      // Update carrier performance
      const carrierUpdate = await this.updateCarrierPerformance(learningData);
      if (carrierUpdate.improved) insights.improvedCarriers++;

      // Learn patterns
      const patternUpdate = await this.learnPatterns(learningData);
      if (patternUpdate.isNew) insights.newPatterns++;

      // Record learning update
      insights.learningUpdates.push({
        country: result.country,
        carrier: result.carrier,
        prefix: learningData.prefix,
        valid: result.valid,
        confidence: this.calculateConfidence(learningData.prefix)
      });
    }

    // Save learning data
    await this.saveLearningData();
    
    console.log(`📊 Learning complete: ${insights.newPrefixesLearned} new prefixes, ${insights.improvedCarriers} improved carriers`);
    return insights;
  }

  /**
   * Extract learning data from validation result
   * @param {Object} result - Validation result
   * @returns {Object} Extracted learning data
   */
  extractLearningData(result) {
    const nationalNumber = result.nationalNumber || result.e164.replace(/^\+\d{1,4}/, '');
    const prefix = this.extractPrefix(nationalNumber, result.country);
    
    return {
      country: result.country,
      carrier: result.carrier,
      prefix,
      nationalNumber,
      e164: result.e164,
      valid: result.valid,
      apiCarrier: result.carrier, // Carrier reported by API
      lineType: result.lineType,
      location: result.location,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update prefix performance metrics
   * @param {Object} learningData - Learning data from validation
   * @returns {Promise<Object>} Update results
   */
  async updatePrefixPerformance(learningData) {
    const prefixKey = `${learningData.country}_${learningData.prefix}`;
    
    if (!this.learningData.has(prefixKey)) {
      this.learningData.set(prefixKey, {
        prefix: learningData.prefix,
        country: learningData.country,
        attempts: 0,
        successes: 0,
        failures: 0,
        successRate: 0,
        confidence: 0,
        carriers: new Set(),
        firstSeen: learningData.timestamp,
        lastSeen: learningData.timestamp,
        apiCarriers: new Set() // Carriers reported by API
      });
    }

    const prefixData = this.learningData.get(prefixKey);
    
    // Update metrics
    prefixData.attempts++;
    prefixData.lastSeen = learningData.timestamp;
    
    if (learningData.valid) {
      prefixData.successes++;
      prefixData.carriers.add(learningData.carrier);
      if (learningData.apiCarrier) {
        prefixData.apiCarriers.add(learningData.apiCarrier);
      }
    } else {
      prefixData.failures++;
    }

    // Calculate success rate and confidence
    prefixData.successRate = (prefixData.successes / prefixData.attempts * 100).toFixed(1);
    prefixData.confidence = this.calculateConfidence(prefixData);

    const isNew = prefixData.attempts === 1;
    const isHighConfidence = prefixData.confidence >= this.confidenceThreshold && 
                            prefixData.attempts >= this.minSampleSize;

    return {
      isNew,
      isHighConfidence,
      successRate: prefixData.successRate,
      confidence: prefixData.confidence,
      prefixData
    };
  }

  /**
   * Calculate confidence score for prefix
   * @param {Object} prefixData - Prefix performance data
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(prefixData) {
    if (prefixData.attempts < this.minSampleSize) {
      return 0; // Not enough data
    }

    const successRate = prefixData.successes / prefixData.attempts;
    const sampleWeight = Math.min(1, prefixData.attempts / 50); // More samples = higher confidence
    
    return successRate * sampleWeight;
  }

  /**
   * Update carrier performance metrics
   * @param {Object} learningData - Learning data
   * @returns {Promise<Object>} Carrier update results
   */
  async updateCarrierPerformance(learningData) {
    const carrierKey = `${learningData.country}_${learningData.carrier}`;
    
    if (!this.carrierPerformance.has(carrierKey)) {
      this.carrierPerformance.set(carrierKey, {
        country: learningData.country,
        carrier: learningData.carrier,
        totalAttempts: 0,
        validNumbers: 0,
        invalidNumbers: 0,
        successRate: 0,
        validPrefixes: new Set(),
        invalidPrefixes: new Set(),
        apiCarrierMatches: 0, // When API carrier matches our carrier
        firstSeen: learningData.timestamp
      });
    }

    const carrierData = this.carrierPerformance.get(carrierKey);
    
    // Update metrics
    carrierData.totalAttempts++;
    carrierData.lastSeen = learningData.timestamp;

    if (learningData.valid) {
      carrierData.validNumbers++;
      carrierData.validPrefixes.add(learningData.prefix);
      
      // Check if API carrier matches our assigned carrier
      if (learningData.apiCarrier && 
          learningData.apiCarrier.toLowerCase().includes(learningData.carrier.toLowerCase())) {
        carrierData.apiCarrierMatches++;
      }
    } else {
      carrierData.invalidNumbers++;
      carrierData.invalidPrefixes.add(learningData.prefix);
    }

    carrierData.successRate = (carrierData.validNumbers / carrierData.totalAttempts * 100).toFixed(1);
    
    const previousSuccessRate = parseFloat(carrierData.successRate) - 
      (learningData.valid ? 100 : 0) / carrierData.totalAttempts;
    
    const improved = parseFloat(carrierData.successRate) > previousSuccessRate;

    return {
      improved,
      successRate: carrierData.successRate,
      carrierData
    };
  }

  /**
   * Learn new patterns from successful validations
   * @param {Object} learningData - Learning data
   * @returns {Promise<Object>} Pattern learning results
   */
  async learnPatterns(learningData) {
    if (!learningData.valid) return { isNew: false };

    const country = learningData.country;
    const nationalNumber = learningData.nationalNumber;

    if (!this.countryPatterns.has(country)) {
      this.countryPatterns.set(country, {
        discoveredPatterns: new Set(),
        prefixDistribution: new Map(),
        lengthDistribution: new Map(),
        commonSuffixes: new Map()
      });
    }

    const patterns = this.countryPatterns.get(country);

    // Learn prefix distribution
    const prefix = learningData.prefix;
    patterns.prefixDistribution.set(prefix, 
      (patterns.prefixDistribution.get(prefix) || 0) + 1);

    // Learn length patterns
    const length = nationalNumber.length;
    patterns.lengthDistribution.set(length,
      (patterns.lengthDistribution.get(length) || 0) + 1);

    // Learn common suffixes
    const suffix = nationalNumber.slice(-3); // Last 3 digits
    patterns.commonSuffixes.set(suffix,
      (patterns.commonSuffixes.get(suffix) || 0) + 1);

    // Generate new pattern if we have enough data
    const isNew = this.generateNewPattern(country, patterns);

    return { isNew, patterns };
  }

  /**
   * Generate improved prefixes based on learning
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {Array} Improved prefixes
   */
  generateImprovedPrefixes(country, carrier) {
    const carrierKey = `${country}_${carrier}`;
    const carrierData = this.carrierPerformance.get(carrierKey);
    
    if (!carrierData) return [];

    // Get high-confidence prefixes
    const highConfidencePrefixes = Array.from(carrierData.validPrefixes)
      .filter(prefix => {
        const prefixKey = `${country}_${prefix}`;
        const prefixData = this.learningData.get(prefixKey);
        return prefixData && prefixData.confidence >= this.confidenceThreshold;
      });

    console.log(`🎯 Generated ${highConfidencePrefixes.length} high-confidence prefixes for ${country} ${carrier}`);
    return highConfidencePrefixes;
  }

  /**
   * Get adaptive generation recommendations
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {Object} Generation recommendations
   */
  getAdaptiveRecommendations(country, carrier) {
    const improvedPrefixes = this.generateImprovedPrefixes(country, carrier);
    const carrierKey = `${country}_${carrier}`;
    const carrierData = this.carrierPerformance.get(carrierKey);
    const patterns = this.countryPatterns.get(country);

    return {
      recommendedPrefixes: improvedPrefixes,
      prefixWeights: this.calculatePrefixWeights(improvedPrefixes, country),
      carrierSuccessRate: carrierData?.successRate || 0,
      recommendedLength: this.getRecommendedLength(patterns),
      avoidPrefixes: this.getAvoidPrefixes(country, carrier),
      confidence: this.getOverallConfidence(country, carrier)
    };
  }

  /**
   * Calculate prefix weights based on success rates
   * @param {Array} prefixes - Array of prefixes
   * @param {string} country - Country name
   * @returns {Object} Prefix weights
   */
  calculatePrefixWeights(prefixes, country) {
    const weights = {};
    
    prefixes.forEach(prefix => {
      const prefixKey = `${country}_${prefix}`;
      const prefixData = this.learningData.get(prefixKey);
      
      if (prefixData) {
        // Weight based on success rate and confidence
        weights[prefix] = prefixData.confidence * (parseFloat(prefixData.successRate) / 100);
      } else {
        weights[prefix] = 0.1; // Default low weight for unknown prefixes
      }
    });

    return weights;
  }

  /**
   * Get prefixes to avoid based on poor performance
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {Array} Prefixes to avoid
   */
  getAvoidPrefixes(country, carrier) {
    const carrierKey = `${country}_${carrier}`;
    const carrierData = this.carrierPerformance.get(carrierKey);
    
    if (!carrierData) return [];

    // Return prefixes with consistently poor performance
    return Array.from(carrierData.invalidPrefixes)
      .filter(prefix => {
        const prefixKey = `${country}_${prefix}`;
        const prefixData = this.learningData.get(prefixKey);
        return prefixData && 
               prefixData.attempts >= this.minSampleSize && 
               parseFloat(prefixData.successRate) < 20; // Less than 20% success rate
      });
  }

  /**
   * Save learning data to file
   * @returns {Promise<void>}
   */
  async saveLearningData() {
    try {
      const learningData = {
        timestamp: new Date().toISOString(),
        learningData: this.mapToObject(this.learningData),
        carrierPerformance: this.mapToObject(this.carrierPerformance),
        countryPatterns: this.mapToObject(this.countryPatterns),
        adaptiveRules: this.mapToObject(this.adaptiveRules),
        learningHistory: this.learningHistory.slice(-100), // Keep last 100 entries
        metadata: {
          confidenceThreshold: this.confidenceThreshold,
          minSampleSize: this.minSampleSize,
          totalLearningEntries: this.learningData.size
        }
      };

      const filePath = path.join(process.cwd(), 'adaptive_learning_data.json');
      await fs.writeFile(filePath, JSON.stringify(learningData, null, 2));
      
      console.log(`💾 Learning data saved (${this.learningData.size} prefix entries)`);
    } catch (error) {
      console.error('Failed to save learning data:', error.message);
    }
  }

  /**
   * Load previous learning data
   * @returns {Promise<void>}
   */
  async loadLearningData() {
    try {
      const filePath = path.join(process.cwd(), 'adaptive_learning_data.json');
      const data = await fs.readFile(filePath, 'utf8');
      const learningData = JSON.parse(data);
      
      this.learningData = this.objectToMap(learningData.learningData);
      this.carrierPerformance = this.objectToMap(learningData.carrierPerformance);
      this.countryPatterns = this.objectToMap(learningData.countryPatterns);
      this.adaptiveRules = this.objectToMap(learningData.adaptiveRules);
      this.learningHistory = learningData.learningHistory || [];
      
      if (learningData.metadata) {
        this.confidenceThreshold = learningData.metadata.confidenceThreshold || 0.7;
        this.minSampleSize = learningData.metadata.minSampleSize || 10;
      }
      
      console.log(`📂 Loaded learning data (${this.learningData.size} prefix entries)`);
    } catch (error) {
      console.log('📂 No previous learning data found, starting fresh');
    }
  }

  /**
   * Generate learning-optimized phone number
   * @param {string} country - Country name
   * @param {string} carrier - Carrier name
   * @returns {Object} Optimized phone number or null
   */
  generateOptimizedNumber(country, carrier) {
    const recommendations = this.getAdaptiveRecommendations(country, carrier);
    
    if (recommendations.recommendedPrefixes.length === 0) {
      return null; // No learned data available
    }

    // Use weighted selection of prefixes
    const selectedPrefix = this.selectWeightedPrefix(
      recommendations.recommendedPrefixes, 
      recommendations.prefixWeights
    );

    if (!selectedPrefix) return null;

    // Generate number using learned patterns
    const { enhancedPhoneData } = require('../data/enhancedPhoneData');
    const countryData = enhancedPhoneData[country];
    
    if (!countryData) return null;

    const remainingLength = countryData.phone_length - selectedPrefix.length;
    const suffix = this.generateOptimizedSuffix(remainingLength, country);
    const nationalNumber = selectedPrefix + suffix;
    
    const countryCode = Array.isArray(countryData.country_code) 
      ? countryData.country_code[0] 
      : countryData.country_code;

    return {
      nationalNumber,
      e164: `${countryCode}${nationalNumber}`,
      prefix: selectedPrefix,
      country,
      carrier,
      generationMethod: 'adaptive_learning',
      confidence: recommendations.confidence,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Select prefix using weighted probability
   * @param {Array} prefixes - Available prefixes
   * @param {Object} weights - Prefix weights
   * @returns {string} Selected prefix
   */
  selectWeightedPrefix(prefixes, weights) {
    if (prefixes.length === 0) return null;

    // Calculate total weight
    const totalWeight = prefixes.reduce((sum, prefix) => sum + (weights[prefix] || 0), 0);
    
    if (totalWeight === 0) {
      // Fallback to random selection
      return prefixes[Math.floor(Math.random() * prefixes.length)];
    }

    // Weighted random selection
    let random = Math.random() * totalWeight;
    
    for (const prefix of prefixes) {
      random -= (weights[prefix] || 0);
      if (random <= 0) {
        return prefix;
      }
    }

    return prefixes[0]; // Fallback
  }

  /**
   * Generate optimized suffix based on learned patterns
   * @param {number} length - Required suffix length
   * @param {string} country - Country name
   * @returns {string} Optimized suffix
   */
  generateOptimizedSuffix(length, country) {
    const patterns = this.countryPatterns.get(country);
    
    if (!patterns || patterns.commonSuffixes.size === 0) {
      // Fallback to random generation
      return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    }

    // Use learned suffix patterns
    const commonSuffixes = Array.from(patterns.commonSuffixes.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .slice(0, 10); // Top 10 most common

    if (commonSuffixes.length > 0 && length >= 3) {
      const [commonSuffix] = commonSuffixes[Math.floor(Math.random() * commonSuffixes.length)];
      const prefix = this.generateRandomDigits(length - 3);
      return prefix + commonSuffix;
    }

    return this.generateRandomDigits(length);
  }

  /**
   * Get learning statistics
   * @returns {Object} Comprehensive learning statistics
   */
  getLearningStats() {
    const stats = {
      totalPrefixesLearned: this.learningData.size,
      totalCarriersTracked: this.carrierPerformance.size,
      totalCountriesWithPatterns: this.countryPatterns.size,
      highConfidencePrefixes: 0,
      averageSuccessRate: 0,
      topPerformingCarriers: [],
      recentLearning: this.learningHistory.slice(-10)
    };

    // Count high confidence prefixes
    this.learningData.forEach(prefixData => {
      if (prefixData.confidence >= this.confidenceThreshold) {
        stats.highConfidencePrefixes++;
      }
    });

    // Calculate average success rate
    const successRates = Array.from(this.learningData.values())
      .map(data => parseFloat(data.successRate));
    
    stats.averageSuccessRate = successRates.length > 0 
      ? (successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length).toFixed(1)
      : 0;

    // Top performing carriers
    stats.topPerformingCarriers = Array.from(this.carrierPerformance.entries())
      .map(([key, data]) => ({
        carrier: `${data.country} - ${data.carrier}`,
        successRate: data.successRate,
        totalAttempts: data.totalAttempts,
        validPrefixes: data.validPrefixes.size
      }))
      .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate))
      .slice(0, 10);

    return stats;
  }

  // Helper methods
  extractPrefix(nationalNumber, country) {
    if (country === 'Australia' || country === 'New Zealand') {
      return nationalNumber.substring(0, 3);
    } else if (country.includes('Trinidad') || country.includes('Dominican')) {
      return nationalNumber.substring(0, 3);
    } else {
      return nationalNumber.substring(0, Math.min(4, nationalNumber.length));
    }
  }

  generateRandomDigits(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
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
    Object.entries(obj || {}).forEach(([key, value]) => {
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

module.exports = { AdaptiveLearningService };