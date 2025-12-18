import axios from 'axios';
import { parseStringPromise } from 'xml2js';

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

  const { ucc, schemeCode, amount, buySell, transType } = req.body;
  const MEMBER_ID = process.env.BSE_MEMBER_ID;
  const PASSWORD = process.env.BSE_PASSWORD;

  if (!ucc || !schemeCode || !amount) {
    return res.status(400).json({ success: false, message: "Missing Order Details" });
  }

  // Generate Unique Order No (Internal)
  const uniqueRefNo = `ORD${Date.now()}`;

  // Pipe Separated Order String
  // Format: TransCode|UniqueRefNo|SchemeCode|BuySell|Amount|BuySellType|ClientCode|DPTrans|...
  // TransCode: NEW (New Order)
  // BuySell: P (Purchase)
  // BuySellType: FRESH (First Investment)
  // DPTrans: P (Physical)

  const params = [
    "NEW",             // Transaction Code
    uniqueRefNo,       // Unique Reference Number
    schemeCode,        // Scheme Code (BSE Code)
    buySell || "P",    // Buy/Sell
    amount,            // Amount
    transType || "FRESH", // BuySell Type (FRESH / ADDITIONAL)
    ucc,               // Client Code
    "P",               // DpTxnMode (Physical)
    "",                // Empty fields for others as per spec...
    "",
    "",
    "",
    "N"                // EUIN Declaration (N for now)
  ];

  const orderString = params.join('|');

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
    // Check for credentials
    if (!MEMBER_ID || MEMBER_ID === "YOUR_MEMBER_ID") {
      console.warn("No BSE Credentials. Returning Mock Order.");
      // Simulate a Payment Link
      return res.status(200).json({
        success: true,
        orderId: uniqueRefNo,
        paymentLink: `https://www.bsestarmf.in/BillDesk/Payment?OrderNo=${uniqueRefNo}`,
        message: "Order Placed (Simulated)"
      });
    }

    const response = await axios.post(
      'https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc',
      soapBody,
      { headers: { 'Content-Type': 'text/xml', 'SOAPAction': 'http://bsestarmf.in/MFOrder/OrderEntry' } }
    );

    const parsed = await parseStringPromise(response.data);
    const resultString = parsed['s:Envelope']['s:Body'][0]['OrderEntryResponse'][0]['OrderEntryResult'][0];
    const [status, message, orderId] = resultString.split('|');

    if (status === '100' || status === '0') { // 0 can also be success in some BSE APIs
      const paymentLink = `https://www.bsestarmf.in/BillDesk/Payment?OrderNo=${orderId}`;
      return res.status(200).json({ success: true, orderId, paymentLink, message });
    } else {
      return res.status(400).json({ success: false, message: message || "Order Failed at Exchange" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
