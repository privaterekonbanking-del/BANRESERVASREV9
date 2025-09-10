// Integrated Intelligence Service - Combines All Three Systems
// Prefix Discovery + Telecom Database + Adaptive Learning

const { PrefixDiscoveryService } = require('./prefixDiscoveryService');
const { TelecomDatabaseService } = require('./telecomDatabaseService');
const { AdaptiveLearningService } = require('./adaptiveLearningService');

class IntegratedIntelligenceService {
  constructor(apiService) {
    this.apiService = apiService;
    this.prefixDiscovery = new PrefixDiscoveryService(apiService);
    this.telecomDatabase = new TelecomDatabaseService();
    this.adaptiveLearning = new AdaptiveLearningService();
    this.isInitialized = false;
  }

  /**
   * Initialize all intelligence services
   * @returns {Promise<void>}
   */
  async initialize() {
    console.log('🧠 Initializing Integrated Intelligence System...');
    
    try {
      // Load previous learning data
      await this.adaptiveLearning.loadLearningData();
      await this.prefixDiscovery.loadDiscoveryData();
      
      console.log('✅ Intelligence system initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('⚠️ Intelligence system initialization failed:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Generate highly optimized phone numbers using all intelligence systems
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Optimized phone numbers
   */
  async generateIntelligentNumbers(options = {}) {
    const { count = 10, country = null, carrier = null } = options;
    
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`🎯 Generating ${count} intelligent numbers for ${country || 'Random'} - ${carrier || 'Random'}`);
    
    const results = [];
    let attempts = 0;
    const maxAttempts = count * 2;

    while (results.length < count && attempts < maxAttempts) {
      attempts++;

      try {
        // Try adaptive learning first (highest accuracy)
        let candidate = this.adaptiveLearning.generateOptimizedNumber(country, carrier);
        
        // Fallback to discovery data
        if (!candidate) {
          candidate = await this.generateFromDiscoveryData(country, carrier);
        }
        
        // Fallback to telecom database patterns
        if (!candidate) {
          candidate = this.generateFromTelecomDatabase(country, carrier);
        }
        
        // Final fallback to standard generation
        if (!candidate) {
          candidate = await this.apiService.generator.generateCandidateNumber(country, carrier);
        }

        if (candidate && !this.isDuplicate(candidate.e164, results)) {
          results.push({
            ...candidate,
            intelligenceSource: this.getIntelligenceSource(candidate),
            confidence: this.calculateOverallConfidence(candidate)
          });
        }

      } catch (error) {
        console.error(`Intelligent generation attempt ${attempts} failed:`, error.message);
      }
    }

    console.log(`🧠 Intelligent generation complete: ${results.length} numbers (${((results.length/attempts)*100).toFixed(1)}% success rate)`);
    return results;
  }

  /**
   * Process API validation results to improve all systems
   * @param {Array} validationResults - Results from NumVerify API
   * @returns {Promise<Object>} Learning and improvement results
   */
  async processValidationResults(validationResults) {
    console.log(`🔄 Processing ${validationResults.length} validation results for system improvement...`);
    
    const improvements = {
      adaptiveLearning: null,
      prefixDiscovery: null,
      telecomValidation: null,
      overallImprovement: 0
    };

    try {
      // Feed results to adaptive learning system
      improvements.adaptiveLearning = await this.adaptiveLearning.learnFromValidationResults(validationResults);
      
      // Update discovery data with successful validations
      improvements.prefixDiscovery = await this.updateDiscoveryFromResults(validationResults);
      
      // Validate against official telecom data
      improvements.telecomValidation = await this.validateAgainstTelecomData(validationResults);
      
      // Calculate overall improvement
      improvements.overallImprovement = this.calculateOverallImprovement(improvements);
      
      // Save all learning data
      await this.saveAllLearningData();
      
      console.log(`📈 System improvement complete: ${improvements.overallImprovement}% overall improvement`);
      
    } catch (error) {
      console.error('❌ Failed to process validation results:', error.message);
    }

    return improvements;
  }

  /**
   * Get comprehensive intelligence report
   * @returns {Object} Complete intelligence report
   */
  getIntelligenceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      systemStatus: {
        initialized: this.isInitialized,
        adaptiveLearning: this.adaptiveLearning.getLearningStats(),
        prefixDiscovery: this.prefixDiscovery.generateDiscoveryReport(),
        telecomDatabase: {
          available: true,
          supportedCountries: ['AU', 'NZ', 'GB', 'NL', 'MY', 'IE', 'TT', 'DO'],
          lastValidation: null
        }
      },
      recommendations: this.generateSystemRecommendations(),
      performanceMetrics: this.getPerformanceMetrics()
    };

    return report;
  }

