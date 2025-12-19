import React, { useState } from 'react';
import { Loader, X, Shield, Lock, User, FileText, CheckCircle } from 'lucide-react';
import { BSEService } from '../../services/bse';

export const LoginModal = ({ onClose, onGoogleLogin }) => (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-slide-up">
        <div className="glass-panel p-8 rounded-3xl w-full max-w-sm bg-white dark:bg-[#111] relative overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition"><X size={20} className="text-gray-500" /></button>
            <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center -rotate-6 shadow-xl"><Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div></div>
            <h2 className="text-2xl font-black text-center mb-2 dark:text-white">Welcome Back</h2>
            <p className="text-center text-gray-500 text-sm mb-8">Secure access to your wealth.</p>
            <button onClick={onGoogleLogin} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-xl shadow-indigo-500/20"><User size={20} /> Continue with Google</button>
            <p className="mt-6 text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center justify-center gap-2"><Shield size={12} /> Bank Grade Security</p>
        </div>
    </div>
);

export const KYCFlow = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        pan: '', mobile: '', email: user?.email || '', bank: '', ifsc: '', name: user?.displayName || '',
        dob: '', gender: 'M', occupation: '01', nominee: '', nomineeRelation: ''
    });
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setLoading(true);
            const res = await BSEService.registerClient(formData, user.uid);
            setLoading(false);
            if (res.success) onComplete();
            else alert("KYC Registration Failed. Try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#111]">
                <h2 className="text-2xl font-black mb-1 dark:text-white text-center">BSE eKYC Setup</h2>
                <p className="text-xs text-gray-500 text-center mb-8">Paperless Verification • Secure & Encrypted</p>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'}`}></div>
                    ))}
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {step === 1 && (
                        <>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none" /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label><input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase">DOB (YYYY-MM-DD)</label><input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none" /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label><select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none"><option value="M">Male</option><option value="F">Female</option></select></div>
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">PAN Card Number</label><input value={formData.pan} onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })} maxLength={10} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white font-mono uppercase mt-1 outline-none" /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Aadhaar Linked Mobile</label><input value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white font-mono mt-1 outline-none" /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Occupation</label><select value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none"><option value="01">Business</option><option value="02">Service</option><option value="03">Student</option></select></div>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Bank Account Number</label><input value={formData.bank} onChange={e => setFormData({ ...formData, bank: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white font-mono mt-1 outline-none" /></div>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">IFSC Code</label><input value={formData.ifsc} onChange={e => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white font-mono uppercase mt-1 outline-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Nominee Name</label><input value={formData.nominee} onChange={e => setFormData({ ...formData, nominee: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none" /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase">Relation</label><input value={formData.nomineeRelation} onChange={e => setFormData({ ...formData, nomineeRelation: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none" /></div>
                            </div>
                        </>
                    )}

                    <button onClick={handleNext} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-xl">
                        {loading ? <Loader className="animate-spin" /> : step < 3 ? "Next Step" : "Make me an Investor"}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">Step {step} of 3 • BSE StarMF Secure</p>
                </div>
            </div>
        </div>
    );
};
