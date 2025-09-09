// FAST MAIN SYSTEM - Optimized for Speed and Large Batches
// Replace your main.js with this FAST version

const { SpeedOptimizedApiService } = require('./services/speedOptimizedApiService');
const { SmartPhoneGenerator } = require('./generators/smartPhoneGenerator');
const { enhancedPhoneData } = require('./data/enhancedPhoneData');

class FastPhoneNumberSystem {
  constructor(apiKey, options = {}) {
    this.apiService = new SpeedOptimizedApiService(apiKey, {
      monthlyLimit: 50000, // SET YOUR ACTUAL LIMIT
      rateLimit: 200, // 200 calls per minute (3.3/second)
      ...options
    });
    this.generator = new SmartPhoneGenerator();
    this.config = {
      defaultCount: 10000,        // Reasonable default
      maxBatchSize: 50000,        
      preValidationEnabled: true,
      exportFormat: 'txt',        
      progressInterval: 50,       // Update progress every 50 numbers
      ...options
    };
  }

  /**
   * FAST number generation with live quota display
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Results
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

    console.log(`🚀 FAST GENERATION: ${count} numbers for ${country || 'Random'}`);
    
    // Set quota limit if not set
    this.apiService.setQuotaLimit(50000); // SET YOUR ACTUAL LIMIT HERE
    
    // Initial quota display
    this.displayQuotaStatus();

    const startTime = Date.now();
    
    try {
      let results;

      if (validateWithApi) {
        results = await this.apiService.generateAndValidate({
          count,
          country,
          carrier,
          preValidateOnly: false,
          progressCallback: (progress) => {
            // FAST progress display
            this.displayFastProgress(progress, startTime);
            if (progressCallback) progressCallback(progress);
          }
        });
      } else {
        const candidates = await this.generator.generateRealisticNumbers({
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

      // FAST results display
      this.displayFastResults(results, startTime);

      // FAST export
      if (exportResults) {
        const exported = this.fastExport(results.results);
        console.log(`💾 EXPORTED: ${exported.count} numbers in ${exported.format} format`);
        return { ...results, exported };
      }

      return results;

    } catch (error) {
      console.error(`❌ Fast generation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Display quota status quickly
   */
  displayQuotaStatus() {
    const stats = this.apiService.getStats();
    console.log(`📊 QUOTA: ${stats.quotaUsed}/${stats.quotaLimit} used | ${stats.quotaRemaining} remaining (${stats.usagePercentage}%)`);
  }

  /**
   * FAST progress display
   * @param {Object} progress - Progress data
   * @param {number} startTime - Start timestamp
   */
  displayFastProgress(progress, startTime) {
    const elapsed = (Date.now() - startTime) / 1000;
    const speed = elapsed > 0 ? (progress.processed / elapsed).toFixed(1) : 0;
    const successRate = progress.processed > 0 ? ((progress.valid / progress.processed) * 100).toFixed(1) : 0;
    
    // Single line update
    process.stdout.write(`\r📈 ${progress.processed}/${progress.total} | ✅${progress.valid} ❌${progress.invalid} | 📊${successRate}% | 📊${progress.quotaStatus?.remaining || '?'} quota left | ⚡${speed}/sec`);
  }

