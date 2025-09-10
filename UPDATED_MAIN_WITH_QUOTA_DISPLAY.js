// Updated Main.js with Live Quota Display
// Add these functions to your existing main.js or replace the progress callback section

// Enhanced progress callback with quota display
const enhancedProgressCallback = (progress) => {
  // Clear previous line for live update
  process.stdout.write('\r\x1b[K');
  
  // Main progress
  const successRate = progress.processed > 0 ? ((progress.valid / progress.processed) * 100).toFixed(1) : 0;
  process.stdout.write(`📈 Progress: ${progress.processed}/${progress.total} | ✅ Valid: ${progress.valid} | ❌ Invalid: ${progress.invalid} | 📊 Success: ${successRate}%`);
  
  // Quota information
  if (progress.quotaStatus) {
    const quota = progress.quotaStatus;
    const quotaColor = quota.statusColor === 'red' ? '\x1b[31m' : quota.statusColor === 'yellow' ? '\x1b[33m' : '\x1b[32m';
    process.stdout.write(`\n${quotaColor}📊 API Quota: ${quota.used}/${quota.monthlyLimit} used | ${quota.remaining} remaining (${quota.usagePercentage}%)\x1b[0m`);
    
    // Quota warnings
    if (quota.status === 'warning') {
      process.stdout.write(`\n\x1b[33m⚠️  WARNING: Approaching quota limit!\x1b[0m`);
    } else if (quota.status === 'critical') {
      process.stdout.write(`\n\x1b[31m🚨 CRITICAL: Very close to quota limit!\x1b[0m`);
    } else if (quota.status === 'exhausted') {
      process.stdout.write(`\n\x1b[31m❌ QUOTA EXHAUSTED: Stopping validation\x1b[0m`);
    }
  }
  
  // Estimated completion
  if (progress.processed > 0 && progress.processed < progress.total) {
    const remainingCalls = progress.total - progress.processed;
    const estimatedMinutes = Math.ceil(remainingCalls / 10); // Assume 10 calls per minute
    process.stdout.write(`\n⏱️  Estimated completion: ${estimatedMinutes} minutes`);
  }
  
  process.stdout.write('\n');
};

// Updated generateNumbers function with enhanced quota display
async function generateNumbersWithQuotaDisplay(system, options = {}) {
  const {
    count = system.config.defaultCount,
    country = null,
    carrier = null,
    validateWithApi = true,
    exportResults = false
  } = options;

  console.log(`🚀 Starting phone number generation...`);
  console.log(`📊 Parameters: ${count} numbers, Country: ${country || 'Random'}, Carrier: ${carrier || 'Random'}`);
  
  // Display initial quota status
  if (validateWithApi && system.apiService.quotaTracker) {
    system.apiService.quotaTracker.displayQuotaReport();
    
    // Check if we have enough quota
    const quotaCheck = system.apiService.quotaTracker.checkApiPermission(count);
    if (!quotaCheck.allowed) {
      console.warn(`🚨 ${quotaCheck.message}`);
      
      if (quotaCheck.maxAllowed > 0) {
        console.log(`💡 Proceeding with ${quotaCheck.maxAllowed} numbers instead of ${count}`);
        options.count = quotaCheck.maxAllowed;
      } else {
        console.log(`💡 Switching to pre-validation only mode (no API calls)`);
        validateWithApi = false;
      }
    }
  }

  try {
    let results;
    
    if (validateWithApi) {
      results = await system.apiService.generateAndValidate({
        count: options.count || count,
        country,
        carrier,
        preValidateOnly: false,
        progressCallback: enhancedProgressCallback // Use enhanced callback
      });
    } else {
      const candidates = await system.generator.generateRealisticNumbers({ 
        count, country, carrier, preValidateOnly: true 
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

    // Enhanced results display
    displayEnhancedResults(results, system);

    // Export if requested
    if (exportResults) {
      const exported = system.exportResults(results.results, { 
        format: system.config.exportFormat, 
        includeMetadata: true 
      });
      console.log(`💾 Results exported (${exported.numbers?.length || exported.count} numbers)`);
      
      // Show TXT format preview
      if (system.config.exportFormat === 'txt' && exported.text) {
        const preview = exported.text.length > 100 ? exported.text.substring(0, 100) + '...' : exported.text;
        console.log(`📄 TXT Preview: ${preview}`);
      }
      
      return { ...results, exported };
    }

    return results;

  } catch (error) {
    console.error(`❌ Generation failed:`, error.message);
    throw error;
  }
}

// Enhanced results display with quota information
function displayEnhancedResults(results, system) {
  const { summary } = results;
  
  console.log(`\n📊 GENERATION RESULTS`);
  console.log(`====================`);
  console.log(`📱 Total Generated: ${summary.generated || summary.processed || 0}`);
  console.log(`✅ Valid Numbers: ${summary.valid || 0}`);
  console.log(`❌ Invalid Numbers: ${summary.invalid || 0}`);
  
  // Success rate
  if (summary.processed > 0) {
    const successRate = ((summary.valid / summary.processed) * 100).toFixed(1);
    console.log(`📊 Success Rate: ${successRate}%`);
  }
  
  // Cache info
  if (summary.cacheHits > 0) {
    console.log(`💾 Cache Hits: ${summary.cacheHits}`);
  }
  
  // Quota status
  if (summary.quotaStatus) {
    const quota = summary.quotaStatus;
    const quotaColor = quota.statusColor === 'red' ? '\x1b[31m' : quota.statusColor === 'yellow' ? '\x1b[33m' : '\x1b[32m';
    console.log(`${quotaColor}📊 API Quota: ${quota.used}/${quota.monthlyLimit} used (${quota.remaining} remaining)${'\x1b[0m'}`);
    
    if (quota.status !== 'normal') {
      const statusEmoji = quota.status === 'exhausted' ? '❌' : quota.status === 'critical' ? '🚨' : '⚠️';
      console.log(`${quotaColor}${statusEmoji} Quota Status: ${quota.status.toUpperCase()}${'\x1b[0m'}`);
    }
  }
  
  if (summary.quotaExhausted) {
    console.log(`\x1b[31m⚠️  API QUOTA EXHAUSTED - Download current results\x1b[0m`);
  }

  // Sample valid numbers
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
  
  console.log(`====================\n`);
}

// Usage example for your system:
/*
// In your main.js, replace the generateNumbers call:
const results = await generateNumbersWithQuotaDisplay(system, {
  count: 5000,
  country: 'Saint Lucia',
  validateWithApi: true,
  exportResults: true
});
*/

module.exports = { 
  enhancedProgressCallback, 
  generateNumbersWithQuotaDisplay, 
  displayEnhancedResults 
};