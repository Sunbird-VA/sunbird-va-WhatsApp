"use strict";
const token = process.env.WHATSAPP_TOKEN;

// Imports dependencies and set up http server
require('dotenv').config()
const express = require("express");
const body_parser = require("body-parser");
const session = require('./session');  // Import session module
const service = require("./service")
const netcore = require("./netcore")

const app = express() // creates express http server

app.use(body_parser.json());
app.use(session);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening port:",process.env.PORT || 1337));

app.post("/webhook", service.webhook)

app.post("/testMessage", service.testMessage);

app.post("/netcore/webhook", netcore.webhook);




app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let verifyToken = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && verifyToken) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && verifyToken === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});


module.exports = { app }