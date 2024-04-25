import {firestore} from 'firebase-admin';
import {onRequest} from 'firebase-functions/v2/https';
const {Firestore} = require('firebase-admin/firestore');

var db = firestore();

export = onRequest(async (request: any, response: any) => {
  //open CORS
  response.set('Access-Control-Allow-Origin', '*');

  //get email_id from query string
  const email_id = request.query.email_id;
  if (!email_id) {
    //return a 1x1 red pixel image
    response.set('Content-Type', 'image/gif');
    response.send(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC', 'base64'));
    return;
  }

  //find email document by id and update the opened_at field and viewed field
  const emailDoc = await db.collection('emails').doc(email_id).get();
  if (!emailDoc.exists) {
    //return a 1x1 red pixel image
    response.set('Content-Type', 'image/gif');
    response.send(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC', 'base64'));
    return;
  }
  var emailData: any = emailDoc.data();
  if (!emailData.viewed) {
    await emailDoc.ref.update({
      opened_at: Firestore.FieldValue.serverTimestamp(),
      viewed: true,
    });
  }

  //return a 1x1 pixel image
  response.set('Content-Type', 'image/gif');
  response.send(Buffer.from('R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', 'base64'));
});
