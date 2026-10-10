const https = require('https');

const API_KEY = '8b9e104198b097fa1562fa48ba29f859';
const titles = ['Monster', 'Neagley', 'Lanterns', 'MobLand', 'The Gentlemen', 'American Horror Story', 'Lioness', 'Slow Horses', 'Brothers', 'Ted Lasso'];

async function search() {
  for (const title of titles) {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(title)}`;
    await new Promise(resolve => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          const items = (parsed.results || []).filter(i => i.media_type === 'movie' || i.media_type === 'tv');
          if (items.length > 0) {
            console.log(`{ id: ${items[0].id}, type: '${items[0].media_type}' }, // ${title}`);
          }
          resolve();
        });
      });
    });
  }
}
search();
