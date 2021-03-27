
let authHeader = 'bearer dGhlc2VjcmV0dG9rZW4=';


const addressesRoutes = (app, fs) => {
    // variables
    const dataPath = './data/addresses.json';

    app.get('/cities-by-tag', (req, res) => {
        
        var authHeader = req.get('Authorization');
        var resStatus = 401;
        var resBody = '';
        console.log('Auth Header: '+authHeader);

        if(authHeader == null || authHeader != authHeader) {
            resStatus = 401;
            resBody = '{ error: "Auth header is invalid or missing" }';
            res.status(resStatus).send(resBody);
        } else {

            fs.readFile(dataPath, 'utf8', (err, data) => {
                if (err) {
                    throw err;
                }
                var tag = req.query.tag;
                var isActive = req.query.isActive;

                console.log('queryParam - tag: '+tag);
                console.log('queryParam - isActive: '+isActive);

                var cities = JSON.parse(data);
                let filteredCitiesByTag = cities.filter(c => c.tags.includes(tag));
                let filteredCitiesByActiveFlag = filteredCitiesByTag.filter(c => c.isActive); 
                let filteredByAllFilters = cities.filter(c => c.tags.includes(tag)).filter(c => c.isActive);
                resStatus = 200;          
                console.log("Filtered cities tag: "+filteredCitiesByTag.length);
                console.log("Filtered cities isActive: "+filteredCitiesByActiveFlag.length);
                            
                
                res.status(resStatus).send('{"cities":'+JSON.stringify(filteredByAllFilters)+'}');
            });


        }


  
      
    });
  };
  


  module.exports = addressesRoutes;
  