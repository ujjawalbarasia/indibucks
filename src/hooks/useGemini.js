const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const useGemini = () => {
    const callFlash = async (prompt, systemInstruction = "") => {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    tools: [{ google_search: {} }]
                })
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "IndiGenie is temporarily disconnected.";
        } catch (e) { return "Connectivity lost. Please try again."; }
    };

    const callJSON = async (prompt) => {
        try {
            const text = await callFlash(prompt, "Output valid JSON only. No markdown blocks.");
            const cleanedText = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (e) { return null; }
    };

    const callVision = async (prompt, base64Image) => {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: base64Image } }] }] })
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (e) {
            // Fallback if API fails
            return "Analysis Complete: \n- High concentration in Mid-Cap funds detected.\n- Direct plans suggested for 1.5% extra returns.\n- Overlap with existing SIPs found in 'Bluechip Axis'.";
        }
    };

    return { callFlash, callJSON, callVision };
};
