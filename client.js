/**
 * Created by vintizer on 25.10.15.
 */
var net = require('net');
var req = 'GET /index.html HTTP/1.1\r\n' +
'Host: localhost:3000\r\n' +
'Connection: keep-alive\r\n' +
'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/45.0.2454.101 Chrome/45.0.2454.101 Safari/537.36\r\n' +
'Accept: */*\r\n' +
'Referer: http://localhost:3000/index.html\r\n' +
'Accept-Encoding: gzip, deflate, sdch\r\n' +
'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4\r\n' +
'Cookie: __ngDebug=true; __ngDependencyGraph=ngFit; gsScrollPos=\r\n\r\n\r\n';
console.log(req);
var client = net.connect({port: 3000},
  function() { //'connect' listener
    console.log('connected to server!');
    var length = req.length;
    var packages = Math.floor(length/50);
    var last = length % 50;
    for (var i = 0; i < packages + 1; i++) {
      setTimeout((function(c){
        return function () {
          if (c === 8) {
            console.log('write last');
            client.write(req.slice(c*50, c*50+last));
          } else {
            console.log('write from ',c*50, ' to ', c*50+50);
            client.write(req.slice(c*50, c*50+50));
          }
        }
      })(i), i*500);
    }
  });
client.on('data', function(data) {
  console.log(data.toString());
  client.end();
});
client.on('end', function() {
  console.log('disconnected from server');
});
