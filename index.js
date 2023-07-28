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

  // Check if the ticket is assigned to 'Maintenance'
  console.log('ASSIGNED TO: ', assigned_to);
  console.log("HEY");
  if (assigned_to !== 'Maintenance') {
    console.log('Ticket not assigned to Maintenance. Skipping script.');
    return res.json({ success: true, message: 'Ticket not assigned to Maintenance. No action required.' });
  }

  try {
    await sendWhatsAppMessage(ticket_id);
    return res.json({ success: true, message: 'WhatsApp message sent successfully', ticket: req.body });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return res.status(500).json({ success: false, message: 'Failed to send WhatsApp message' });
  }
});

async function sendWhatsAppMessage(ticketId) {
  console.log('Calling sendWhatsAppMessage');

  const options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
      'accept': 'application/json',
      'content-type': 'application/json'
    },
  };

  let maintenanceDescription, yourName, streetAddress, flatLetter, contactNumber;

  try {
    // Make the GET request to retrieve the ticket result
    const response = await fetch(`https://app.trengo.com/api/v2/tickets/${ticketId}`, options);
    const data = await response.json();
    console.log('Ticket Result:', data);
    const ticket_info = data.custom_data;
    maintenanceDescription = ticket_info['maintenanceDescription'];
    yourName = ticket_info['yourName'];
    streetAddress = ticket_info['streetAddress'];
    flatLetter = ticket_info['flatLetter']
    const contact = data.contact;
    contactNumber = contact['phone']

    console.log('Maintenance description:', maintenanceDescription);
    console.log('Your name:', yourName);
    console.log('Contact Address:', streetAddress);
    console.log('Flat:', flatLetter);
    console.log('Contact Number:', contactNumber);

    const message_final = `${yourName} at Flat ${flatLetter}, ${streetAddress}. Contact: ${contactNumber}. Description: ${maintenanceDescription}.` || 'New ticket received';

    const sendMessageOptions = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        params: [{ key: '{{1}}', value: message_final }],
        recipient_phone_number: '+27829447959', // Priscilla's number
        // recipient_phone_number: '+27784130968', // Dylan's number
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

    const now = new Date();
    const incidentDate = now.toISOString();  
    unit = flatLetter + streetAddress;

    const postMessageOptions = {
      method: 'POST',
      url: 'https://za-living-api-pub-01.indlu.co/public/api/external/workspace/endpoint/Submit',
      headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTFkZjRkMDE2MjgzYTE1YjI4NDY3YjAyNGQzNDdkZjBkN2YyNWZmMjBkNzA0MmU1NDYyYTU1OTM0YjVlYjNlMmM5M2IyZmY4NDFmYWViNGMiLCJpYXQiOjE2ODgzOTYyMDIuMzI0NTI5LCJuYmYiOjE2ODgzOTYyMDIuMzI0NTMxLCJleHAiOjQ4MTI1MzM4MDIuMzE0MzY1LCJzdWIiOiI2MDY4NTQiLCJzY29wZXMiOltdfQ.MGKjhmw8mY-6tji1z4rsOG_9BTLTYasN6vgTNUjiFUeukAMz0sSTz4sFtifzV2L5Go4JIBooGYLeaKQfFIMHEA',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'workspaceCode': 'MAN',
        'recaptchaSiteKey': 'f841b521-b8fd-413e-983e-ba17dccb862d',
        'payload': JSON.stringify({
          // 'building': {
          //   'id': 'ac9dd556-8a83-49e3-2393-08da6b352223',
          //   'buildingNo': 'IB-0000000144',
          // },
          // 'rentalUnit': {
          //   'id': '10b645ee-940d-45e3-f851-08da6b35226b',
          //   'refNo': 'ZAWC4935031311',
          // },
          'unit': unit,
          'contactName': yourName,
          'contactNumber': contactNumber,
          'incidentDate': incidentDate,
          'maintenanceDescription': maintenanceDescription,
        }),
      }),
    };

    const postResponse = await fetch(postMessageOptions.url, postMessageOptions);
    const postData = await postResponse.json();
    console.log('API Response:', postData);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






