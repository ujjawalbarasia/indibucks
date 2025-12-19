import { collection, addDoc, setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, appId } from '../utils/firebase';
import { BACKEND_API_URL } from '../utils/constants';

export const BSEService = {
    // 1. Fetch Real Funds (MFAPI Proxy)
    async getFunds(codes) {
        try {
            const promises = codes.map(async (code) => {
                const res = await fetch(`https://api.mfapi.in/mf/${code}`);
                const json = await res.json();
                if (!json.meta || !json.data || json.data.length === 0) return null;
                return {
                    code: json.meta.scheme_code, // BSE Scheme Code
                    name: json.meta.scheme_name,
                    house: json.meta.fund_house,
                    nav: json.data[0].nav || "0.00",
                    category: json.meta.scheme_type,
                    risk: "Market Based",
                    minInv: 500,
                    isin: json.meta.isin_div_payout // Required for BSE Order
                };
            });
            return (await Promise.all(promises)).filter(f => f !== null);
        } catch (e) {
            console.error("Fund Fetch Error", e);
            throw e;
        }
    },

    // 2. Client Registration (UCC Creation via BSE Upload API)
    async registerClient(userData, userId) {
        const response = await fetch(`${BACKEND_API_URL}/bse/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                name: userData.name,
                pan: userData.pan,
                mobile: userData.mobile,
                email: userData.email,
                bank: userData.bank,
                ifsc: userData.ifsc,
                dob: userData.dob,
                gender: userData.gender,
                occupation: userData.occupation,
                nominee: userData.nominee,
                nomineeRelation: userData.nomineeRelation
            })
        });

        if (!response.ok) {
            throw new Error(`BSE Registration Failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'kyc', 'status'), {
                verified: true,
                ucc: result.ucc,
                timestamp: serverTimestamp()
            });
        }
        return result;
    },

    // 3. Create Mandate (Real BSE API)
    async createMandate(mandateData, userId) {
        const response = await fetch(`${BACKEND_API_URL}/bse/mandate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                ucc: mandateData.ucc,
                amount: mandateData.amount,
                ifsc: mandateData.ifsc,
                bankAccount: mandateData.bankAccount,
                mandateType: mandateData.type // e.g., "I" for ISIP/NetBanking, "U" for UPI
            })
        });

        if (!response.ok) {
            throw new Error(`BSE Mandate Failed: ${response.statusText}`);
        }

        return await response.json(); // Expected to return { success: true, mandateId: "..." }
    },

    // 4. Order Placement (BSE Order Entry API)
    async placeOrder(orderData, userId) {
        const response = await fetch(`${BACKEND_API_URL}/bse/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                ucc: orderData.ucc,
                schemeCode: orderData.fundCode,
                amount: orderData.amount,
                buySell: "P", // P for Purchase
                transType: "NEW",
                mandateId: orderData.mandateId || null // Optional for Lumpsum, Required for SIP
            })
        });

        if (!response.ok) {
            throw new Error(`BSE Order Placement Failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'orders'), {
                ...orderData,
                bseOrderId: result.orderId,
                paymentLink: result.paymentLink,
                status: "AWAITING_PAYMENT",
                timestamp: serverTimestamp()
            });
        }
        return result;
    }
};
