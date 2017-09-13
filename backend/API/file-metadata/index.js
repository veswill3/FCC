const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = module.exports = express();

app.get('/file-metadata', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/file-metadata/get-file-size',
         multer({ dest: '.' }).single('file-upload'),
         function(req, res) {
    if (req.file) {
        let { path, size } = req.file;
        // delete the file and then send the size
        fs.unlink(path, () => res.json({ size }));
    } else {
        res.json({ error: 'no file provided' });
    }
});