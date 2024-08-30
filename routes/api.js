"use strict";
const mongoose = require("mongoose");
const issueModel = require('../models').Issue;
const projectModel = require('../models').Project;

module.exports = function (app) {

  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let projectName = req.params.project;

      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on,
        updated_on,
        open,
        _id
      } = req.query;

      console.log(_id);

      // filter query issues
      projectModel.aggregate([
        { $match: { name: projectName } },
        { $unwind: '$issues' },
        // if query is defined match query else match nothing
        issue_title != undefined
        ? { $match: { 'issues.issue_title': issue_title } }
        : { $match: {} },
        issue_text != undefined
        ? { $match: { 'issues.issue_text': issue_text } }
        : { $match: {} },
        created_by != undefined
        ? { $match: { 'issues.created_by': created_by } }
        : { $match: {} },
        assigned_to != undefined
        ? { $match: { 'issues.assigned_to': assigned_to } }
        : { $match: {} },
        status_text != undefined
        ? { $match: { 'issues.status_text': status_text } }
        : { $match: {} },
        created_on != undefined
        ? { $match: { 'issues.created_on': new Date(created_on) } }
        : { $match: {} },
        updated_on != undefined
        ? { $match: { 'issues.updated_on': new Date(updated_on) } }
        : { $match: {} },
        open === 'true'
        ? { $match: { 'issues.open': open === 'true' } }
        : open === 'false'
        ? { $match: { 'issues.open': open === 'true' } }
        : { $match: {} },
        _id != undefined
        ? { $match: { 'issues._id': new mongoose.Types.ObjectId(`${_id}`) } }
        : { $match: {} },
      ])
      .then(data => {
        if(!data) {
          res.json([]);
        } else {
          let mapData = data.map(d => d.issues);
          res.json(mapData);
        }
      })
      .catch(err => console.log(err));


      // let query = req.query;
      // // query the database to get the created project
      // projectModel.find({ name: projectName })
      //   .then(data => {
      //     // return empty array if project name does not exist
      //     if (!data.length) {
      //       res.json(data);
      //     } else {
      //       // get all issues of the project
      //       let projectIssues = data[0].issues;
      //       // res.json(projectIssues);
      //       const queryKeys = Object.keys(query);
      //       const queryValues = Object.values(query);
      //       let filteredData = projectIssues;
            
      //       for (let i = 0; i < queryKeys.length; i++) {
      //       filteredData = filteredData.filter(
      //       doc => doc[queryKeys[i]] === queryValues[i]
      //       );
      //       }
      //       res.json(filteredData);
    })

    .post(function (req, res) {
      let projectName = req.params.project;
      // declear all req.body variables at once
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      // validate entries for issue_title, issue_text, created_by
      if (!issue_title || !issue_text || !created_by) {
        return res.json({
          error: 'required field(s) missing'
        });
      };

      const newIssue = new issueModel({
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to,
        status_text: status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      });
      projectModel.findOne({ name: projectName })
        .then((project) => {
          if (!project) {
            // create new project
            const newProject = new projectModel({ name: projectName });
            newProject.issues.push(newIssue);
            newProject
              .save()
              .then(() => res.json(newIssue))
              .catch((err) => console.log(err));
          } else {
            projectModel.findOneAndUpdate(project, {$push: {issues: newIssue }})
            .then(() => res.json(newIssue))
            .catch(err => console.log(err));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })

    .put(function (req, res) {
      let project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      } = req.body;

      if (
        _id ||
        issue_title ||
        issue_text ||
        created_by ||
        assigned_to ||
        status_text ||
        open
      ) {
        projectModel.findOne({ name: project })
          .then(projectData => {
            if (!projectData) {
              res.json({ error: 'could not update', '_id': _id })
            } else {
              // get issue record by id using id function
              const issueRec = projectData.issues.id(_id);
              // set update values
              issueRec.issue_title = issue_title || issueRec.issue_title;
              issueRec.issue_text = issue_text || issueRec.issue_text;
              issueRec.created_by = created_by || issueRec.created_by
              issueRec.assigned_to = assigned_to || issueRec.assigned_to;
              issueRec.status_text = status_text || issueRec.status_text;
              issueRec.open = open || issueRec.open;
              issueRec.updated_on = new Date().toISOString();
              projectData
                .save()
                .then(() => {
                  res.json({ result: 'successfully updated', '_id': _id })
                })
                .catch(err => {
                  res.json({ error: 'could not update', '_id': _id });
                  console.log(err);
                })
            }
          })
          .catch(err => console.log(err));
      } else {
        res.json({ error: 'no update field(s) sent', '_id': _id })
        console.log('nothing sent')
      }
      if (!_id) res.json({ error: 'missing _id' })
        // .then(projectData => {
        //   // get issue record by id using id function
        //   
        //   console.log()
        //   console.log(issueRec);
        //   if (!projectData.issues) {
        //     res.json({ error: 'could not update', '_id': _id });
        //   }
          
        // })
        // .catch(err => console.log(err))
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
