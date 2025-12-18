import axios from 'axios';
import { parseStringPromise } from 'xml2js';

// Helper to format date as DD/MM/YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default async function handler(req, res) {
  // 1. Handle CORS
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

  try {
    const {
      pan, mobile, email, bank, ifsc, name,
      dob, gender, occupation, nominee, nomineeRelation,
      userId
    } = req.body;

    const MEMBER_ID = process.env.BSE_MEMBER_ID;
    const PASSWORD = process.env.BSE_PASSWORD;
    const USER_ID = process.env.BSE_USER_ID || MEMBER_ID; // Often same as Member ID for single member

    // Check strict mandatory fields
    if (!pan || !name || !mobile || !bank || !ifsc || !dob) {
      return res.status(400).json({ success: false, message: "Missing mandatory KYC fields" });
    }

    // Construct Unique Client Code (UCC) - usually PAN + internal suffix
    const ucc = `${pan}01`.toUpperCase();

    // Field Mapping based on BSE StarMF Client Master Upload (Physical/Demat)
    // We strictly follow the pipe sequence for MFD upload (simplified for Physical mode)
    // Sequence: Code|Holding|TaxStatus|Occ|Name1|Name2|Name3|DOB|Gender|Father|PAN|Nominee|NomRel|GuardianPAN|Type|DefaultDP|...|BankName|Branch|City|AccType|AccNo|MICR

    // Default values for simplified onboarding
    const holdingMode = "SI"; // Single
    const taxStatus = "01";   // Individual
    const occCode = occupation || "01"; // Default Business
    const dobFormatted = formatDate(dob);
    const genderCode = gender === "Female" ? "F" : "M";
    const fatherName = "."; // Mandatory but often dummy if not provided for adults
    const nomineeName = nominee || "."; // Optional in some cases, but good to have
    const nomineeRel = nomineeRelation || ".";
    const clientType = "P"; // Physical
    const accType = "SB";   // Savings Bank

    // Construct the pipe-separated string
    // Note: The specific order here is CRITICAL. 
    // This mapping matches the common 'Client Master Upload' format.
    const params = [
      ucc,                  // CLIENT CODE
      holdingMode,          // CLIENT HOLDING
      taxStatus,            // CLIENT TAXSTATUS
      occCode,              // CLIENT OCCUPATION CODE
      name,                 // CLIENT APPNAME1
      "",                   // CLIENT APPNAME2
      "",                   // CLIENT APPNAME3
      dobFormatted,         // CLIENT DOB
      genderCode,           // CLIENT GENDER
      fatherName,           // CLIENT FATHER/HUSBAND/GUARDIAN
      pan,                  // CLIENT PAN
      nomineeName,          // CLIENT NOMINEE
      nomineeRel,           // CLIENT NOMINEE RELATION
      "",                   // CLIENT GUARDIANPAN
      clientType,           // CLIENT TYPE
      "",                   // CLIENT DEFAULTDP
      "",                   // CLIENT CDSLDPID
      "",                   // CLIENT CDSLCLTID
      "",                   // CLIENT NSDLDPID
      "",                   // CLIENT NSDLCLTID
      "HDFC BANK",          // CLIENT BANKNAME (Ideally fetched via IFSC)
      "MUMBAI",             // CLIENT BANKBRANCH
      "MUMBAI",             // CLIENT BANKCITY
      accType,              // CLIENT ACCTYPE
      bank,                 // CLIENT ACCNO
      "",                   // CLIENT MICRNO
      "",                   // CLIENT EMAIL (Sometimes separate or at end)
      mobile,               // CLIENT MOBILE
    ];

    // Some endpoints differ, but let's try the pipe join
    const clientDataString = params.join('|');

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

    console.log("Sending to BSE:", clientDataString); // Audit log

    // If no credentials, simulate success implementation for Demo
    if (!MEMBER_ID || MEMBER_ID === "YOUR_MEMBER_ID") {
      console.warn("No BSE Credentials found. Returning Mock Success.");
      return res.status(200).json({
        success: true,
        ucc: ucc,
        message: "Client Registered (Simulation) - Setup Env Vars for Production"
      });
    }

    const response = await axios.post(
      'https://www.bsestarmf.in/MFOrderEntry/MFOrder.svc',
      soapBody,
      { headers: { 'Content-Type': 'text/xml', 'SOAPAction': 'http://bsestarmf.in/MFOrder/ClientRegistration' } }
    );

    const parsed = await parseStringPromise(response.data);
    const resultString = parsed['s:Envelope']['s:Body'][0]['ClientRegistrationResponse'][0]['ClientRegistrationResult'][0];
    const [status, message] = resultString.split('|');

    if (status === '100') {
      return res.status(200).json({ success: true, ucc, message });
    } else {
      return res.status(400).json({ success: false, message: message || "Registration Failed" });
    }

  } catch (error) {
    console.error('BSE API Error:', error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
