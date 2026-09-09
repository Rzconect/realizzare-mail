const https = require('https');
const key = 'sk_64aa7a6c7dcc4a27b5e4e1f11f3da054';
const auth = Buffer.from(key + ':').toString('base64');

function fetchDeliveries(hookId) {
  return new Promise((resolve, reject) => {
    https.get('https://api.pagar.me/core/v5/hooks/' + hookId + '/deliveries?page=1&size=20', {
      headers: { 'Authorization': 'Basic ' + auth, 'accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data, error: true }); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const hookId = 'hook_B6o1lvI43CxyNQOm';
  const deliveries = await fetchDeliveries(hookId);
  console.log("Response:", JSON.stringify(deliveries).substring(0, 300));
}
run();