// 2023-07-04T07:22:40.523626151Z Ticket Result: {
//   2023-07-04T07:22:40.523755152Z   id: 686265080,
//   2023-07-04T07:22:40.524540757Z   status: 'OPEN',
//   2023-07-04T07:22:40.524551757Z   subject: null,
//   2023-07-04T07:22:40.524566557Z   closed_at: null,
//   2023-07-04T07:22:40.524571657Z   created_at: '2023-07-04 09:16:42',
//   2023-07-04T07:22:40.524575957Z   updated_at: '2023-07-04 09:22:37',
//   2023-07-04T07:22:40.524580057Z   user_id: null,
//   2023-07-04T07:22:40.524583857Z   team_id: 346034,
//   2023-07-04T07:22:40.524587658Z   assigned_at: '2023-07-04 09:22:37',
//   2023-07-04T07:22:40.524591658Z   team: {
//   2023-07-04T07:22:40.524595558Z     id: 346034,
//   2023-07-04T07:22:40.524611158Z     name: 'Maintenance',
//   2023-07-04T07:22:40.524615158Z     title: null,
//   2023-07-04T07:22:40.524619058Z     phone: null,
//   2023-07-04T07:22:40.524622958Z     type: null,
//   2023-07-04T07:22:40.524626758Z     auto_reply: null,
//   2023-07-04T07:22:40.524630658Z     color: null,
//   2023-07-04T07:22:40.524634558Z     notification_email: null,
//   2023-07-04T07:22:40.524638558Z     business_hour_id: null,
//   2023-07-04T07:22:40.524642458Z     notification_sound: null,
//   2023-07-04T07:22:40.524646358Z     status: null,
//   2023-07-04T07:22:40.524650258Z     display_name: null,
//   2023-07-04T07:22:40.524654258Z     text: null,
//   2023-07-04T07:22:40.524658158Z     show_ticket_fields: null,
//   2023-07-04T07:22:40.524661958Z     show_contact_fields: null,
//   2023-07-04T07:22:40.524665858Z     username: null,
//   2023-07-04T07:22:40.524669758Z     reopen_closed_ticket: null,
//   2023-07-04T07:22:40.524673658Z     is_private: null,
//   2023-07-04T07:22:40.524677558Z     reassign_reopened_ticket: null,
//   2023-07-04T07:22:40.524681458Z     reopen_closed_ticket_time_window_days: null
//   2023-07-04T07:22:40.524685458Z   },
//   2023-07-04T07:22:40.524689358Z   contact_id: 346655399,
//   2023-07-04T07:22:40.524693258Z   contact: {
//   2023-07-04T07:22:40.524697058Z     id: 346655399,
//   2023-07-04T07:22:40.524700958Z     name: 'Homeowner',
//   2023-07-04T07:22:40.524704858Z     full_name: 'Homeowner',
//   2023-07-04T07:22:40.524708758Z     email: null,
//   2023-07-04T07:22:40.524712858Z     abbr: 'H',
//   2023-07-04T07:22:40.524716758Z     color: '#673ab7',
//   2023-07-04T07:22:40.524720658Z     profile_image: null,
//   2023-07-04T07:22:40.524724458Z     is_phone: true,
//   2023-07-04T07:22:40.524740358Z     phone: '+27798736273',
//   2023-07-04T07:22:40.524756759Z     formatted_phone: '+27 79 873 6273',
//   2023-07-04T07:22:40.524761459Z     avatar: 'https://assets.trengo.com/release/img/defaultpic.png',
//   2023-07-04T07:22:40.524765559Z     identifier: '+27 79 873 6273',
//   2023-07-04T07:22:40.524769659Z     custom_field_data: {
//   2023-07-04T07:22:40.524773659Z       'Referrer name': 'Dylan',
//   2023-07-04T07:22:40.524777759Z       'Contact address': '3 De Smit Street, De Waterkant, Cape Town',
//   2023-07-04T07:22:40.524781959Z       'Customer number': '0784130968',
//   2023-07-04T07:22:40.524785959Z       'Referrer relationship': 'Friend'
//   2023-07-04T07:22:40.524790159Z     },
//   2023-07-04T07:22:40.524794159Z     profile: [],
//   2023-07-04T07:22:40.524798159Z     pivot: null,
//   2023-07-04T07:22:40.524802159Z     groups: [],
//   2023-07-04T07:22:40.524808759Z     formatted_custom_field_data: {
//   2023-07-04T07:22:40.524812859Z       "Contact's name": null,
//   2023-07-04T07:22:40.524817059Z       'Referrer relationship': 'Friend',
//   2023-07-04T07:22:40.524821159Z       'Referrer name': 'Dylan',
//   2023-07-04T07:22:40.524825359Z       'Contact address': '3 De Smit Street, De Waterkant, Cape Town',
//   2023-07-04T07:22:40.524841659Z       'Customer number': '0784130968'
//   2023-07-04T07:22:40.524845659Z     },
//   2023-07-04T07:22:40.524849659Z     display_name: 'Homeowner (+27 79 873 6273)',
//   2023-07-04T07:22:40.524853659Z     is_private: false,
//   2023-07-04T07:22:40.524869759Z     custom_field_values: []
//   2023-07-04T07:22:40.524874159Z   },
//   2023-07-04T07:22:40.524878259Z   agent: null,
//   2023-07-04T07:22:40.524882259Z   assignee: null,
//   2023-07-04T07:22:40.524886259Z   closed_by: null,
//   2023-07-04T07:22:40.524890359Z   channel: {
//   2023-07-04T07:22:40.524894459Z     id: 1281523,
//   2023-07-04T07:22:40.524898559Z     name: 'Wa_business',
//   2023-07-04T07:22:40.524902760Z     title: 'Maintenance WhatsApp',
//   2023-07-04T07:22:40.524907060Z     phone: '',
//   2023-07-04T07:22:40.524911060Z     type: 'WA_BUSINESS',
//   2023-07-04T07:22:40.524915160Z     auto_reply: 'ENABLED',
//   2023-07-04T07:22:40.524919260Z     color: null,
//   2023-07-04T07:22:40.524923260Z     notification_email: 'dylan.walls@bitprop.com',
//   2023-07-04T07:22:40.524929560Z     business_hour_id: 296039,
//   2023-07-04T07:22:40.524934260Z     notification_sound: 'chat.mp3',
//   2023-07-04T07:22:40.524938460Z     status: 'ACTIVE',
//   2023-07-04T07:22:40.524942560Z     display_name: 'Maintenance WhatsApp',
//   2023-07-04T07:22:40.524946560Z     text: 'Maintenance WhatsApp',
//   2023-07-04T07:22:40.524950660Z     show_ticket_fields: 1,
//   2023-07-04T07:22:40.524958560Z     show_contact_fields: 1,
//   2023-07-04T07:22:40.524962860Z     emailChannel: null,
//   2023-07-04T07:22:40.524966860Z     users: [],
//   2023-07-04T07:22:40.524970860Z     username: '+27 60 068 4581',
//   2023-07-04T07:22:40.524974860Z     reopen_closed_ticket: 1,
//   2023-07-04T07:22:40.524978960Z     is_private: false,
//   2023-07-04T07:22:40.524982960Z     reassign_reopened_ticket: false,
//   2023-07-04T07:22:40.524987060Z     reopen_closed_ticket_time_window_days: '30',
//   2023-07-04T07:22:40.524991160Z     password: '115951991527557'
//   2023-07-04T07:22:40.524995260Z   },
//   2023-07-04T07:22:40.524999260Z   channelMeta: {
//   2023-07-04T07:22:40.525003260Z     flowbot_add_on_priced: true,
//   2023-07-04T07:22:40.525007260Z     flow: {
//   2023-07-04T07:22:40.525011260Z       session_id: '8S6xn0hd6CYQiB5HpOVI',
//   2023-07-04T07:22:40.525015360Z       last_flowbot_processed: null
//   2023-07-04T07:22:40.525019360Z     }
//   2023-07-04T07:22:40.525023360Z   },
//   2023-07-04T07:22:40.525027460Z   results: [],
//   2023-07-04T07:22:40.525031460Z   labels: [],
//   2023-07-04T07:22:40.525035560Z   reminder: null,
//   2023-07-04T07:22:40.525040560Z   watchers: [],
//   2023-07-04T07:22:40.525044660Z   starred: [],
//   2023-07-04T07:22:40.525048660Z   attachments: [],
//   2023-07-04T07:22:40.525052660Z   messaging_attachments: [],
//   2023-07-04T07:22:40.525056660Z   custom_data: {
//   2023-07-04T07:22:40.525060661Z     'Maintenance description¨': 'Gf',
//   2023-07-04T07:22:40.525065461Z     yourName: 'Jas',
//   2023-07-04T07:22:40.525069461Z     streetAddress: 'Has',
//   2023-07-04T07:22:40.525073461Z     flatLetter: 'H',
//   2023-07-04T07:22:40.525077561Z     contactNumber: '0999999999',
//   2023-07-04T07:22:40.525081561Z     photos: 'F'
//   2023-07-04T07:22:40.531982805Z   },
//   2023-07-04T07:22:40.531989205Z   messages_count: null,
//   2023-07-04T07:22:40.531993405Z   related_tickets: [],
//   2023-07-04T07:22:40.531997405Z   custom_field_values: [],
//   2023-07-04T07:22:40.532001305Z   audits: [
//   2023-07-04T07:22:40.532005105Z     {
//   2023-07-04T07:22:40.532008905Z       id: 2478593113,
//   2023-07-04T07:22:40.532012705Z       type: 'AUDIT',
//   2023-07-04T07:22:40.532016605Z       audit_type: 'TICKET_CREATED',
//   2023-07-04T07:22:40.532020505Z       body_type: 'TEXT',
//   2023-07-04T07:22:40.532024305Z       message: 'Created by Homeowner at 04-07-2023, 07:16',
//   2023-07-04T07:22:40.532037605Z       created_at: '2023-07-04 09:16:42'
//   2023-07-04T07:22:40.532042305Z     },
//   2023-07-04T07:22:40.532055305Z     {
//   2023-07-04T07:22:40.532059505Z       id: 2478600789,
//   2023-07-04T07:22:40.532063305Z       type: 'AUDIT',
//   2023-07-04T07:22:40.532067005Z       audit_type: 'TICKET_ASSIGNED',
//   2023-07-04T07:22:40.532070805Z       body_type: 'TEXT',
//   2023-07-04T07:22:40.532074605Z       message: 'Assigned to Team Maintenance by Maintenance ticket capturing at 04-07-2023, 07:22',
//   2023-07-04T07:22:40.532078605Z       created_at: '2023-07-04 09:22:37'
//   2023-07-04T07:22:40.532082405Z     }
//   2023-07-04T07:22:40.532086105Z   ]
//   2023-07-04T07:22:40.532089805Z }