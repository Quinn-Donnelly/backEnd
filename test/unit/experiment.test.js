process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const experiment = require('../../models').experiment;

// Set up different chai methods
const assert = chai.assert;
const should = chai.should;
const expect = chai.expect;

chai.use(chaiHttp);

describe('Expirements', () => {
  // Preformed before each test (clears the data in the table)
  beforeEach(async () => {
    await experiment.destroy({truncate: true});
  });

  describe('/GET expirement', () => {
    it('Should return empty array when there is no expirements', async () => {
      try {
        const res = await chai.request(server).get('/experiment');
        // Test the headers
        expect(res.status).to.equal(200);

        // Test the response to have the appropriate structure
        expect(res.body.success).to.be.true;
        expect(res.body.err).to.be.null;
        expect(res.body.payload).to.be.an('array');
        expect(res.body.payload).to.be.empty;
      } catch (err) {
        assert.fail(true, false, err);
      }
    });

    it('Should return all expirements', async () => {
      // NOTE: This test does not test mutations of given data
      try {
        const testData = [
          {aid: 5, acid: 10, assay_name: 'Test the testing test'},
          {aid: 6, acid: 200, assay_name: 'I am ok, everything is fine'},
          {aid: 7, acid: 404, assay_name: 'Where the fuck am I'},
        ];
        await experiment.bulkCreate(testData);

        const res = await chai.request(server).get('/experiment');
        // Test the headers
        expect(res.status).to.equal(200);

        expect(res.body.payload).to.have.lengthOf(testData.length);
      } catch (err) {
        assert.fail(true, false, err);
      }
    });
  });

  describe('/POST experiment', () => {
    it('Should have have appropriate headers', async () => {
      const testData = {aid: 5};
      const res = await chai.request(server)
      .post('/experiment')
      .send(testData);

      expect(res.headers.location, 'Should have location header set')
            .to.match(new RegExp('/experiment/*[0-9]'));
      expect(res.status).to.equal(201);
    });

    it('Should filter out extra fields', async () => {
      try {
        const testData = {aid: 5, notValidProp: 'I should not exist'};
        const res = await chai.request(server)
        .post('/experiment')
        .send(testData);

        expect(res.body.payload.aid).to.equal(5);
        expect(res.body.payload).to.not.have.key('notValidProp');
      } catch (err) {
        assert.fail(true, false, err);
      }
    });
  });
});
