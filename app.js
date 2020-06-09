const axios = require("axios");
const fs = require("fs");
const moment = require("moment");

let rawPayload = fs.readFileSync("payload.json");
let rawToken = fs.readFileSync("token");
let rawRequestCount = fs.readFileSync("requestCount");

let url = "http://13.251.42.108:8762/identity/userprofile/create";
//let url = "http://18.138.224.44:8080/userprofile/create";
// let url =
//   "http://lbcamunda-590073078.ap-southeast-1.elb.amazonaws.com:8080/engine-rest/process-definition/key/userprofilecreate/start";

let requestArray = [];
const headers = {
  "Content-Type": "application/json",
  Authorization: "bearer " + rawToken,
};
// creating your request.
for (i = 0; i < rawRequestCount; i++) {
  const randomMail = randomStirng(16) + "@mail.com";
  const body = JSON.parse(rawPayload);
  if (body.email) {
    body.email = randomMail;
    body.username = randomMail;
  }

  requestArray.push(
    axios.post(url, body, {
      headers: headers,
    })
  );
}
const startTime = moment();
console.log("Total Request Count:", requestArray.length);
console.log("Start:", startTime.format("YYYY-MM-DD hh:mm:ss"));
let responseArray = [];

// sending all the request
let faileCount = 0;
axios
  .all(requestArray)
  .then(
    axios.spread((...responses) => {
      responses.forEach((res) => {
        if (res != null) {
          responseArray.push({
            date: new Date(),
            id: res.data.response.id,
          });
        }
      });

      const endTime = moment();
      const duration = moment.duration(endTime.diff(startTime));

      console.log("End:", endTime.format("YYYY-MM-DD hh:mm:ss"));
      console.log("Process Count:", responseArray.length);
      console.log("Failed:", faileCount);
      console.log("Duration in ms:", duration.asMilliseconds());
      //console.log(responseArray);
    })
  )
  .catch((err) => {
    ++faileCount;
    console.log(err);
  });

function randomStirng(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
