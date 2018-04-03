process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
// const server = require('../../server');

// Set up different chai methods
const expect = chai.expect;

chai.use(chaiHttp);

describe('Dummy', () => {
  it('should have at least one test', () => {
    expect(true).to.equal(true);
  });
});
