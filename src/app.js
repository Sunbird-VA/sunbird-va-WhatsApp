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

module.exports = { app }