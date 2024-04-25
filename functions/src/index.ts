import * as firebase from 'firebase-admin';
export const isDev = true;
firebase.initializeApp();

//API
exports.create_business = require('./functions/CreateBusiness');
exports.submit_review = require('./functions/SubmitReview');

exports.link_click = require('./functions/LinkClick');
exports.tracking_pixel = require('./functions/TrackingPixel');

exports.send_emails = require('./functions/SendEmails');
