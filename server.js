const express = require("express");
const http = require("http");

const apiFetch = require("./apiFetch"); // Just by requiring this file it executes

const port = 3000; //Will only run locally on port 3000
const app = express();

const server = http.createServer(app); //Create the server

//Listen on local port
server.listen(port, () => console.log(`Server started on port ${port}`));