  /**
   * Generate system-wide recommendations
   * @returns {Array} System recommendations
   */
  generateSystemRecommendations() {
    const recommendations = [];
    
    const learningStats = this.adaptiveLearning.getLearningStats();
    
    // Adaptive Learning recommendations
    if (learningStats.highConfidencePrefixes < 10) {
      recommendations.push({
        system: 'adaptive_learning',
        priority: 'high',
        message: `Only ${learningStats.highConfidencePrefixes} high-confidence prefixes learned`,
        action: 'Run more API validations to build learning database'
      });
    }

    // Prefix Discovery recommendations
    if (learningStats.totalPrefixesLearned < 50) {
      recommendations.push({
        system: 'prefix_discovery',
        priority: 'medium',
        message: 'Limited prefix discovery data available',
        action: 'Run prefix discovery for key countries/carriers'
      });
    }

    // Performance recommendations
    if (parseFloat(learningStats.averageSuccessRate) < 60) {
      recommendations.push({
        system: 'overall',
        priority: 'high',
        message: `Low average success rate: ${learningStats.averageSuccessRate}%`,
        action: 'Focus on high-performing carriers and improve prefix quality'
      });
    }

    return recommendations;
  }

  /**
   * Run comprehensive system improvement
   * @param {Object} options - Improvement options
   * @returns {Promise<Object>} Improvement results
   */
  async runSystemImprovement(options = {}) {
    const {
      discoverPrefixes = true,
      validateTelecomData = true,
      updateLearning = true,
      targetCountries = null, // Specific countries to focus on
      maxApiCalls = 100 // Limit API calls for improvement
    } = options;

    console.log('🚀 Running comprehensive system improvement...');
    
    const improvementResults = {
      prefixDiscovery: null,
      telecomValidation: null,
      learningUpdates: null,
      apiCallsUsed: 0,
      overallImprovement: 0
    };

    try {
      // 1. Prefix Discovery
      if (discoverPrefixes) {
        console.log('🔍 Phase 1: Prefix Discovery');
        const countries = targetCountries || ['Australia', 'Trinidad and Tobago', 'Malaysia'];
        
        for (const country of countries) {
          const { enhancedPhoneData } = require('../data/enhancedPhoneData');
          const carriers = Object.keys(enhancedPhoneData[country]?.carriers || {});
          
          for (const carrier of carriers.slice(0, 2)) { // Limit to 2 carriers per country
            if (improvementResults.apiCallsUsed >= maxApiCalls) break;
            
            const discovery = await this.prefixDiscovery.discoverPrefixesForCarrier(
              country, carrier, Math.min(20, maxApiCalls - improvementResults.apiCallsUsed)
            );
            
            improvementResults.apiCallsUsed += discovery.apiCallsMade;
            
            if (!improvementResults.prefixDiscovery) {
              improvementResults.prefixDiscovery = [];
            }
            improvementResults.prefixDiscovery.push(discovery);
          }
          
          if (improvementResults.apiCallsUsed >= maxApiCalls) break;
        }
      }

      // 2. Telecom Database Validation
      if (validateTelecomData) {
        console.log('🌐 Phase 2: Telecom Database Validation');
        const { enhancedPhoneData } = require('../data/enhancedPhoneData');
        improvementResults.telecomValidation = await this.telecomDatabase.validateAgainstOfficialSources(enhancedPhoneData);
      }

      // 3. Apply improvements
      console.log('📈 Phase 3: Applying Improvements');
      await this.applySystemImprovements(improvementResults);
      
      console.log('✅ System improvement complete');
      
    } catch (error) {
      console.error('❌ System improvement failed:', error.message);
    }

    return improvementResults;
  }

