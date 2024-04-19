import * as admin from 'firebase-admin';
import {onRequest} from 'firebase-functions/v2/https';

const db = admin.firestore();

export = onRequest((request, response) => {
  const data = request.body;
  if (!data.link_type) {
    response.status(400).send({
      message: 'Missing link_type',
      success: false,
    });
    return;
  }
  var dataToSave: any = {
    link_type: data.link_type || '',
  };

  //If the link is a business link, we need to save the business reference
  if (data.business_id) {
    dataToSave['business_ref'] = db.collection('businesses').doc(data.business_id);
  }

  //Create Link document
  db.collection('links')
    .add(dataToSave)
    .then((docRef) => {
      response.status(200).send({
        message: 'Link created successfully',
        success: true,
        link_id: docRef.id,
      });
      //update link doc with the link_id
      docRef.update({link_id: docRef.id});
    })
    .catch((error) => {
      console.error(error);
      response.status(500).send({
        message: 'Error creating link',
        success: false,
      });
    });
});
