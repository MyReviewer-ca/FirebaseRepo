import * as admin from 'firebase-admin';
admin.initializeApp();

//API
exports.create_business = require('./functions/CreateBusiness');
