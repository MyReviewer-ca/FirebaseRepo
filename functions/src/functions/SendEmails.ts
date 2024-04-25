import {firestore} from 'firebase-admin';
import {onRequest} from 'firebase-functions/v2/https';
import {isDev} from '../index';
const {Firestore} = require('firebase-admin/firestore');
import fs = require('fs');
const nodemailer = require('nodemailer');

var db = firestore();

export = onRequest(async (request: any, response: any) => {
  //get post data of a 2d array of emails and the recipient's name

  const data = request.body;
  if (!data) {
    response.status(400).send({
      message: 'Missing required fields',
      success: false,
    });
    return;
  }

  if (!data.business_id) {
    response.status(400).send({
      message: 'Missing required fields (business_id)',
      success: false,
    });
    return;
  }

  if (!data.emails) {
    response.status(400).send({
      message: 'Missing required fields (emails)',
      success: false,
    });
    return;
  }

  //Get the business data
  const businessDoc = await db.collection('businesses').doc(data.business_id).get();
  if (!businessDoc.exists) {
    response.status(400).send({
      message: 'Business not found',
      success: false,
    });
    return;
  }
  response.status(200).send({
    message: 'Emails sending..',
    success: true,
  });
  var businessData: any = businessDoc.data();
  var businessName = businessData.name;

  //Get the email template (email.html)
  const emailTemplate = fs.readFileSync('email.html', 'utf8');

  //Send the emails
  data.emails.forEach((email: any) => {
    try {
      //create a email document
      var docRef = db.collection('emails').doc();
      docRef.set({
        business_id: data.business_id,
        email: email[0],
        name: email[1],
        viewed: false,
        sent_at: Firestore.FieldValue.serverTimestamp(),
      });

      //send the email
      var to = email[0];
      var name = email[1];
      var subject = 'Review ' + businessName;
      var text = '';
      var html = emailTemplate
        .replaceAll('{business_name}', businessName)
        .replaceAll('{recipient_name}', name || 'Valued Customer')
        .replaceAll('{business_id}', data.business_id)
        .replaceAll('{email_id}', docRef.id)
        .replaceAll('{url}', isDev ? 'http://127.0.0.1:5005' : 'https://review.myreviewer.ca');

      sendEmail(to, subject, text, html);
    } catch (e) {
      console.log(e);
    }
  });

  function sendEmail(to: string, subject: string, text: string, html: string) {
    const mailTransport = nodemailer.createTransport({
      host: 'smtppro.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: 'no-reply@zwebsites.ca',
        pass: 'TBgCNpGgUiZ6vXz2',
      },
    });

    const mailOptions = {
      from: {
        name: 'MyReviewer.ca',
        address: 'no-reply@zwebsites.ca',
      },
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    mailTransport.sendMail(mailOptions, (err: any, info: any) => {
      if (err) {
        console.log('Error sending email: ', err);
      } else {
        console.log('Email sent: ', info.accepted[0]);
      }
    });
  }
});
