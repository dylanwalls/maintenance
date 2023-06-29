require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('isomorphic-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // Parse request body as JSON

app.post('/webhook', async (req, res) => {
  const ticket = req.body; // Access the ticket object from the 'payload' property
  console.log('Received request payload:', ticket); // Log the request payload
  const message = ticket && ticket.message ? ticket.message : 'New ticket received';

  console.log('Received ticket:', ticket); // Log the received ticket object
  console.log('Message:', message); // Log the message

  // Check if the ticket is assigned to the specific team
  if (ticket.team_id === '346034') {
    try {
      await sendWhatsAppMessage(ticket);
      res.json({ success: true, message: 'WhatsApp message sent successfully', ticket });
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      res.status(500).json({ success: false, message: 'Failed to send WhatsApp message' });
    }
  } else {
    res.json({ success: true, message: 'Ticket not assigned to the specific team' });
  }
});

async function sendWhatsAppMessage(ticket) {
  console.log('Calling sendWhatsAppMessage');

  const { streetAddress, maintenanceDescription, yourName, flatLetter, contactNumber, photos } = ticket;

  const message = `
    Ticket Information:
    Street Address: ${streetAddress}
    Maintenance Description: ${maintenanceDescription}
    Your Name: ${yourName}
    Flat Letter: ${flatLetter}
    Contact Number: ${contactNumber}
    Photos: ${photos}
  `;

  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYTkxMjBhMzE2NDUwYzI1ZGMwNDQ4YzlhYWYyYjM5OGVkN2I3YmJkYjkwMDQ0NWEwNWU1ODVhOTc3MGJhNzNhNjFlZmM2YjllNzBmM2I0OTYiLCJpYXQiOjE2ODgwMjExMTkuOTAyNzk3LCJuYmYiOjE2ODgwMjExMTkuOTAyODAxLCJleHAiOjQ4MTIxNTg3MTkuODkxODg1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.lTi2ZsFLyVPTU8b8dshn3aJ8i5AXNxrnTFab_boV5EWUMyqLT41pvZmbXFnmSJdIs2HORvwBWz6k6lYgTNepng',
      'accept': 'application/json',
      'content-type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    },
    body: JSON.stringify({
      params: [{ key: '{{1}}', value: message }],
      recipient_phone_number: '+27784130968',
      hsm_id: '136514' // Replace with your WhatsApp template HSM ID
    })
  };

  try {
    const response = await fetch('https://app.trengo.com/api/v2/wa_sessions', options);
    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const fetch = require('isomorphic-fetch');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(bodyParser.urlencoded({ extended: false })); // Use body-parser to parse URL-encoded data

// app.post('/webhook', async (req, res) => {
//   const ticket = req.body;
//   console.log(ticket);
//   const message = ticket.message ? ticket.message : 'New ticket received';

//   console.log('Received ticket:', ticket); // Log the received ticket object
//   console.log('Message:', message); // Log the message

//   try {
//     await sendWhatsAppMessage(message);
//     res.json({ success: true, message: 'WhatsApp message sent successfully', ticket });
//   } catch (error) {
//     console.error('Failed to send WhatsApp message:', error);
//     res.status(500).json({ success: false, message: 'Failed to send WhatsApp message' });
//   }
// });

// async function sendWhatsAppMessage(message) {
//   console.log('Calling sendWhatsAppMessage');
  
//   const options = {
//     method: 'POST',
//     headers: {
//         'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjA0ZjA4OWJlNzdjNWZkMTc5ZDY0NDcyNGRlMDZkNDRiNGUyOGY2NWE2NmE3NTA4YTAxZWU5YTczNjMxYjRkNWY5NmEzMDZhNjE4NTA1MzYiLCJpYXQiOjE2ODc0MTkwMTkuNjgyNjY0LCJuYmYiOjE2ODc0MTkwMTkuNjgyNjY4LCJleHAiOjQ4MTE1NTY2MTkuNjc0MDcyLCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.ecmX4Wlwhr1VllYQine5POyT4CTc3Zl41LIvetG8uOQuKD6jTQYVsKsWIb9PV1IkX5c1SHAAQ8LU6_rgIoD5DA',
//         'accept': 'application/json',
//         'content-type': 'application/json'
//     },
//     body: JSON.stringify({
//       params: [{ key: '{{1}}', value: message }],
//       recipient_phone_number: '+27784130968',
//       hsm_id: '136514' // Replace with your WhatsApp template HSM ID
//     })
//   };

//   try {
//     const response = await fetch('https://app.trengo.com/api/v2/wa_sessions', options);
//     const data = await response.json();
//     console.log('API Response:', data);
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



