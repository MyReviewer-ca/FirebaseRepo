import * as admin from 'firebase-admin';
import {onRequest} from 'firebase-functions/v2/https';

const db = admin.firestore();

export = onRequest((request, response) => {
  const data = request.body;
  if (!data.name || !data.contact_email) {
    response.status(400).send({
      message: 'Missing name or contact_email',
      success: false,
    });
    return;
  }
  var dataToSave = {
    name: data.name || '',
    contact_email: data.contact_email || '',
    hubspot_company_id: data.hubspot_company_id || '',
    stripe_customer_id: data.stripe_customer_id || '',
    stripe_subscription_id: data.stripe_subscription_id || '',
    registered_on: admin.firestore.FieldValue.serverTimestamp(),
  };
  db.collection('businesses')
    .add(dataToSave)
    .then(() => {
      response.status(200).send({
        message: 'Business created successfully',
        success: true,
      });
    })
    .catch((error) => {
      console.error(error);
      response.status(500).send({
        message: 'Error creating business',
        success: false,
      });
    });
});
