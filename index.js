// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const winston = require('winston');
// const CryptoJS = require('crypto-js');
// const axios = require('axios');
// const CircularJSON = require('circular-json');

// const app = express();
// const PORT = process.env.PORT || 8080;
// const signingSecret = process.env.SIGNING_SECRET || '';

// // Configure the logger
// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.Console()
//   ]
// });

// app.use(bodyParser.json()); // Parse request body as JSON

// // Parse URLEncoded and save the raw body to req.rawBody
// app.use(
//   express.urlencoded({
//     verify: (req, res, buf) => {
//       req.rawBody = buf;
//     },
//     limit: '1mb',
//     extended: true,
//     type: 'application/x-www-form-urlencoded'
//   })
// );

// app.get('/*', (req, res) => {
//   res.send('Hello world');
// });

// // Listen for POST requests to '/webhook'
// app.post('/webhook', (req, res) => {
//   // Get the signature header
//   const signature = req.header('Trengo-Signature') || '';
//   // Get the raw request body
//   const payload = req.rawBody || '';

//   // Verify the signature
//   if (verifySignature(payload, signature, signingSecret)) {
//     // Signature is valid
//     const ticket = req.body;
//     logger.info('Received request payload:', JSON.stringify(ticket)); // Log the request payload

//     // Check if the ticket object is null or empty
//     if (!ticket) {
//       logger.error('No ticket object received');
//       res.status(400).json({ success: false, message: 'Invalid request payload' });
//       return;
//     }

//     const message = ticket && ticket.message ? ticket.message : 'New ticket received';

//     // Include the code for serializing the ticket object to remove circular references
//     try {
//       // Remove circular references before serializing
//       const sanitizedData = CircularJSON.stringify(ticket);

//       // Now you can use the sanitizedData in your application insights code
//       // Customize the code below to perform your desired action with the sanitized data
//       logger.info('Sanitized ticket data:', sanitizedData);
//     } catch (error) {
//       console.error('Failed to serialize payload:', error);
//     }

//     logger.info('Received ticket:', JSON.stringify(ticket)); // Log the received ticket object
//     logger.info('Message:', message); // Log the message

//     // Additional log statements
//     logger.info('Street Address:', ticket.streetAddress);
//     logger.info('Maintenance Description:', ticket.maintenanceDescription);
//     logger.info('Your Name:', ticket.yourName);
//     logger.info('Flat Letter:', ticket.flatLetter);
//     logger.info('Contact Number:', ticket.contactNumber);
//     logger.info('Photos:', ticket.photos);

//     // Check if the ticket is assigned to the specific team
//     if (ticket.team_id === '346034') {
//       fetchTicketInformation(ticket.ticket_id)
//         .then(ticketInfo => {
//           logger.info('Ticket Information:', JSON.stringify(ticketInfo));
//           // Remove the _httpMessage property from the TLSSocket object (if present)
//           if (ticketInfo.socket && ticketInfo.socket._httpMessage) {
//             delete ticketInfo.socket_httpMessage;
//           }

//           // Serialize the `ticketInfo` object to JSON.
//           const json = JSON.stringify(ticketInfo);

//           // Send the JSON response.
//           res.json(json);
//         })
//         .catch(error => {
//           logger.error('Failed to fetch ticket information:', error);
//           res.status(500).json({ success: false, message: 'Failed to fetch ticket information' });
//         });
//     } else {
//       res.json({ success: true, message: 'Ticket not assigned to the specific team' });
//     }
//   } else {
//     // Invalid signature
//     res.status(401).send('Unauthorized');
//     logger.error('Invalid signature, please verify the signing secret');
//   }
// });

// // Function to verify the Trengo signature
// function verifySignature(payload, signature, signingSecret) {
//   // Split the timestamp from the hash
//   const signatureParts = signature.split(';');
//   const timestamp = signatureParts[0];
//   const signatureHash = signatureParts[1];

//   // Generate a hash to compare with
//   // 1. Get the raw digest bytes
//   let hash = CryptoJS.HmacSHA256(timestamp + '.' + payload, signingSecret);

