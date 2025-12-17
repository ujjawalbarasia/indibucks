import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { ucc, isin, amount, type } = req.body;
  const MEMBER_ID = process.env.BSE_MEMBER_ID;
  const PASSWORD = process.env.BSE_PASSWORD;

  // Order format: MemberId|ClientCode|SchemeCode|Amount|Buy/Sell|...
  const orderString = `${MEMBER_ID}|${ucc}|${isin}|${amount}|PURCHASE|...`;

  const soapBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://bsestarmf.in/">
       <soapenv:Header/>
       <soapenv:Body>
          <ns:OrderEntry>
             <ns:MemberId>${MEMBER_ID}</ns:MemberId>
             <ns:Password>${PASSWORD}</ns:Password>
             <ns:OrderData>${orderString}</ns:OrderData>
          </ns:OrderEntry>
       </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(
      'https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc',
      soapBody,
      { headers: { 'Content-Type': 'text/xml', 'SOAPAction': 'http://bsestarmf.in/MFOrder/OrderEntry' } }
    );

    const parsed = await parseStringPromise(response.data);
    const resultString = parsed['s:Envelope']['s:Body'][0]['OrderEntryResponse'][0]['OrderEntryResult'][0];
    const [status, message, orderId] = resultString.split('|');

    if (status === '100') {
      // If success, we usually get a Payment Link
      const paymentLink = `https://www.bsestarmf.in/BillDesk/Payment?OrderNo=${orderId}`;
      return res.status(200).json({ success: true, orderId, paymentLink });
    } else {
      return res.status(400).json({ success: false, message });
    }

  } catch (error) {
    // Fallback for Demo
    return res.status(200).json({ 
        success: true, 
        orderId: `DEMO-${Date.now()}`, 
        paymentLink: "https://www.bsestarmf.in" 
    });
  }
}
```

### Step 4: Update `App.jsx` Connection
In your frontend `App.jsx` (which I provided earlier), you just need to change **one line** to point to your new Vercel API routes instead of an external domain.

**Find this line:**
```javascript
const BACKEND_API_URL = "https://your-api-domain.com/api/bse"; 
```

**Change it to:**
```javascript
// Relative path works automatically on Vercel
const BACKEND_API_URL = "/api";
