let sdk = require('postman-collection');
let urlData = new sdk.Url(request.url);

let endpoint = "/" + urlData.path.join("/");
let privateKey = pm.environment.get("private_key");
let unixTime = Math.floor(new Date() / 1000);
pm.environment.set("time", unixTime);

let params = getParams();
params['time'] = unixTime;

let verification = generateVerification(params, endpoint, unixTime, params['key'], privateKey);

pm.environment.set("verification", verification);

function generateVerification (params, endpoint, unixTime, publicKey, privateKey) {
    params = [publicKey, unixTime, endpoint, urlEncode(params)]

    return CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA512, privateKey).update(params.join('|')).finalize().toString(CryptoJS.enc.Hex);
}

function urlEncode (data) {
    let key;
    let out = [];

    for (key in data) {
      out.push(key + '=' + encodeURIComponent(data[key]));
    }

    return out.join('&');
}

function getDataValue (value) {
  if (value.startsWith("{{") && value.endsWith("}}")) {
    return pm.environment.get(value.replace(/[{}]/g, '').trim());
  }

  return value;
}

function getParams () {
  let requestParams = pm.request.url.query.all();
  let params = {};
  let index;

  if (pm.request.method == 'POST') {
    requestParams = pm.request.body.urlencoded.all();
  }

  for (index in requestParams) {
    if (requestParams[index].key == 'verification') {
      continue;
    }
    params[requestParams[index].key] = getDataValue(requestParams[index].value);
  }

  return params;
}
