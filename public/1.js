/**
 * Created by vintizer on 29.10.15.
 */
for (var i = 0; i < 8; i++) {
  setTimeout((function(c){
    return function () {
      if (c === 7) {
        console.log('write last');
      } else {
        console.log('write from ',c*50, ' to ', c*50+50);
        //client.write(req.slice(c*50, 50));
      }
    }
  })(i), i*1000);
}