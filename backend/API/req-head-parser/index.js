const express = require('express');
const app = module.exports = express();

app.get('/req-head-parser', function(req, res) {
    let ip = req.get('x-forwarded-for');
    ip = ip ? ip.split(',')[0] : req.ip;
    res.json({
        ipaddress: ip,
        language: req.get('accept-language').split(',')[0],
        software: req.get('user-agent').split(/\s*[)(]\s*/)[1]
    });
});