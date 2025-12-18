import {
    TrendingUp, Shield, Zap, User, Menu, X, ChevronRight, Star,
    Search, PieChart, ArrowUpRight, Briefcase,
    CheckCircle, Lock, Loader, RefreshCw,
    Camera, Volume2, Phone, Mail, MapPin, Users, Download, Table, Key, Sparkles, MessageCircle, Copy, Mic, Calculator, ArrowLeftRight, LogIn, Target,
    FileText, Upload, Layers, Filter, XCircle, ToggleLeft, ToggleRight, Send, Trash2, Play, Smartphone, Flame, ThumbsUp, Eye, LogOut, AlertTriangle, Activity, MicOff, Users2, Skull, SlidersHorizontal, Terminal, Rocket, Sun, Moon, CreditCard, Landmark, FileCheck, BrainCircuit, HeartPulse, Telescope, UserPlus, TrendingDown, Gift,
    HelpCircle, ShieldCheck, Info, FileWarning, Scale, BookOpen, Gavel, Globe, Leaf, EyeOff, Sprout, Crosshair, Crown, Gem, Anchor, History, BarChart3, Newspaper, Gauge, Command, Swords, Bot, Coins, Percent, Banknote, Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';

export const BACKEND_API_URL = "/api";

export const CONSTANTS = {
    FEATURED_FUNDS: ['119598', '125494', '122639', '112152', '120586', '119800', '147589', '102883', '100001', '120505'],
    TRIBES: [
        { id: 1, name: "FIRE Rebels", members: "12.4k", roi: "18.2%", desc: "Retire early. Aggressive high-growth strategies.", icon: Flame, img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop", color: "from-orange-600 to-red-600" },
        { id: 2, name: "Safe Harbors", members: "35.1k", roi: "11.5%", desc: "Capital protection fortress. Debt & large-cap allocation.", icon: Shield, img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", color: "from-blue-600 to-indigo-600" },
        { id: 3, name: "Tax Slayers", members: "8.9k", roi: "14.8%", desc: "Maximizing Section 80C aggressively.", icon: FileCheck, img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop", color: "from-emerald-600 to-teal-600" },
    ],
    COLLECTIONS: [
        { id: 'high-return', label: "High Return", icon: TrendingUp, iconColor: "text-green-500", filter: { risk: "Very High" } },
        { id: 'tax-saving', label: "Tax Saving", icon: FileText, iconColor: "text-blue-500", filter: { category: "ELSS" } },
        { id: 'sip-100', label: "SIP from ₹100", icon: Coins, iconColor: "text-orange-500", filter: { minInv: 100 } },
        { id: 'large-cap', label: "Large Cap", icon: Crown, iconColor: "text-purple-500", filter: { category: "Large Cap" } },
        { id: 'mid-cap', label: "Mid Cap", icon: Layers, iconColor: "text-indigo-500", filter: { category: "Mid Cap" } },
        { id: 'small-cap', label: "Small Cap", icon: Sprout, iconColor: "text-emerald-500", filter: { category: "Small Cap" } },
    ],
    REELS: [
        { id: 1, title: "SIP vs Lumpsum?", views: "1.2M", img: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=2070&auto=format&fit=crop", icon: ArrowLeftRight },
        { id: 2, title: "Tax Hacks 2025", views: "850K", img: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?q=80&w=2070&auto=format&fit=crop", icon: Briefcase },
        { id: 3, title: "Small Cap Alpha", views: "2.1M", img: "https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2064&auto=format&fit=crop", icon: Sparkles },
    ],
    TESTIMONIALS: [
        { n: "Amit Sharma", r: "Business Owner", t: "IndiBucks helped me save 2 Lakhs in tax last year. The AI advisor is genius!" },
        { n: "Priya Khanna", r: "Software Engineer", t: "I love the 'Panic Mode'. It stopped me from selling during the last dip." },
        { n: "Rahul Singh", r: "Doctor", t: "The easiest way to track my family's portfolio. Highly recommended." }
    ],
    FAQS: [
        { q: "Is IndiBucks SEBI Registered?", a: "IndiBucks is an AMFI Registered Mutual Fund Distributor (ARN-183942)." },
        { q: "How does money move?", a: "Your money moves directly from your bank account to the Mutual Fund House's account via the clearing corporation (ICCL)." },
        { q: "Is it safe?", a: "Yes. We use bank-grade AES-256 encryption. Your units are held in your name at the CDSL/NSDL depository." },
        { q: "Do you charge fees?", a: "The app is free for investors. We earn a commission from Asset Management Companies (AMCs) for the Regular Plans we distribute. This allows us to provide technology and support at no cost to you." },
        { q: "Can I withdraw anytime?", a: "Yes, for open-ended funds. ELSS funds have a 3-year lock-in." },
        { q: "How do I start a SIP?", a: "Simply select a fund, click 'Invest', choose 'SIP', and enter the amount." }
    ]
};
