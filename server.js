/**
 * Created by vintizer on 25.10.15.
 */
var net = require('net');
var fs = require('fs');
var mime = require('mime');
var Readable = require('stream').Readable;
var util = require('util');
util.inherits(ReadableStream, Readable);
var port = process.env.PORT ||3000;
var writableStream;
var request= {};
function ReadableStream() {
  Readable.call(this);
}
ReadableStream.prototype._read = function(){
  //this.push('test chunk');
};
borderStream = new ReadableStream();
borderStream.on('data', function(chunk) {
  console.log('chunk', chunk);
});
borderStream.on('end', function() {
  console.log('end');
});
function findBoundary(arr) {
  var boundary;
  arr.forEach(function(data){
    if(data.indexOf('boundary') > -1){
      boundary = data.split('=')[1];
    }
  });
  return boundary;
}
//function dataInBoundary(data, obj){
//  var simpleObj= {};
//  data = data.split('\r\n\r\n');
//  simpleObj.content = {};
//  data.forEach(function(chunk) {
//    chunk = chunk.split('\r\n');
//
//  })
//
//}
function fullDataToServer(s, data, fullData, request, file, fileType){
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
  data = data.split('\r\n');
  request.method = data[0].split(' ')[0];
  request.path = data[0].split(' ')[1];
  request.protocolVersion = data[0].split(' ')[2].split('/')[1];
  request.headers = {};
  request.fileType = mime.lookup('./public' + request.path);
  request.boundary = findBoundary(data);
  for (var i = 1; i < data.length - 2; i++) {
    if (data[i].split(':')[0] === '') {
      break;
    }
    request.headers[data[i].split(':')[0]] = data[i].split(':')[1];
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
    debugger;
    var data = dataBuf.toString();
    //console.log("data is coming", data);
    fullData +=data;
    if (dataToHeaders) {
      if (fullData.indexOf('\r\n\r\n') > -1) {
        dataToHeaders = false;
        parseRequest(fullData.split('\r\n\r\n')[0]);
        var c = fullData.split('\r\n\r\n')[1];
        if (c) {
          console.log('---c--------',c);
        } else {
          console.log('dataBuf',dataBuf);
          //dataBuf.pipe(writableStream);
          debugger;
          console.log('not c',c);
        }

        fullDataToServer(s, data, fullData, request, file, fileType);
        fullData ='';
      }
    } else {
      console.log(data);
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


