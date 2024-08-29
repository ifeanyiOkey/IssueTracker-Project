const mongoose = require("mongoose");
const { Schema } = mongoose;

// create project schema
const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: Date,
  updated_on: Date,
  open: Boolean,
});

const projectSchema = new Schema({
    name: { type: String, required: true },
    issues: [issueSchema]
});

const Issue = mongoose.model('Issue', issueSchema);
const Project = mongoose.model('Project', projectSchema);

exports.Issue = Issue;
exports.Project = Project;
