// imports
const request = require('request-promise');

// returns a promise
function makeAPICall (apiKey, query, variables) {
  // set payload of post request
  const data = {
    url: 'https://api.monday.com/v2',
    headers: { Authorization: apiKey },
    json: true,
    body: { query: query, variables: variables },
    resolveWithFullResponse: true
  };

  // make request
  return request.post(data)
    .then(function checkResponse (res) {
      // TODO: add error handling for monday.com errors
      // Status code != 200 should give some error
      // Errors can also appear with 200 code (RCURLY etc)
      // console.log(res.body.errors);
      if (!res) {
        throw new Error('Response is undefined.');
      }
      // check for permission error
      if (res.statusCode === 400) {
        throw new Error('Permission denied.');
      }
      // check for internal server error
      if (res.statusCode === 500) {
        throw new Error('Server responded with 500, internal server error.');
      }
      if (res.statusCode !== 200) {
        throw new Error('Bad request.');
      }
      // TODO: fix this. It never executes.
      if ('errors' in res.body) {
        console.log(res.body);
        throw new Error(res.body);
      }
      // console.log('API call successfully made. Results:\n', res.body);
      return res.body;
    })
    .catch((err) => {
      return err;
    });
}

module.exports.makeAPICall = makeAPICall;
