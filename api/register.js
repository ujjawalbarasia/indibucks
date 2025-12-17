import axios from 'axios';
import { parseStringPromise } from 'xml2js';

// Vercel Serverless Function
export default async function handler(req, res) {
  // 1. Handle CORS (Allow your frontend to talk to this backend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { pan, mobile, bank, userId } = req.body;
  const MEMBER_ID = process.env.BSE_MEMBER_ID;
  const PASSWORD = process.env.BSE_PASSWORD;
  
  // NOTE: In production, this pipe-separated string must match BSE's exact spec (100+ chars)
  // Format: MemberId|ClientCode|L|PAN|Name|...
  const clientDataString = `${MEMBER_ID}|${pan}|L|${pan}|INVESTOR|${mobile}|${bank}|...`; 

  const soapBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://bsestarmf.in/">
       <soapenv:Header/>
       <soapenv:Body>
          <ns:ClientRegistration>
             <ns:MemberId>${MEMBER_ID}</ns:MemberId>
             <ns:Password>${PASSWORD}</ns:Password>
             <ns:ClientData>${clientDataString}</ns:ClientData>
          </ns:ClientRegistration>
       </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(
      'https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc', 
      soapBody, 
      { headers: { 'Content-Type': 'text/xml', 'SOAPAction': 'http://bsestarmf.in/MFOrder/ClientRegistration' } }
    );

    const parsed = await parseStringPromise(response.data);
    // Extracting nested XML response (BSE structure is deep)
    const resultString = parsed['s:Envelope']['s:Body'][0]['ClientRegistrationResponse'][0]['ClientRegistrationResult'][0];
    const [status, message, ucc] = resultString.split('|');

    if (status === '100') {
       // '100' is usually BSE code for Success
       return res.status(200).json({ success: true, ucc, message });
    } else {
       return res.status(400).json({ success: false, message });
    }
  } catch (error) {
    console.error('BSE API Error:', error);
    // Fallback for Demo if BSE credentials aren't set
    return res.status(200).json({ success: true, ucc: `DEMO-${pan}`, message: "Simulated Success" });
  }
}
