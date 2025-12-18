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
        } catch (e) { return []; }
    },

    // 2. Client Registration (UCC Creation via BSE Upload API)
    async registerClient(userData, userId) {
        try {
            const response = await fetch(`${BACKEND_API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    name: userData.name,
                    pan: userData.pan,
                    mobile: userData.mobile,
                    email: userData.email,
                    bank: userData.bank, // Mapped from bankAcc
                    ifsc: userData.ifsc,
                    dob: userData.dob,
                    gender: userData.gender,
                    occupation: userData.occupation,
                    nominee: userData.nominee,
                    nomineeRelation: userData.nomineeRelation
                })
            });

            const result = await response.json();

            if (result.success) {
                await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'kyc', 'status'), {
                    verified: true,
                    ucc: result.ucc,
                    timestamp: serverTimestamp()
                });
            }
            return result;
        } catch (e) {
            // Fallback for simulation/testing if backend is down
            console.warn("Backend unreachable. Using simulation mode for demo.");
            await new Promise(r => setTimeout(r, 2000));
            const mockUCC = `SIM${userData.pan.substring(0, 5).toUpperCase()}01`;
            await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'kyc', 'status'), { verified: true, ucc: mockUCC, timestamp: serverTimestamp() });
            return { success: true, ucc: mockUCC };
        }
    },

    // 3. Order Placement (BSE Order Entry API)
    async placeOrder(orderData, userId) {
        try {
            const response = await fetch(`${BACKEND_API_URL}/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    ucc: orderData.ucc,
                    schemeCode: orderData.fundCode,
                    amount: orderData.amount,
                    buySell: "P", // P for Purchase
                    transType: "NEW"
                })
            });

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
        } catch (e) {
            console.warn("Backend unreachable. Using simulation mode.");
            await new Promise(r => setTimeout(r, 1500));
            await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'orders'), {
                ...orderData,
                bseOrderId: `SIM-ORD-${Date.now()}`,
                status: "SIMULATED",
                timestamp: serverTimestamp()
            });
            return { success: true, message: "Order Placed (Simulated)" };
        }
    }
};
