// COMPLETE EFFICIENCY AUDIT - All 28 Detailed Countries
// Checking all 11 original + 17 detailed countries for efficiency issues

const { enhancedPhoneData } = require('./src/data/enhancedPhoneData');

class CountryEfficiencyAuditor {
  constructor() {
    this.auditResults = new Map();
    this.issues = [];
    this.recommendations = [];
  }

  /**
   * Audit all 28 detailed countries for efficiency
   * @returns {Object} Complete audit report
   */
  auditAllCountries() {
    console.log('🔍 AUDITING ALL 28 DETAILED COUNTRIES FOR EFFICIENCY...\n');
    
    const auditReport = {
      totalCountries: 0,
      efficientCountries: 0,
      problematicCountries: 0,
      countryReports: [],
      overallIssues: [],
      recommendations: []
    };

    // Get all countries from enhanced data + detailed additions
    const allCountries = this.getAllDetailedCountries();
    auditReport.totalCountries = allCountries.length;

    console.log(`📊 Auditing ${allCountries.length} detailed countries...\n`);

    allCountries.forEach(country => {
      const audit = this.auditSingleCountry(country);
      auditReport.countryReports.push(audit);
      
      if (audit.isEfficient) {
        auditReport.efficientCountries++;
        console.log(`✅ ${country}: EFFICIENT (${audit.efficiencyScore}/100)`);
      } else {
        auditReport.problematicCountries++;
        console.log(`❌ ${country}: NEEDS FIXING (${audit.efficiencyScore}/100)`);
        console.log(`   🔧 Issues: ${audit.issues.join(', ')}`);
      }
    });

    // Generate overall recommendations
    auditReport.recommendations = this.generateOverallRecommendations(auditReport.countryReports);
    
    console.log(`\n📊 AUDIT SUMMARY:`);
    console.log(`✅ Efficient: ${auditReport.efficientCountries}/${auditReport.totalCountries}`);
    console.log(`❌ Need Fixing: ${auditReport.problematicCountries}/${auditReport.totalCountries}`);
    
    return auditReport;
  }

  /**
   * Get all detailed countries list
   * @returns {Array} Array of detailed country names
   */
  getAllDetailedCountries() {
    // Original 11 + Detailed 17 countries
    return [
      // Original 11 (should be detailed)
      "Australia", "New Zealand", "Trinidad and Tobago", "Dominican Republic",
      "Saint Lucia", "Saint Vincent and the Grenadines", "Dominica", 
      "Barbados", "Aruba", "Saint Kitts and Nevis", "Sint Maarten",
      
      // Additional 17 detailed countries
      "Belize", "Turks and Caicos", "Guadeloupe", "Martinique", 
      "French Guyana", "Netherlands", "Ireland", "Grenada", 
      "Panama", "Malaysia", "Anguilla", "Cayman Islands", 
      "Saint Martin (French)", "Curacao", "Bonaire", "Puerto Rico", "Luxembourg"
    ];
  }

  /**
   * Audit a single country for efficiency
   * @param {string} country - Country name to audit
   * @returns {Object} Country audit report
   */
  auditSingleCountry(country) {
    const countryData = enhancedPhoneData[country];
    
    if (!countryData) {
      return {
        country,
        isEfficient: false,
        efficiencyScore: 0,
        issues: ['Country data not found'],
        recommendations: ['Add country data']
      };
    }

    const audit = {
      country,
      carrierCount: Object.keys(countryData.carriers).length,
      totalPrefixes: 0,
      avgPrefixesPerCarrier: 0,
      hasRealisticRanges: false,
      hasMobilePatterns: !!countryData.mobile_patterns?.length,
      hasForbiddenPatterns: !!countryData.forbidden_patterns?.length,
      hasServiceRanges: !!countryData.service_ranges?.length,
      issues: [],
      recommendations: [],
      efficiencyScore: 0,
      isEfficient: false
    };

    // Calculate prefix statistics
    const prefixCounts = Object.values(countryData.carriers).map(carrier => carrier.prefixes?.length || 0);
    audit.totalPrefixes = prefixCounts.reduce((sum, count) => sum + count, 0);
    audit.avgPrefixesPerCarrier = audit.carrierCount > 0 ? (audit.totalPrefixes / audit.carrierCount).toFixed(1) : 0;

    // Check for realistic ranges
    audit.hasRealisticRanges = Object.values(countryData.carriers)
      .some(carrier => carrier.realistic_ranges && Object.keys(carrier.realistic_ranges).length > 0);

    // Identify issues
    this.identifyCountryIssues(audit, countryData);

    // Calculate efficiency score
    audit.efficiencyScore = this.calculateEfficiencyScore(audit);
    audit.isEfficient = audit.efficiencyScore >= 75;

    return audit;
  }