//   // 2. Encode the raw bytes as hexadecimal digits
//   hash = hash.toString(CryptoJS.enc.hex);

//   // 3. Make the hexadecimal digits lowercase
//   hash = hash.toLowerCase();

//   // Compare our generated hash to the hash from the 'Trengo-Signature' header.
//   // If they are the same, the signature is valid.
//   return hash === signatureHash;
// }

// // Function to send WhatsApp message and return the ticket ID
// function sendWhatsAppMessage(ticket) {
//   // Your logic to send the WhatsApp message
//   // ...

//   // Log the ticket object
//   logger.info('THE TICKET OBJECT IS:', ticket);
//   // Return the ticket ID
//   logger.info('THE TICKET ID IS:', ticket.ticket_id);
//   return ticket.ticket_id;
// }

// // Function to fetch ticket information from Trengo API based on ticket ID
// async function fetchTicketInformation(ticketId) {
//   try {
//     const response = await axios.get(`https://api.trengo.com/tickets/${ticketId}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.TRENGO_API_TOKEN}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     let ticketInfo = response.data;

//     // Remove the circular reference in the `socket` object
//     if (ticketInfo.socket && ticketInfo.socket._httpMessage) {
//       delete ticketInfo.socket._httpMessage;
//     }

//     // Convert the ticketInfo object to JSON
//     ticketInfo = JSON.stringify(ticketInfo);

//     return ticketInfo;
//   } catch (error) {
//     throw error;
//   }
// }

// app.listen(PORT, () => {
//   logger.info(`Server is running on port ${PORT}`);
// });









require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('isomorphic-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Parse JSON request body
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/webhook', async (req, res) => {
  const {
    ticket_id,
    user_id,
    user_name,
    user_email,
    team_id,
    team_name,
    assigned_to,
  } = req.body;

  console.log('Received webhook:');
  console.log('Ticket ID:', ticket_id);
  console.log('User ID:', user_id);
  console.log('User Name:', user_name);
  console.log('User Email:', user_email);
  console.log('Team ID:', team_id);
  console.log('Team Name:', team_name);
  console.log('Assigned To:', assigned_to);


  // const {
  //   ticket_id,
  //   message,
  //   streetAddress,
  //   maintenanceDescription,
  //   yourName,
  //   flatLetter,
  //   contactNumber,
  //   photos,
  //   team_id,
  //   params,
  // } = req.body;

  // console.log('REQ.BODY:', req.body)
  // console.log('Received ticket:', streetAddress); // Log the received ticket object

  // const ticketMessage = `New ticket received from ${yourName} at ${streetAddress}` || 'New ticket received';

  // console.log('Message:', ticketMessage); // Log the message

  try {
    await sendWhatsAppMessage(ticketMessage, ticket_id);
    res.json({ success: true, message: 'WhatsApp message sent successfully', ticket: req.body });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    res.status(500).json({ success: false, message: 'Failed to send WhatsApp message' });
  }
});

async function sendWhatsAppMessage(ticketMessage, ticketId) {
  console.log('Calling sendWhatsAppMessage');

  const options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
      'accept': 'application/json',
      'content-type': 'application/json'
    },
  };

  try {
    // Make the GET request to retrieve the ticket result
    const response = await fetch(`https://app.trengo.com/api/v2/ticket_results/${ticketId}`, options);
    const data = await response.json();
    console.log('Ticket Result:', data);

    const sendMessageOptions = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        params: [{ key: '{{1}}', value: ticketMessage }],
        recipient_phone_number: '+27784130968',
        hsm_id: '136514' // Replace with your WhatsApp template HSM ID
      })
    };

    const sendResponse = await fetch('https://app.trengo.com/api/v2/wa_sessions', sendMessageOptions);
    const sendData = await sendResponse.json();
    console.log('API Response:', sendData);
  } catch (error) {
    console.error(error);
    throw error;
    }

  // try {
  //   const response = await fetch('https://app.trengo.com/api/v2/wa_sessions', options);
  //   const data = await response.json();
  //   console.log('API Response:', data);
  // } catch (error) {
  //   console.error(error);
  //   throw error;
  // }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






