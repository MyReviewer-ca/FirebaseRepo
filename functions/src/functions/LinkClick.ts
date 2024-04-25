import {firestore} from 'firebase-admin';
import {onRequest} from 'firebase-functions/v2/https';
const {Firestore} = require('firebase-admin/firestore');

const db = firestore();

export = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  //get path
  const path = request.path;
  const regex = /\/l\/(.*)/;
  const match = path.match(regex);
  const link_id = match ? match[1] : null;
  console.log('link_id', link_id);

  if (!link_id) {
    response.redirect('/r/?page=error');
    return;
  } else {
    //get link doc
    const linkDoc = await db.collection('links').doc(link_id).get();
    if (!linkDoc.exists) {
      response.redirect('/#/r/?page=error');
      return;
    }
    //get data
    const data: any = linkDoc.data();
    response.redirect(`/#/r/${data.business_id}?link_id=${link_id}`);
    var newClickCount = data.total_clicks || 0;
    newClickCount += 1;
    await linkDoc.ref.update({total_clicks: newClickCount});
    await db.collection('links').doc(link_id).collection('clicks').add({
      click_date: Firestore.FieldValue.serverTimestamp(),
    });
  }
});