  /**
   * Identify specific issues with country data
   * @param {Object} audit - Audit object to update
   * @param {Object} countryData - Country data to analyze
   */
  identifyCountryIssues(audit, countryData) {
    // Check carrier count
    if (audit.carrierCount < 2) {
      audit.issues.push('Insufficient carriers (need 2+)');
      audit.recommendations.push('Add more carrier options');
    }

    // Check prefix count
    if (audit.totalPrefixes < 20) {
      audit.issues.push(`Low prefix count (${audit.totalPrefixes}, need 20+)`);
      audit.recommendations.push('Add more prefixes per carrier');
    }

    // Check prefix distribution
    if (audit.avgPrefixesPerCarrier < 8) {
      audit.issues.push(`Low avg prefixes per carrier (${audit.avgPrefixesPerCarrier}, need 8+)`);
      audit.recommendations.push('Balance prefix distribution across carriers');
    }

    // Check realistic ranges
    if (!audit.hasRealisticRanges) {
      audit.issues.push('Missing realistic ranges');
      audit.recommendations.push('Add realistic_ranges for each carrier prefix');
    }

    // Check mobile patterns
    if (!audit.hasMobilePatterns) {
      audit.issues.push('Missing mobile patterns');
      audit.recommendations.push('Add mobile_patterns regex validation');
    }

    // Check forbidden patterns
    if (!audit.hasForbiddenPatterns) {
      audit.issues.push('Missing forbidden patterns');
      audit.recommendations.push('Add forbidden_patterns to avoid fake numbers');
    }

    // Check for single-digit prefixes (Caribbean issue)
    const hasSingleDigitPrefixes = Object.values(countryData.carriers)
      .some(carrier => carrier.prefixes?.some(prefix => prefix.length <= 2));
    
    if (hasSingleDigitPrefixes) {
      audit.issues.push('Contains single-digit prefixes (likely invalid)');
      audit.recommendations.push('Replace single-digit prefixes with 3+ digit realistic prefixes');
    }

    // Check for missing ISO2
    if (!countryData.iso2) {
      audit.issues.push('Missing ISO2 country code');
      audit.recommendations.push('Add iso2 field for libphonenumber integration');
    }

    // Check prefix format consistency
    const prefixLengths = Object.values(countryData.carriers)
      .flatMap(carrier => carrier.prefixes || [])
      .map(prefix => prefix.length);
    
    const uniqueLengths = [...new Set(prefixLengths)];
    if (uniqueLengths.length > 2) {
      audit.issues.push('Inconsistent prefix lengths');
      audit.recommendations.push('Standardize prefix lengths within country');
    }
  }

  /**
   * Calculate efficiency score for country
   * @param {Object} audit - Audit data
   * @returns {number} Efficiency score (0-100)
   */
  calculateEfficiencyScore(audit) {
    let score = 0;

    // Carrier count (0-15 points)
    if (audit.carrierCount >= 4) score += 15;
    else if (audit.carrierCount >= 3) score += 12;
    else if (audit.carrierCount >= 2) score += 8;

    // Total prefixes (0-25 points)
    if (audit.totalPrefixes >= 50) score += 25;
    else if (audit.totalPrefixes >= 30) score += 20;
    else if (audit.totalPrefixes >= 20) score += 15;
    else if (audit.totalPrefixes >= 10) score += 10;
    else if (audit.totalPrefixes >= 5) score += 5;

    // Prefix distribution (0-15 points)
    if (audit.avgPrefixesPerCarrier >= 15) score += 15;
    else if (audit.avgPrefixesPerCarrier >= 10) score += 12;
    else if (audit.avgPrefixesPerCarrier >= 8) score += 8;
    else if (audit.avgPrefixesPerCarrier >= 5) score += 5;

    // Data completeness (0-45 points)
    if (audit.hasRealisticRanges) score += 20;
    if (audit.hasMobilePatterns) score += 10;
    if (audit.hasForbiddenPatterns) score += 10;
    if (audit.hasServiceRanges) score += 5;

    return Math.min(100, score);
  }

