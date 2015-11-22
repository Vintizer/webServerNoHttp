/**
 * Created by vintizer on 25.10.15.
 */
"use strict";

var net = require('net');
var fs = require('fs');
var mime = require('mime');
var Readable = require('stream').Readable;
var util = require('util');
util.inherits(ReadableStream, Readable);
var port = process.env.PORT ||3000;
var rawBuffer = new Buffer('');
var writableStream;
var request= {};
var count = 10;
var read = true;
var borderStream;
function ReadableStream(connection, firstChunk) {
  Readable.call(this);
  console.log('firstChunk', firstChunk.toString(), 'end chunk\r\n');
  this.push(firstChunk);
  connection.on('readable', function() {
    console.log('read', connection.read(100),'end read\r\n');
  })
}
ReadableStream.prototype._read = function(){

};
//borderStream.on('data', function(chunk) {
//  console.log('chunk', chunk.toString());
//});
//borderStream.on('end', function() {
//  console.log('end');
//});
function findBoundary(arr) {
  var boundary;
  arr.forEach(function(data){
    if(data.indexOf('boundary') > -1){
      boundary = data.split('=')[1];
    }
  });
  return boundary;
}
function fullDataToServer(s, request, file, fileType){
  try {
    file = fs.readFileSync('./public' + request.path);
  } catch(e) {
    file = '';
  }
  s.write('HTTP/1.0 200 Done\r\n');
  s.write('Content-Type: ' + fileType + ';\r\n');
  s.write('\r\n');
  if (file) {
    s.write(file);
  }
  s.end();

}
function parseRequest(data) {
  data = data.toString().split('\r\n');
  request.method = data[0].split(' ')[0];
  request.path = data[0].split(' ')[1];
  if (data[0].split(' ')[2]) {
    request.protocolVersion = data[0].split(' ')[2].split('/')[1];
  }
  request.headers = {};
  request.fileType = mime.lookup('./public' + request.path);
  request.boundary = findBoundary(data);
  for (var i = 1; i < data.length - 1; i++) {
    if (data[i].split(':')[0] === '') {
      break;
    }
    request.headers[data[i].split(':')[0]] = data[i].split(':')[1];
    //console.log('[data[i].split()[0]]',[data[i].split(':')[0]]);
  }
  if(request.path == '/'){
    request.path = '/index.html';
  }

}
var server = net.createServer(function(s) { //'connection' listener
  var fileType;
  var file;
  var fullData = '';
  var dataToHeaders = true;
  s.on('data', function(dataBuf) {
    writableStream = fs.createWriteStream('file2.txt');
    rawBuffer = Buffer.concat([rawBuffer, dataBuf]);
    //console.log(rawBuffer.toString());
    if (dataToHeaders) {
      if (rawBuffer.indexOf('\r\n\r\n') > -1) {
        //console.log('-1!!!!!!!\r\n', rawBuffer.toString());
        dataToHeaders = false;

        var index = rawBuffer.indexOf('\r\n\r\n');
        //console.log('rawBuffer.slice(0,index)' + rawBuffer.slice(index+2).toString());
        parseRequest(rawBuffer.slice(0, index + 2));

        if (request.headers['Content-Type'] && request.headers['Content-Type'].indexOf('multipart/form-data') > -1) {
          borderStream = new ReadableStream(s, rawBuffer.slice(index + 2))
        }
        //console.log('request',request);


        fullDataToServer(s, request, file, fileType);
        fullData ='';
      }else {
        //console.log('indexOf in dataHeaders', rawBuffer.toString());
      }
    } else {
      //console.log('indexOf',rawBuffer.toString());
    }


  });
  s.on('end', function() {
    //console.log('client disconnected');
  });
  //console.log('fileType', fileType);
});
server.listen(port, function() { //'listening' listener
  console.log('server bound on ' + port);
});

//GET /favicon.ico HTTP/1.1
//Host: localhost:3000
//Connection: keep-alive
//User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/45.0.2454.101 Chrome/45.0.2454.101 Safari/537.36
//Accept: */*
// Referer: http://localhost:3000/index.html
// Accept-Encoding: gzip, deflate, sdch
// Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4
// Cookie: __ngDebug=true; __ngDependencyGraph=ngFit; gsScrollPos=
//
//


