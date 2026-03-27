import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Building2, ShieldCheck, Send, CheckCircle2, X } from 'lucide-react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

export default function RegistrationForm({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    business_email: '',
    phone_number: '',
    company_name: '',
    desired_role: 'Manager',
    extra_info: 'I would like to join Invexix to streamline my business operations.'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { 
      id: 1, 
      title: 'Identity', 
      fields: ['full_name', 'business_email'],
      icons: [<User size={18} />, <Mail size={18} />],
      placeholders: ['Full Name', 'Business Email']
    },
    { 
      id: 2, 
      title: 'Business', 
      fields: ['phone_number', 'company_name'],
      icons: [<Phone size={18} />, <Building2 size={18} />],
      placeholders: ['Phone Number', 'Company / Branch Name']
    },
    { 
      id: 3, 
      title: 'Finalize', 
      fields: ['desired_role'],
      icons: [<ShieldCheck size={18} />],
      type: 'select',
      options: ['Company Admin', 'Manager', 'Seller (Sales Manager)', 'Viewer']
    }
  ];

  const currentStep = steps.find(s => s.id === step);

  const handleNext = () => {
    // Basic validation
    for (let f of currentStep.fields) {
      if (!formData[f]) {
        toast.error(`Please fill in ${f.replace('_', ' ')}`);
        return;
      }
    }
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Use your EmailJS Service ID, Template ID, and Public Key
      // These should ideally be in env vars
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_inara',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_onboarding',
        formData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key'
      );
      
      setSubmitted(true);
      setTimeout(() => {
        onComplete(formData);
      }, 3000);
    } catch (error) {
      console.error('EmailJS failed:', error);
      toast.error('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center bg-white rounded-3xl shadow-xl border border-emerald-100" >
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Request Sent!</h3>
        <p className="text-sm text-slate-500 mb-4">Our onboarding team will review your details and contact you at <strong>{formData.business_email}</strong> within 24-48 hours.</p>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Inara Intelligence Service</div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 relative" >
      <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><X size={18} /></button>
      
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-widest">Step {step}/3</div>
          <h3 className="text-lg font-black text-[#081422]">{currentStep.title}</h3>
        </div>
        <p className="text-xs text-slate-400">Please provide your details for account registration.</p>
      </div>

      <div className="space-y-4 mb-8">
        {currentStep.fields.map((field, idx) => (
          <div key={field} className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{currentStep.icons[idx]}</div>
            {currentStep.type === 'select' ? (
              <select 
                value={formData[field]} 
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
              >
                {currentStep.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input 
                type={field.includes('email') ? 'email' : 'text'}
                placeholder={currentStep.placeholders[idx]}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            )}
          </div>
        ))}
        {step === 3 && (
          <textarea 
            placeholder="Any extra info or questions?"
            value={formData.extra_info}
            onChange={(e) => setFormData({ ...formData, extra_info: e.target.value })}
            className="w-full px-4 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-24 resize-none"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Back</button>
        )}
        <button 
          onClick={handleNext} 
          disabled={loading}
          className="flex-[2] py-4 bg-[#081422] text-white rounded-2xl text-xs font-black shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          {loading ? 'Processing...' : step === 3 ? 'Submit Request' : 'Next Step'} <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}
