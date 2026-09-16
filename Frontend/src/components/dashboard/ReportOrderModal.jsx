import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "../../config";

const ReportOrderModal = ({ order, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Delayed Delivery', 
    'Wrong Item', 
    'Damaged Item', 
    'Quality Issue', 
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${order._id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, description }),
        credentials: "include"
      });

      if (res.ok) {
        toast.success("Report submitted successfully. We will investigate shortly.");
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to submit report");
      }
    } catch (err) {
      toast.error("Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Report Issue</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-0.5">Order #{order._id.substr(-6).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors dark:text-white">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reason for report</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20 transition-all dark:text-white"
              >
                <option value="">Select a reason</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about the issue..."
                rows="4"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-none dark:text-white"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all uppercase tracking-widest text-xs shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Submit Report <Send size={16} /></>
              )}
            </button>

            <p className="text-[9px] text-center text-slate-400 font-medium">
              Our support team will review your report and get back to you within 24-48 hours.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportOrderModal;