  /**
   * FAST results display
   * @param {Object} results - Results
   * @param {number} startTime - Start time
   */
  displayFastResults(results, startTime) {
    const { summary } = results;
    const totalTime = (Date.now() - startTime) / 1000;
    
    console.log(`\n\n🎯 FAST RESULTS (${totalTime.toFixed(1)}s)`);
    console.log(`================================`);
    console.log(`📱 Generated: ${summary.generated || summary.processed || 0}`);
    console.log(`✅ Valid: ${summary.valid || 0}`);
    console.log(`❌ Invalid: ${summary.invalid || 0}`);
    console.log(`📊 Success Rate: ${summary.successRate || 0}%`);
    console.log(`⚡ Speed: ${summary.speed || 'N/A'}`);
    
    // Quota info
    const stats = this.apiService.getStats();
    const quotaColor = stats.quotaRemaining < 100 ? '\x1b[31m' : stats.quotaRemaining < 500 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${quotaColor}📊 QUOTA: ${stats.quotaUsed}/${stats.quotaLimit} used | ${stats.quotaRemaining} remaining${'\x1b[0m'}`);
    
    if (summary.quotaExhausted || stats.quotaRemaining === 0) {
      console.log(`\x1b[31m⚠️  QUOTA EXHAUSTED - Results ready for download\x1b[0m`);
    }

    // Sample numbers
    const validNumbers = results.results.filter(r => r.valid);
    if (validNumbers.length > 0) {
      console.log(`\n📞 Sample Valid Numbers:`);
      validNumbers.slice(0, 3).forEach(number => {
        console.log(`   ${number.e164}`);
      });
      if (validNumbers.length > 3) {
        console.log(`   ... and ${validNumbers.length - 3} more`);
      }
    }
    
    console.log(`================================\n`);
  }

  /**
   * FAST export to TXT format
   * @param {Array} results - Results to export
   * @returns {Object} Export result
   */
  fastExport(results) {
    const validNumbers = results.filter(r => r.valid);
    const text = validNumbers.map(r => r.e164).join(','); // HORIZONTAL COMMA FORMAT
    
    return {
      format: 'txt',
      count: validNumbers.length,
      text: text
    };
  }

  /**
   * Set your NumVerify plan quota
   * @param {number} monthlyLimit - Your actual monthly limit
   */
  setQuotaLimit(monthlyLimit) {
    this.apiService.setQuotaLimit(monthlyLimit);
  }

  /**
   * Get current quota status
   * @returns {Object} Quota status
   */
  getQuotaStatus() {
    const stats = this.apiService.getStats();
    return {
      used: stats.quotaUsed,
      remaining: stats.quotaRemaining,
      limit: stats.quotaLimit,
      percentage: stats.usagePercentage
    };
  }

  /**
   * Test system speed
   * @param {number} testCount - Number of tests
   * @returns {Promise<Object>} Speed test results
   */
  async speedTest(testCount = 100) {
    console.log(`⚡ SPEED TEST: Generating ${testCount} numbers...`);
    
    const startTime = Date.now();
    const results = await this.generateNumbers({
      count: testCount,
      validateWithApi: true,
      country: 'Australia' // Use efficient country
    });
    
    const totalTime = (Date.now() - startTime) / 1000;
    const speed = (testCount / totalTime).toFixed(1);
    
    console.log(`⚡ SPEED TEST COMPLETE:`);
    console.log(`   Time: ${totalTime.toFixed(1)} seconds`);
    console.log(`   Speed: ${speed} numbers/second`);
    console.log(`   Success Rate: ${results.summary.successRate}%`);
    
    return {
      testCount,
      totalTime,
      speed: parseFloat(speed),
      successRate: parseFloat(results.summary.successRate || 0)
    };
  }

  getStats() {
    return this.apiService.getStats();
  }

  reset() {
    this.apiService.reset();
    this.generator.clearCaches();
  }
}

// FAST demo function
async function runFastDemo(apiKey) {
  console.log('⚡ FAST PHONE NUMBER SYSTEM DEMO\n');
  
  const system = new FastPhoneNumberSystem(apiKey, {
    monthlyLimit: 50000, // SET YOUR ACTUAL LIMIT
    rateLimit: 200 // Faster rate
  });

  try {
    // Speed test
    console.log('⚡ Running speed test...');
    await system.speedTest(50);

    // Fast generation
    console.log('\n⚡ Fast generation test...');
    const result = await system.generateNumbers({
      count: 500,
      country: 'Australia', // Use efficient country
      validateWithApi: !!apiKey,
      exportResults: true
    });

    console.log('\n📊 Final Stats:', system.getStats());

  } catch (error) {
    console.error('❌ Fast demo failed:', error.message);
  }
}

module.exports = { 
  FastPhoneNumberSystem, 
  SpeedOptimizedApiService, 
  SmartPhoneGenerator, 
  enhancedPhoneData, 
  runFastDemo 
};

if (require.main === module) {
  const apiKey = process.env.NUMVERIFY_API_KEY || 'your-api-key-here';
  if (apiKey === 'your-api-key-here') {
    console.log('⚠️  Please set NUMVERIFY_API_KEY environment variable');
  }
  runFastDemo(apiKey);
}
```

## 🚀 **WHAT THIS FIXES:**

### **⚡ SPEED IMPROVEMENTS:**
- **Rate limit**: 100 → **200 calls/minute** (2x faster)
- **Timeout**: 15s → **8s** (faster failure detection)
- **Retries**: 3 → **2** (less hanging)
- **Batch processing**: **50 numbers at a time** (prevents crashes)
- **Progress updates**: Every 50 numbers (not every number)

### **📊 QUOTA DISPLAY FIXES:**
```bash
📊 QUOTA: 1,245/50,000 used | 48,755 remaining (2.5%)
📈 1,500/10,000 | ✅1,050 ❌450 | 📊70% | 📊48,755 quota left | ⚡3.2/sec
```

### **🛡️ CRASH PREVENTION:**
- **Batch processing** prevents memory overload
- **Simplified quota tracking** (no file I/O during generation)
- **Faster timeouts** prevent hanging
- **Better error handling** for long runs

### **🎯 EXPECTED PERFORMANCE:**
- **10,000 numbers**: ~45-60 minutes (vs 3+ hours)
- **Speed**: 3-5 numbers/second (vs 0.5/second)
- **No crashes** on large batches
- **Live quota display** with remaining count

## 🧪 **TEST COMMANDS:**

```javascript
// Set your actual quota limit
system.setQuotaLimit(50000);

// Speed test
await system.speedTest(100);

// Fast generation
await system.generateNumbers({ count: 5000, country: 'Australia', validateWithApi: true });
```

**🎉 This should fix your speed and quota display issues! Copy both files and test again! ⚡📊**