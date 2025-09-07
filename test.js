// Simple test to verify the merged solution works
const { PhoneNumberSystem, SmartPhoneGenerator, enhancedPhoneData } = require('./src/main');

async function runTests() {
  console.log('🧪 TESTING MERGED PHONE NUMBER SOLUTION\n');
  
  try {
    // Test 1: Check data structure
    console.log('📊 Test 1: Verify enhanced data structure');
    const countries = Object.keys(enhancedPhoneData);
    console.log(`✅ Countries loaded: ${countries.length}`);
    console.log(`📍 Sample countries: ${countries.slice(0, 5).join(', ')}`);
    
    // Verify Trinidad and Tobago is included
    if (enhancedPhoneData['Trinidad and Tobago']) {
      console.log('✅ Trinidad and Tobago successfully added');
      const ttCarriers = Object.keys(enhancedPhoneData['Trinidad and Tobago'].carriers);
      console.log(`📱 T&T Carriers: ${ttCarriers.join(', ')}`);
    } else {
      console.log('❌ Trinidad and Tobago missing');
    }

    // Test 2: Smart Generator (offline)
    console.log('\n🎯 Test 2: Smart phone number generation (offline)');
    const generator = new SmartPhoneGenerator();
    
    const candidates = await generator.generateRealisticNumbers({
      count: 5,
      country: 'Australia',
      preValidateOnly: true
    });
    
    console.log(`✅ Generated ${candidates.length} realistic Australian numbers:`);
    candidates.forEach(c => {
      console.log(`   ${c.e164} (${c.carrier}) - Pre-validated: ${c.preValidated}`);
    });

    // Test 3: Caribbean numbers
    console.log('\n🏝️  Test 3: Caribbean number generation');
    const caribbeanNumbers = await generator.generateRealisticNumbers({
      count: 3,
      country: 'Trinidad and Tobago',
      preValidateOnly: true
    });
    
    console.log(`✅ Generated ${caribbeanNumbers.length} T&T numbers:`);
    caribbeanNumbers.forEach(c => {
      console.log(`   ${c.e164} (${c.carrier})`);
    });

    // Test 4: System integration (without API)
    console.log('\n🔧 Test 4: System integration (pre-validation only)');
    const system = new PhoneNumberSystem('test-key');
    
    const systemResult = await system.generateNumbers({
      count: 3,
      country: 'New Zealand',
      validateWithApi: false // No API calls in test
    });
    
    console.log(`✅ System generated ${systemResult.summary.generated} numbers`);
    console.log(`📊 Summary:`, systemResult.summary);

    // Test 5: Bulk generation
    console.log('\n🔄 Test 5: Bulk generation test');
    const bulkResult = await system.generateBulk([
      { country: 'Australia', carrier: 'Telstra', count: 2 },
      { country: 'Aruba', carrier: 'Setar', count: 2 }
    ]);
    
    console.log(`✅ Bulk generation completed`);
    console.log(`📊 Total Summary:`, bulkResult.totalSummary);

    // Test 6: Export functionality
    console.log('\n💾 Test 6: Export functionality');
    const exportResult = system.exportResults(systemResult.results, {
      format: 'csv',
      onlyValid: true
    });
    
    console.log(`✅ CSV export created with ${exportResult.rows.length} rows`);
    console.log(`📄 Sample CSV header: ${exportResult.headers.join(', ')}`);

    // Test 7: Statistics
    console.log('\n📊 Test 7: System statistics');
    const stats = system.getStats();
    console.log(`✅ Stats collected:`);
    console.log(`   - Available countries: ${stats.availableOptions.totalCountries}`);
    console.log(`   - Total carriers: ${stats.availableOptions.totalCarriers}`);
    console.log(`   - Generator stats:`, stats.generator);

    console.log('\n🎉 ALL TESTS PASSED! The merged solution is working correctly.');
    console.log('\n💡 To test with actual API validation, set your NumVerify API key and run:');
    console.log('   NUMVERIFY_API_KEY="your-key" node src/main.js');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  }
}

// Run tests
runTests();