  /**
   * Generate overall recommendations
   * @param {Array} countryReports - All country audit reports
   * @returns {Array} Overall recommendations
   */
  generateOverallRecommendations(countryReports) {
    const recommendations = [];

    // Find countries with single-digit prefix issues
    const singleDigitIssues = countryReports.filter(report => 
      report.issues.some(issue => issue.includes('single-digit'))
    );

    if (singleDigitIssues.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Caribbean Prefix Fix',
        affectedCountries: singleDigitIssues.map(r => r.country),
        issue: 'Single-digit prefixes causing API validation failures',
        solution: 'Replace with realistic 3-digit Caribbean mobile prefixes',
        estimatedImprovement: '60-80% success rate increase'
      });
    }

    // Find countries without realistic ranges
    const noRanges = countryReports.filter(report => !report.hasRealisticRanges);
    if (noRanges.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Missing Realistic Ranges',
        affectedCountries: noRanges.map(r => r.country),
        issue: 'Countries missing realistic_ranges data',
        solution: 'Add realistic_ranges for each carrier prefix',
        estimatedImprovement: '15-25% success rate increase'
      });
    }

    // Find countries with low prefix counts
    const lowPrefixes = countryReports.filter(report => report.totalPrefixes < 20);
    if (lowPrefixes.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Insufficient Prefixes',
        affectedCountries: lowPrefixes.map(r => r.country),
        issue: 'Countries with too few prefixes for realistic generation',
        solution: 'Use prefix discovery system to find more valid prefixes',
        estimatedImprovement: '20-30% success rate increase'
      });
    }

    return recommendations;
  }

  /**
   * Generate fix commands for problematic countries
   * @param {Array} countryReports - Country audit reports
   * @returns {Array} Array of fix commands
   */
  generateFixCommands(countryReports) {
    const fixCommands = [];

    countryReports.forEach(report => {
      if (!report.isEfficient) {
        const fixes = [];
        
        report.issues.forEach(issue => {
          if (issue.includes('single-digit')) {
            fixes.push(`Replace single-digit prefixes with 3-digit realistic prefixes`);
          }
          if (issue.includes('realistic ranges')) {
            fixes.push(`Add realistic_ranges: { "prefix": { "start": "...", "end": "..." } }`);
          }
          if (issue.includes('prefix count')) {
            fixes.push(`Add more prefixes (current: ${report.totalPrefixes}, target: 20+)`);
          }
        });

        if (fixes.length > 0) {
          fixCommands.push({
            country: report.country,
            efficiencyScore: report.efficiencyScore,
            fixes: fixes
          });
        }
      }
    });

    return fixCommands;
  }
}

// Run the audit
const auditor = new CountryEfficiencyAuditor();
const auditResults = auditor.auditAllCountries();

console.log('\n🚨 CRITICAL ISSUES FOUND:');
auditResults.recommendations.forEach(rec => {
  if (rec.priority === 'CRITICAL') {
    console.log(`\n❌ ${rec.category}:`);
    console.log(`   Countries: ${rec.affectedCountries.join(', ')}`);
    console.log(`   Issue: ${rec.issue}`);
    console.log(`   Solution: ${rec.solution}`);
    console.log(`   Expected Improvement: ${rec.estimatedImprovement}`);
  }
});

console.log('\n🔧 COUNTRIES NEEDING IMMEDIATE FIXES:');
const fixCommands = auditor.generateFixCommands(auditResults.countryReports);
fixCommands.forEach(fix => {
  if (fix.efficiencyScore < 50) {
    console.log(`\n🔴 ${fix.country} (${fix.efficiencyScore}/100):`);
    fix.fixes.forEach(fixCmd => console.log(`   • ${fixCmd}`));
  }
});

module.exports = { CountryEfficiencyAuditor, auditResults };