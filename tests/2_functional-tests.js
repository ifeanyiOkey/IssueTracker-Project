const chaiHttp = require('chai-http');
const chai = require('chai');
// const assert = chai.assert;
const { expect, assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  let testDeleteId;
  this.timeout(5000);
  // Test_1
  test('Create an issue with every field', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test')
      .send({
        issue_title: 'Jet printer',
        issue_text: 'Not printing',
        created_by: 'Jane',
        assigned_to: 'Jeff',
        status_text: 'Wrong cartridge'
      })
      .end((err, res) => {
        const body = res.body;
        assert.equal(res.status, 200);
        assert.equal(body.issue_title, 'Jet printer');
        assert.equal(body.issue_text, 'Not printing');
        assert.equal(body.created_by, 'Jane');
        assert.equal(body.assigned_to, 'Jeff');
        assert.equal(body.status_text, 'Wrong cartridge');
        assert.equal(body.open, true);
        assert.property(body, '_id');
        testDeleteId = res.body._id;
        done();
      });
  });
  // Test_2
  test('Create an issue with only required fields', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test')
      .send({
        issue_title: 'Dell laptop',
        issue_text: 'Not coming up',
        created_by: 'Juliet'
      })
      .end((err, res) => {
        const body = res.body;
        assert.equal(body.issue_title, 'Dell laptop');
        assert.equal(body.issue_text, 'Not coming up');
        assert.equal(body.created_by, 'Juliet');
        assert.equal(body.assigned_to, '');
        assert.equal(body.status_text, '');
        assert.property(body, '_id');
        done();
      });
  });
  // Test_3
  test('Create an issue with missing required fields', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/test')
      .send({
        created_by: 'Joan'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"required field(s) missing"}')
        done();
      });
  });
  // Test_4
  test('View issues on a project', (done) => {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/test')
      .query({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'Is array')
        done();
      })
  })

  // Test_5
  test('View issues on a project with one filter', (done) => {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/test')
      .query({ created_by: 'Juliet' })
      .end((err, res) => {
        const doc = res.body[0];
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(doc.created_by, 'Juliet');
        assert.property(doc, 'issue_title');
        assert.property(doc, 'issue_text');
        assert.property(doc, 'created_by');
        assert.property(doc, 'assigned_to');
        assert.property(doc, 'status_text');
        assert.property(doc, 'created_on');
        assert.property(doc, 'updated_on');
        assert.property(doc, 'open');
        assert.property(doc, '_id');
        done();
      });
  });
  // Test_6
  test('View issues on a project with multiple filters', (done) => {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/test')
      .query({ created_by: 'Juliet', issue_title: 'Dell laptop' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body[0].created_by, 'Juliet');
        assert.equal(res.body[0].issue_title, 'Dell laptop');
        assert.property(res.body[0], 'open');
        done();
      });
  });
  // Test_7
  test('Update one field on an issue', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test')
      .send({
        _id: testDeleteId,
        status_text: 'Replace power not ready'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(
          res.text,
          '{"result":"successfully updated","_id":"'+testDeleteId+'"}'
        );
        expect(res.body._id).to.equal(testDeleteId);
        done();
      });
  });
  // Test_8
  test('Update multiple fields on an issue', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test')
      .send({
        _id: testDeleteId,
        assigned_to: 'Ifeanyi',
        status_text: 'Replace power, not ready',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(
          res.text,
          '{"result":"successfully updated","_id":"'+testDeleteId+'"}'
        );
        expect(res.body._id).to.equal(testDeleteId);
        done();
      });
  });
  // Test_9
  test('Update an issue with missing _id', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test')
      .send({ assigned_to: 'Ifeanyi' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"missing _id"}');
        done();
      });
  });
  // Test_10
  test('Update an issue with no fields to update', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test')
      .send({ _id: testDeleteId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"no update field(s) sent","_id":"'+testDeleteId+'"}');
        done();
      });
  });
  // Test_11
  test('Update an issue with an invalid _id', (done) => {
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/test')
      .send({
        _id: '66c9d1c253cfa16603e2878',
        issue_title: 'New'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"could not update","_id":"66c9d1c253cfa16603e2878"}');
        done();
      });
  });
  // Test_12
  test('Delete an issue', (done) => {
    chai
      .request(server)
      .keepOpen()
      .del('/api/issues/test')
      .send({ _id: testDeleteId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"result":"successfully deleted","_id":"'+testDeleteId+'"}');
        done();
      });
  });
  // Test_13
  test('Delete an issue with an invalid _id', (done) => {
    chai
      .request(server)
      .keepOpen()
      .del('/api/issues/apitest')
      .send({_id: '66c9d0f353ca16603e2876e'})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"could not delete","_id":"66c9d0f353ca16603e2876e"}');
        done();
      });
  });
  // Test_14
  test('Delete an issue with missing _id', (done) => {
    chai
      .request(server)
      .keepOpen()
      .del('/api/issues/apitest')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"missing _id"}');
        done();
      });
  });
});
