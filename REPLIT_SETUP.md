# 🚀 REPLIT SETUP GUIDE - Smart Phone Generator

## Quick Setup Instructions

### 1. Create New Replit Project
- Go to [replit.com](https://replit.com)
- Click "Create Repl" → Choose "Node.js"
- Name: "smart-phone-generator"

### 2. Replace package.json
Delete the default package.json and create a new one with this content:

```json
{
  "name": "smart-phone-generator",
  "version": "2.0.0",
  "description": "Intelligent phone number generator with NumVerify API integration",
  "main": "src/main.js",
  "scripts": {
    "start": "node src/main.js",
    "test": "node test.js",
    "demo": "node src/main.js"
  },
  "dependencies": {
    "awesome-phonenumber": "^7.5.0",
    "libphonenumber-js": "^1.12.15"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### 3. Create Folder Structure
Create these folders in Replit:
```
📁 src/
  📁 data/
  📁 generators/
  📁 services/
```

### 4. Add Environment Variable
In Replit:
- Go to "Secrets" tab (🔒 icon on left)
- Add: Key = `NUMVERIFY_API_KEY`, Value = `your-actual-api-key`

### 5. Install Dependencies
In Replit Shell, run:
```bash
npm install
```

### 6. Copy Files
I'll provide each file content below. Create each file and copy the content:

---

## 📄 FILE CONTENTS TO COPY

### src/data/enhancedPhoneData.js
[See next message for file content]

### src/generators/smartPhoneGenerator.js  
[See next message for file content]

### src/services/enhancedApiService.js
[See next message for file content]

### src/main.js
[See next message for file content]

### test.js
[See next message for file content]

### README.md
[See next message for file content]

---

## 🎯 After Setup

### Test the System:
```bash
# Test without API (pre-validation only)
npm test

# Run with API validation
npm start
```

### Quick Test Code:
```javascript
const { PhoneNumberSystem } = require('./src/main');
const apiKey = process.env.NUMVERIFY_API_KEY || 'test-key';
const system = new PhoneNumberSystem(apiKey);

// Generate 5 numbers (pre-validation only if no API key)
system.generateNumbers({ 
  count: 5, 
  country: 'Trinidad and Tobago',
  validateWithApi: !!process.env.NUMVERIFY_API_KEY 
}).then(results => {
  console.log('Generated:', results.summary);
  console.log('Valid numbers:', results.results.filter(r => r.valid));
});
```

---

## 🔧 Replit-Specific Tips

1. **Dependencies**: Replit will auto-install when you run the code
2. **Environment Variables**: Use the Secrets tab for API keys
3. **File Structure**: Use the file explorer on the left to create folders
4. **Running**: Click the green "Run" button or use Shell commands
5. **Debugging**: Use the Console tab to see output

---

## 🚨 Common Issues & Solutions

**Issue**: "Cannot find module" errors
**Solution**: Run `npm install` in Shell

**Issue**: API key not working
**Solution**: Check Secrets tab, ensure key is correct

**Issue**: Caribbean numbers not generating
**Solution**: This is expected without API validation - use pre-validation mode

**Issue**: Rate limiting
**Solution**: Adjust rate limits in system configuration

---

## 📞 Quick Test Commands

```bash
# Basic test
npm test

# Generate Australian numbers
node -e "const {PhoneNumberSystem} = require('./src/main'); new PhoneNumberSystem('test').generateNumbers({count:3, country:'Australia', validateWithApi:false}).then(r=>console.log(r.results))"

# Generate Caribbean numbers  
node -e "const {PhoneNumberSystem} = require('./src/main'); new PhoneNumberSystem('test').generateNumbers({count:3, country:'Trinidad and Tobago', validateWithApi:false}).then(r=>console.log(r.results))"
```