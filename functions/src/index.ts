import * as admin from 'firebase-admin';

admin.initializeApp();

//API
exports.create_business = require('./functions/CreateBusiness');
exports.submit_review = require('./functions/SubmitReview');

exports.link_click = require('./functions/LinkClick');
