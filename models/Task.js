const mongoose = require('mongoose');
const crypto = require('crypto');

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, required: true },
  dueDate: { type: Date },
  state: { type: String, default: 'todo' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareToken: { type: String, default: () => crypto.randomBytes(16).toString('hex') },
  checklist: [checklistItemSchema], // Use the new schema for checklist items
  assignedTo: [{ type: String }] // Changed to an array of strings

});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
