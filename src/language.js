const fs = require('fs');
const glob = require( 'glob' );

var language_dict = {};

const init = () => {
    glob.sync( 'assets/language/*.json' ).forEach( function( file ) {
        let dash = file.split("/");
        if(dash.length == 3) {
            let dot = dash[2].split(".");
          if(dot.length == 2) {
            let lang = dot[0];
            fs.readFile(file, function(err, data) {
              langString =  JSON.parse(data.toString());
              language_dict[lang] = langString;
            });
          }
        }
      });
}

module.exports = {init, language_dict}