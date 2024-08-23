"use strict";

const mongoose = require("mongoose");

module.exports = function (app) {
  // create project schema
  const issueSchema = new mongoose.Schema({
    project: { type: String },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    created_on: { type: Date, default: new Date() },
    updated_on: Date,
    open: { type: Boolean, default: true },
  });

  const Issue = mongoose.model("Project", issueSchema);

  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let project = req.params.project;
      let query = req.query;
      query.project = project;
      console.log(query);
      // query the database to get the created project ID
      Issue.find(query)
        .then(issues => {
          let result = issues.map(x => {
            return {
              _id: x.id,
              issue_title: x.issue_title,
              issue_text: x.issue_text,
              created_by: x.created_by,
              assigned_to: x.assigned_to,
              status_text: x.status_text,
              created_on: x.created_on,
              updated_on: x.updated_on,
              open: x.open
            }
          });
          res.json(result)
        })
        .catch((err) => {
          console.log(err);
        });
    })

    .post(function (req, res) {
      let project = req.params.project;
      console.log(project);
      // declear all req.body variables at once
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on,
      } = req.body;
      // validate entries for issue_title, issue_text, created_by
      if (!issue_title || !issue_text || !created_by) {
        return res.json({
          error: 'required field(s) missing'
        });
      };

      const newIssue = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        open: true,
      });
      newIssue
        .save()
        .then((data) => {
          console.log(data._id);
          res.json({
            _id: data._id,
            issue_title: data.issue_title,
            issue_text: data.issue_text,
            created_on: data.created_on,
            updated_on: data.updated_on,
            created_by: data.created_by,
            assigned_to: data.assigned_to,
            status_text: data.status_text,
          });
        })
        .catch((err) => console.log(err));
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
