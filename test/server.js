/**
 * Created by dob on 19.11.13.
 */
var app  = require(__dirname + '/../app.js');
var request = require('supertest');
var should = require('should');

describe('Req 1: General functionality', function(){
  before(function (done) {
    this.timeout(30000);
    setTimeout(done, 2000)
  });
  it('1.1 Test general availability', function(done){
    request(app.app)
      .get('/test')
      .expect(200)
      .end(function (err) {
        done(err);
      });
  });
});
