const https = require('https');

https.get('https://raw.githubusercontent.com/dcaribou/transfermarkt-datasets/master/data/prep/players.csv', (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', chunk => {
    // just print first 500 chars to verify
    console.log(chunk.toString().substring(0, 500));
    process.exit(0);
  });
}).on('error', (e) => {
  console.error(e);
});
