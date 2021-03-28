
let authHeader = 'bearer dGhlc2VjcmV0dG9rZW4=';

const resultMap = new Map();

const addressesRoutes = (app, fs) => {
    const dataPath = './data/addresses.json';

    app.get('/all-cities', (req, res) => {
        
        var authHeaderRecd = req.get('Authorization');

        if(authHeaderRecd === null || authHeader !== authHeaderRecd) {
            resBody = '{ error: "Auth header is invalid or missing" }';
            res.status(401).send(resBody);
        } else {
            fs.readFile(dataPath, 'utf8', (err, data) => {
                if (err) {
                    throw err;
                }
                var cities = JSON.parse(data);            
                res.status(200).send(JSON.stringify(cities));
            });
        }
    });

    app.get('/area-result/:cacheId', (req, res) => {
        
        var authHeaderRecd = req.get('Authorization');

        if(authHeaderRecd == null || authHeader != authHeaderRecd) {
            resBody = '{ error: "Auth header is invalid or missing" }';
            res.status(401).send(resBody);
        } else {
            if(resultMap.has(req.params.cacheId)) {  
                fs.readFile(dataPath, 'utf8', (err, data) => {
                    if (err) {
                        throw err;
                    }
                    var cities = JSON.parse(data);
                    var requestParamsJson = resultMap.get(req.params.cacheId);

                    var requestParams = JSON.parse(requestParamsJson);
                    var fromCity = cities.filter(c => (c.guid === requestParams.from))[0];
                    var distanceInKm = requestParams.distance;
                    var body = {"cities": citiesInRange(cities, fromCity, requestParams.distance)};
                    res.status(200).send(JSON.stringify(body));
                });
            } else {  
                console.log(">>>>No"); 
                res.status(202).send();
            }
        }
    });

    app.get('/area', (req, res) => {
        
        var authHeader = req.get('Authorization');

        if(authHeader === null || authHeader !== authHeader) {
            resBody = '{ error: "Auth header is invalid or missing" }';
            res.status(401).send(resBody);
        } else {

            var fromCityGuid = req.query.from;
            var distanceInKm = req.query.distance;
            var requestMapToStore = { "from": fromCityGuid, "distance": new Number(distanceInKm) };
            console.log("Storing in resultMap:"+ JSON.stringify(requestMapToStore));
            resultMap.set('2152f96f-50c7-4d76-9e18-f7033bd14428', JSON.stringify(requestMapToStore));
            var fullUrl = req.protocol + '://' + req.get('host') + '/area-result/2152f96f-50c7-4d76-9e18-f7033bd14428';

            var body = { resultsUrl: fullUrl };            
            res.status(202).send(JSON.stringify(body));           
        }
    });


    app.get('/distance', (req, res) => {
        
        var authHeader = req.get('Authorization');
        console.log('Auth Header: '+authHeader);

        if(authHeader == null || authHeader != authHeader) {
            resBody = '{ error: "Auth header is invalid or missing" }';
            res.status(401).send(resBody);
        } else {

            fs.readFile(dataPath, 'utf8', (err, data) => {
                if (err) {
                    throw err;
                }
                var from = req.query.from;
                var to = req.query.to;

                var cities = JSON.parse(data);
                var fromCity = cities.filter(c => c.guid === from)[0];
                var toCity = cities.filter(c => c.guid === to)[0];

                var d = getDistanceFromLatLonInKm(fromCity.latitude, fromCity.longitude, toCity.latitude, toCity.longitude);
                var body = { 'from': fromCity, 'to': toCity, 'unit': 'km', 'distance': new Number(d)};
                res.status(200).send(body);
            });
        }
    });

    app.get('/cities-by-tag', (req, res) => {
        
        var authHeader = req.get('Authorization');

        if(authHeader == null || authHeader != authHeader) {
            resBody = '{ error: "Auth header is invalid or missing" }';
            res.status(401).send(resBody);
        } else {

            fs.readFile(dataPath, 'utf8', (err, data) => {
                if (err) {
                    throw err;
                }
                var tag = req.query.tag;
                var isActive = req.query.isActive;

                var cities = JSON.parse(data);
                let filteredByAllFilters = cities.filter(c => c.tags.includes(tag)).filter(c => c.isActive);
                
                res.status(200).send('{"cities":'+JSON.stringify(filteredByAllFilters)+'}');
            });
        }
    });
  };
  
  function citiesInRange(cities, fromCity, distanceInKm) {    

    let citiesInRange = cities.filter(toCity => getDistanceFromLatLonInKm(fromCity.latitude, fromCity.longitude, toCity.latitude, toCity.longitude) < distanceInKm)
    .filter(city => (city.guid !== fromCity.guid));
    return citiesInRange;
  };

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d.toFixed(2);
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }


  module.exports = addressesRoutes;
  