// Vercel 部署測試腳本
const https = require('https');

const testEndpoints = [
  'https://easypack-capsule-management.vercel.app',
  'https://easypack-capsule-management-git-feature-v2-ai-recipe-generator-yunhaimaster.vercel.app',
  'https://easypack-capsule-management-git-main-yunhaimaster.vercel.app'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode === 200,
          data: data.substring(0, 200) + '...'
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function testMigrationEndpoint(baseUrl) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({});
    const options = {
      hostname: baseUrl.replace('https://', '').split('/')[0],
      port: 443,
      path: '/api/migrate-simple',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url: baseUrl + '/api/migrate-simple',
          status: res.statusCode,
          success: res.statusCode === 200,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url: baseUrl + '/api/migrate-simple',
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🔍 測試 Vercel 部署狀態...\n');
  
  // 測試主頁
  for (const url of testEndpoints) {
    console.log(`測試: ${url}`);
    const result = await testEndpoint(url);
    console.log(`狀態: ${result.status} ${result.success ? '✅' : '❌'}`);
    if (result.error) {
      console.log(`錯誤: ${result.error}`);
    }
    console.log('');
  }
  
  // 測試遷移端點
  console.log('🔧 測試數據庫遷移端點...\n');
  for (const url of testEndpoints) {
    console.log(`測試遷移: ${url}/api/migrate-simple`);
    const result = await testMigrationEndpoint(url);
    console.log(`狀態: ${result.status} ${result.success ? '✅' : '❌'}`);
    if (result.data) {
      console.log(`回應: ${result.data.substring(0, 200)}...`);
    }
    if (result.error) {
      console.log(`錯誤: ${result.error}`);
    }
    console.log('');
  }
}

runTests().catch(console.error);
