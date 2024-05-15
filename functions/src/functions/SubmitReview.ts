import {firestore} from 'firebase-admin';
import {onRequest} from 'firebase-functions/v2/https';
const {Firestore} = require('firebase-admin/firestore');

var db = firestore();

export = onRequest(async (request: any, response: any) => {
  //open CORS
  response.set('Access-Control-Allow-Origin', '*');
  const data = request.body;
  if (!data.business_id || !data.rating) {
    response.status(400).send({
      message: 'Missing required fields',
      success: false,
    });
    return;
  }

  var dataToSave: any = {
    business_id: data.business_id || '',
    rating: data.rating || '',
    review: data.review || '',
    review_category: data.review_category || '',
    redirected_to_google: data.redirected_to_google || false,
    received_from: data.received_from || '',
    review_date: Firestore.FieldValue.serverTimestamp(),
  };

  if (data.received_from == 'link') {
    dataToSave.link_id = data.link_id || '';
    //update the link document
    const linkDoc = await db.collection('links').doc(data.link_id).get();
    var linkData: any = linkDoc.data();

    var newReviewCount = linkData.total_collected_reviews || 0;
    var newRedirectedCount = linkData.total_redirected || 0;
    if (data.redirected_to_google) {
      newRedirectedCount += 1;
    }
    await linkDoc.ref.update({
      total_collected_reviews: newReviewCount + 1,
      total_redirected: newRedirectedCount,
    });
  } else if (data.received_from == 'email') {
    dataToSave.email_id = data.email_id || '';
  }
  console.log(data.review_id);

  if (data.review_id) {
    //update review
    db.collection('businesses')
      .doc(data.business_id)
      .collection('reviews')
      .doc(data.review_id)
      .update(dataToSave)
      .then(() => {
        response.status(200).send({
          message: 'Review updated successfully',
          success: true,
          review_id: data.review_id,
        });
      })
      .catch((error) => {
        console.error(error);
        response.status(500).send({
          message: 'Error updating review',
          success: false,
        });
      });
  } else {
    //create review under business document
    db.collection('businesses')
      .doc(data.business_id)
      .collection('reviews')
      .add(dataToSave)
      .then((docRef) => {
        response.status(200).send({
          message: 'Review submitted successfully',
          success: true,
          review_id: docRef.id,
        });
      })
      .catch((error) => {
        console.error(error);
        response.status(500).send({
          message: 'Error submitting review',
          success: false,
        });
      });
  }
});
