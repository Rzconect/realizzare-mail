const https = require('https');
https.get('https://api.github.com/search/code?q=repo:EvolutionAPI/evolution-api+sendText', {headers: {'User-Agent': 'node.js'}}, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(JSON.parse(data).items?.slice(0, 5).map(i => i.html_url) || data));
});
