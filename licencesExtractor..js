const crawler = require('license-checker');
const fs = require('fs');
let finalLicense = [];
const numberRegex = /\d+(\.\d+)*/;
const atRegex = /(?:@)/gi;

crawler.init({
    start: './',
    production: true,
    customPath: 'version',
    direct: true,
  },
  function (error, res) {
    if (error) {
      console.error('Error:', error);
      process.exit(1);
    } else {
      Object.keys(res).map((idx) => {
        let item = res[idx];
        // Extract the version of the library from the name
        const version = idx.match(numberRegex);
        // Removes the part after the @
        const nameWithoutVersion = idx
          .replace(atRegex, '')
          .replace(version ? version[0] : '', '');
        finalLicense.push({
          name: nameWithoutVersion,
          version: version ? version[0] : '',
          licenseSpecs: item,
        });
      });
      fs.writeFileSync('licenses.json', JSON.stringify(finalLicense));
    }
  },
);


