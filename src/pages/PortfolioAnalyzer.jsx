import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight, X, ScanEye, ShieldCheck } from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import { Layout } from '../components/ui/Layout';

export const PortfolioAnalyzer = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [report, setReport] = useState(null);
    const { callFlash } = useGemini();

    const handleUpload = () => {
        setAnalyzing(true);
        // Simulation of File Upload + Gemini Vision Processing
        setTimeout(async () => {
            // In a real app, this would be the Gemini Vision API response on the PDF
            const mockAnalysis = {
                score: 72,
                risks: [
                    { title: "High Overlap", desc: "HDFC Top 100 and ICICI Bluechip have 64% portfolio overlap. You are duplicating risk.", severity: "high" },
                    { title: "Regular Plan Commission", desc: "You are invested in 'Regular' plans. Switching to 'Direct' will save you ₹2.4 Lakhs over 15 years.", severity: "medium" }
                ],
                actions: [
                    { title: "Switch to Direct (Save 1.2%)", icon: CheckCircle },
                    { title: "Consolidate Bluechip Funds", icon: ShieldCheck }
                ]
            };
            setReport(mockAnalysis);
            setAnalyzing(false);
        }, 3500);
    };

    return (
        <Layout>
            <div className="pt-28 px-4 max-w-5xl mx-auto min-h-screen">
                <div className="text-center mb-12">
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Portfolio Medic</span>
                    <h1 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-purple-400">AI Portfolio X-Ray</h1>
                    <p className="text-gray-400 max-w-xl mx-auto">Upload your NSDL/CDSL CAS Statement (PDF). <br />IndiGenie will analyze hidden commissions, overlaps, and risk.</p>
                </div>

                {!report && (
                    <div
                        className={`max-w-xl mx-auto border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group ${analyzing ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-700 hover:border-indigo-500 hover:bg-white/5'}`}
                        onClick={!analyzing ? handleUpload : undefined}
                    >
                        {analyzing ? (
                            <>
                                <div className="relative mb-6">
                                    <ScanEye className="w-16 h-16 text-indigo-500 animate-pulse" />
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-ping"></div>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Scanning Portfolio...</h3>
                                <p className="text-sm text-gray-400">Gemini Vision is reading your statement</p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Drop CAS PDF Here</h3>
                                <p className="text-sm text-gray-500">or click to browse</p>
                            </>
                        )}
                    </div>
                )}

                {report && (
                    <div className="animate-slide-up grid md:grid-cols-2 gap-8">
                        {/* Score Card */}
                        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Health Score</h3>
                            <div className="text-8xl font-black text-indigo-400 mb-2">{report.score}<span className="text-2xl text-gray-500">/100</span></div>
                            <p className="text-sm text-gray-300">Your portfolio is decent, but has <span className="text-red-400 font-bold">{report.risks.length} critical issues</span> affecting returns.</p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            {report.risks.map((risk, i) => (
                                <div key={i} className="glass-panel p-6 rounded-2xl border-l-4 border-l-red-500">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{risk.title}</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed">{risk.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" /> Auto-Fix Portfolio
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
