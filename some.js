const fs = require('fs');

const img = fs.readFileSync('./440x280.jpg', {encoding: 'base64'});

fs.writeFileSync('base64.txt', `data:image/png;base64,${img}`, 'utf8');
