const mongoose = require('mongoose');

const conversationsSchema = new mongoose.Schema({
    member1: String,
    member2: String,
});

const Conversations = mongoose.model('Conversations', conversationsSchema,'Conversations');

module.exports = Conversations;
