const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/illinois-stat447/fa22-prj-yutingl7-zs30-zhaolin4-yufeid3-yiy14/main/datasets/players_22.csv';

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  if (res.statusCode === 200) {
    const file = fs.createWriteStream('players_22.csv');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download completed');
    });
  } else {
    console.error('Failed to download');
  }
}).on('error', (e) => {
  console.error(e);
});
