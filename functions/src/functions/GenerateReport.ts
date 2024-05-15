import {firestore} from 'firebase-admin';
import {onRequest} from 'firebase-functions/v2/https';
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');

var db = firestore();

export = onRequest(async (request: any, response: any) => {
  //get post data
  var data = request.body;
  if (data.business_id == undefined || data.business_id == '') {
    return response.status(400).send({
      message: 'Missing required fields (business_id)',
      success: false,
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(data.send_email)) {
    return response.status(400).send({
      message: 'Invalid email address',
      success: false,
    });
  }

  var business_name = '';

  var startDate = data.start_date ? new Date(data.start_date) : new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
  var endDate = data.end_date ? new Date(data.end_date) : new Date();

  response.status(200).send({
    message: 'Report generation started. You will receive an email shortly with the report.',
    success: true,
  });
  var about: any[][] = [];
  var emails: any[][] = [['id', 'email', 'name', 'sent date', 'viewed', 'opened at']];
  var links: any[][] = [['id', 'name', 'type', 'created on', 'total clicks', 'total collected reviews', 'total redirected']];
  var reviews: any[][] = [['id', 'rating', 'feedback', 'feedback_category', 'review date', 'redirected to google', 'received_from', 'email_id', 'link_id']];

  //get business data

  //#region get business data
  var businessRef = db.collection('businesses').doc(data.business_id);
  var business = await businessRef.get();
  if (!business.exists) {
    return response.status(400).send({
      message: 'Business not found',
      success: false,
    });
  }

  var businessData: any = business.data();
  business_name = businessData.name || '';
  //get key value pairs of about
  for (var key in businessData) {
    if (key == 'registered_on') {
      businessData[key] = businessData[key].toDate().toLocaleString();
    } else {
      businessData[key] = businessData[key].toString();
    }
    about.push([key, businessData[key]]);
  }

  //#endregion

  //#region get emails
  var emailsRef = db.collection('emails').where('business_id', '==', data.business_id).where('sent_at', '>=', startDate).where('sent_at', '<=', endDate);
  var emailsSnapshot = await emailsRef.get();
  emailsSnapshot.forEach((doc: any) => {
    if (!doc.exists) return;
    var emailData: any = doc.data();
    emails.push([
      doc.id,
      emailData.email,
      emailData.name,
      emailData.sent_at.toDate().toLocaleString(),
      emailData.viewed,
      emailData.opened_at ? emailData.opened_at.toDate().toLocaleString() : '',
    ]);
  });
  //#endregion

  //#region get links
  var linksRef = db.collection('links').where('business_id', '==', data.business_id);

  var linksSnapshot = await linksRef.get();
  linksSnapshot.forEach((doc: any) => {
    if (!doc.exists) return;
    var linkData: any = doc.data();
    links.push([
      doc.id,
      linkData.name || '',
      linkData.type || '',
      linkData.created_on.toDate().toLocaleString(),
      linkData.total_clicks || 0,
      linkData.total_collected_reviews || 0,
      linkData.total_redirected || 0,
    ]);
  });
  //#endregion

  //#region get reviews
  var reviewsRef = db.collection('businesses').doc(data.business_id).collection('reviews').where('review_date', '>=', startDate).where('review_date', '<=', endDate);
  var reviewsSnapshot = await reviewsRef.get();
  reviewsSnapshot.forEach((doc: any) => {
    if (!doc.exists) return;
    var reviewData: any = doc.data();
    reviews.push([
      doc.id,
      reviewData.rating || 0,
      reviewData.review || '',
      reviewData.review_category || '',
      reviewData.review_date.toDate().toLocaleString(),
      reviewData.redirected_to_google || false,
      reviewData.received_from || '',
      reviewData.email_id || '',
      reviewData.link_id || '',
    ]);
  });

  createExcel([about, emails, links, reviews]);

  async function createExcel(data3D: any) {
    const workbook = new ExcelJS.Workbook();
    var sheetNames = ['About', 'Emails', 'Links', 'Reviews'];

    // Iterate over each sheet data in 3D array
    data3D.forEach((sheetData: any, index: number) => {
      const sheet = workbook.addWorksheet(sheetNames[index]);

      // Add rows to the sheet
      sheetData.forEach((row: any) => {
        sheet.addRow(row);
      });
    });

    // Write to a file
    const fileBuffer = await workbook.xlsx.writeBuffer();
    const base64 = fileBuffer.toString('base64');
    const filename = 'MyReviewer_Report_' + business_name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.xlsx';
    +'.xlsx';
    sendEmail(
      data.send_email,
      `MyReviewer.ca Report for ${business_name}\nStart Date: ${startDate.toLocaleDateString()}\nEnd Date: ${endDate.toLocaleDateString()}`,
      base64,
      filename
    );
  }
  function sendEmail(to: string, text: string, base64: string, filename: string) {
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
      subject: 'Report for ' + business_name,
      text: text,
      attachments: [
        {
          filename: filename,
          content: base64,
          encoding: 'base64',
        },
      ],
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
