/**
 * Created by dob on 19.11.13.
 */
var srv  = require(__dirname + '/../app.js');
var app = new srv();
var request = require('supertest');
var should = require('should');

describe('Req 1: General functionality', function(){
  before(function (done) {
    this.timeout(1000);
    done();
  });
  it('1.1 Test general availability', function(done){
    request(app.app)
      .get('/test')
      .expect(200)
      .end(function (err, res) {
        done();
      });
  });
});