  /**
   * Apply discovered improvements to phone data
   * @param {Object} improvementResults - Results from improvement process
   * @returns {Promise<void>}
   */
  async applySystemImprovements(improvementResults) {
    // Apply prefix discoveries
    if (improvementResults.prefixDiscovery) {
      for (const discovery of improvementResults.prefixDiscovery) {
        if (discovery.validPrefixes.size > 0) {
          await this.prefixDiscovery.updatePhoneDataWithDiscoveries(
            discovery.country, discovery.carrier
          );
        }
      }
    }

    // Apply telecom database improvements
    if (improvementResults.telecomValidation) {
      const { enhancedPhoneData } = require('../data/enhancedPhoneData');
      await this.telecomDatabase.bulkUpdateWithOfficialData(enhancedPhoneData);
    }
  }

  // Helper methods
  generateFromDiscoveryData(country, carrier) {
    const discoveredPrefixes = this.prefixDiscovery.getDiscoveredPrefixes(country, carrier);
    if (discoveredPrefixes.length === 0) return null;
    
    // Use discovered prefix to generate number
    const selectedPrefix = discoveredPrefixes[Math.floor(Math.random() * discoveredPrefixes.length)];
    return this.buildNumberFromPrefix(selectedPrefix, country, carrier, 'prefix_discovery');
  }

  generateFromTelecomDatabase(country, carrier) {
    const { enhancedPhoneData } = require('../data/enhancedPhoneData');
    const countryData = enhancedPhoneData[country];
    
    if (!countryData?.iso2) return null;
    
    const officialPattern = this.telecomDatabase.getOfficialMobilePatterns(countryData.iso2);
    if (!officialPattern) return null;
    
    return this.buildNumberFromPrefix(officialPattern.mobilePrefix, country, carrier, 'telecom_database');
  }

  buildNumberFromPrefix(prefix, country, carrier, source) {
    const { enhancedPhoneData } = require('../data/enhancedPhoneData');
    const countryData = enhancedPhoneData[country];
    
    if (!countryData) return null;

    const remainingLength = countryData.phone_length - prefix.length;
    const suffix = Array.from({ length: remainingLength }, () => Math.floor(Math.random() * 10)).join('');
    const nationalNumber = prefix + suffix;
    
    const countryCode = Array.isArray(countryData.country_code) 
      ? countryData.country_code[0] 
      : countryData.country_code;

    return {
      country,
      carrier,
      nationalNumber,
      e164: `${countryCode}${nationalNumber}`,
      prefix,
      generationMethod: source,
      timestamp: new Date().toISOString()
    };
  }

  getIntelligenceSource(candidate) {
    return candidate.generationMethod || 'standard';
  }

  calculateOverallConfidence(candidate) {
    // Base confidence on generation method
    switch (candidate.generationMethod) {
      case 'adaptive_learning': return candidate.confidence || 0.9;
      case 'prefix_discovery': return 0.8;
      case 'telecom_database': return 0.7;
      default: return 0.5;
    }
  }

  isDuplicate(e164, existingResults) {
    return existingResults.some(result => result.e164 === e164);
  }

  getPerformanceMetrics() {
    return {
      adaptiveLearning: this.adaptiveLearning.getLearningStats(),
      prefixDiscovery: this.prefixDiscovery.generateDiscoveryReport(),
      systemEfficiency: this.calculateSystemEfficiency()
    };
  }

  calculateSystemEfficiency() {
    const learningStats = this.adaptiveLearning.getLearningStats();
    const baselineSuccessRate = 10; // Assume 10% for random generation
    const currentSuccessRate = parseFloat(learningStats.averageSuccessRate) || baselineSuccessRate;
    
    return {
      improvementFactor: (currentSuccessRate / baselineSuccessRate).toFixed(1),
      estimatedApiSavings: `${((1 - baselineSuccessRate/currentSuccessRate) * 100).toFixed(1)}%`,
      currentSuccessRate: `${currentSuccessRate}%`
    };
  }

  async saveAllLearningData() {
    await Promise.all([
      this.adaptiveLearning.saveLearningData(),
      this.prefixDiscovery.saveDiscoveryData()
    ]);
  }
}

module.exports = { IntegratedIntelligenceService };