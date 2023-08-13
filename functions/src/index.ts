import * as functions from "firebase-functions";
import * as express from 'express';

let app = express();

app.post('/', (request, response)=>{
  console.log('request post');
  console.log(request);
  response.send("post received");
});


export const llaAppWebsite = functions.https.onRequest(app);
