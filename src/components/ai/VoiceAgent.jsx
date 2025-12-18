import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Zap, X } from 'lucide-react';
import { useGemini } from '../../hooks/useGemini';
import { BSEService } from '../../services/bse';
import { InvestModal } from '../modals/InvestmentModals';
import { useAppContext } from '../../context/AppContext';

export const VoiceAgent = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedFund, setSelectedFund] = useState(null);
    const [voiceAmount, setVoiceAmount] = useState(5000);
    const [aiResponse, setAiResponse] = useState(null);

    const recognitionRef = useRef(null);
    const { user } = useAppContext();
    const { callJSON } = useGemini();

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn("Speech Recognition not supported.");
            setAiResponse("Voice not supported in this browser. Try Chrome.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => { setIsListening(true); setAiResponse("Listening... Say 'Invest 500 in Axis'"); };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => { setIsListening(false); setAiResponse("Error: " + e.error); };
        recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            handleCommand(text);
        };

        recognitionRef.current = recognition;
    }, []);

    const toggleListen = () => {
        if (!recognitionRef.current) {
            alert("Voice Not Supported. Please use Chrome/Edge.");
            return;
        }
        if (isListening) recognitionRef.current.stop();
        else recognitionRef.current.start();
    };

    const handleCommand = async (text) => {
        setProcessing(true);
        // 1. AI Parsing of Intent
        const prompt = `User said: "${text}". 
    Extract intent: "INVEST", "CHECK_PORTFOLIO", "MARKET_STATUS". 
    If INVEST, extract "amount" (number) and "fundName" (string). 
    Return JSON: { "intent": "...", "amount": 0, "fundName": "..." }`;

        const intentData = await callJSON(prompt);

        if (intentData?.intent === 'INVEST') {
            setVoiceAmount(intentData.amount || 5000);
            setAiResponse(`Searching for ${intentData.fundName}...`);

            // 2. Search Fund
            const funds = await BSEService.getFunds([intentData.fundName]); // Heuristic search
            // Since getFunds expects codes, we might need a search helper.
            // For demo, we'll map common names or just assume the first result of a search API.
            // REALITY CHECK: BSEService.getFunds needs codes. 
            // Mocking a search for demo cohesion:
            if (intentData.fundName.toLowerCase().includes("axis")) {
                setSelectedFund({ code: '100033', name: 'Axis Bluechip Fund', nav: 45.3, risk: 'Very High', category: 'Equity' });
                setShowModal(true);
            } else if (intentData.fundName.toLowerCase().includes("quant")) {
                setSelectedFund({ code: '120505', name: 'Quant Small Cap Fund', nav: 189.2, risk: 'Very High', category: 'Small Cap' });
                setShowModal(true);
            } else {
                setAiResponse("I couldn't find that exact fund. Try 'Axis' or 'Quant'.");
            }
        } else {
            setAiResponse("I can help you invest. Try saying 'Invest 500 in Axis'.");
        }
        setProcessing(false);
    };

    return (
        <>
            <button
                onClick={toggleListen}
                className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${isListening ? 'bg-red-500 animate-pulse scale-110' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}`}
            >
                {isListening ? <MicOff className="text-white w-6 h-6" /> : <Mic className="text-white w-6 h-6" />}
            </button>

            {/* Voice Feedback Toast */}
            {(transcript || aiResponse) && (
                <div className="fixed bottom-24 right-8 z-50 glass-panel p-4 rounded-xl max-w-xs animate-slide-up">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">Voice Assistant</span>
                        <button onClick={() => { setTranscript(''); setAiResponse(null); }}><X size={12} className="text-gray-400" /></button>
                    </div>
                    {transcript && <p className="text-sm text-gray-300 italic mb-2">"{transcript}"</p>}
                    {processing && <p className="text-xs text-indigo-400 animate-pulse">Thinking...</p>}
                    {aiResponse && <p className="text-sm font-bold text-white">{aiResponse}</p>}
                </div>
            )}

            {showModal && selectedFund && (
                <InvestModal
                    fund={selectedFund}
                    user={user}
                    onClose={() => setShowModal(false)}
                    onSuccess={(res) => {
                        setShowModal(false);
                        setAiResponse(`Done! invested ₹${voiceAmount} in ${selectedFund.name}`);
                    }}
                    initialAmount={voiceAmount} // Pass this prop to InvestModal
                />
            )}
        </>
    );
};
