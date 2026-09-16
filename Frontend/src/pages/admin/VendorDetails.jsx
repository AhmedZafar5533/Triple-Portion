import {
    Building2,
    ArrowLeft,
    User,
    Phone,
    MapPin,
    Clock,
    FileText,
    X,
    FileX,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useEffect, useState } from 'react';
import { SkeletonBase } from '../../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config';

const BACKEND_URL = API_BASE_URL;

// ReviewActionModal Component (Handles Rejection and Correction)
const ReviewActionModal = ({ isOpen, onClose, onSend, type }) => {
    const [message, setMessage] = useState("");
    const isRejection = type === 'Rejected';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl ${isRejection ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {isRejection ? <FileX size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isRejection ? 'Reject Application' : 'Request Correction'}
                    </h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                    {isRejection 
                        ? 'Please provide a reason for rejecting this application. This will be shown to the vendor.' 
                        : 'Explain what needs to be corrected or which documents are missing.'}
                </p>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-40 p-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 mb-6 bg-gray-50 dark:bg-gray-900 dark:text-white transition-all"
                    placeholder={isRejection ? "Reason for rejection..." : "Instructions for correction..."}
                />

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            setMessage("");
                            onClose();
                        }}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 font-bold cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!message.trim()}
                        onClick={() => {
                            onSend(message);
                            setMessage("");
                        }}
                        className={`px-6 py-2.5 text-white rounded-xl transition duration-150 font-bold shadow-lg cursor-pointer disabled:opacity-50 ${
                            isRejection ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                        }`}
                    >
                        {isRejection ? 'Send Rejection' : 'Request Correction'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const VendorDetailPage = () => {
    const mode = useSearchParams()[0].get("mode");
    const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
    const [reviewModal, setReviewModal] = useState({ isOpen: false, type: '' });
    const navigate = useNavigate();

    const { id } = useParams();
    const { vendorData, getVendorDetails, setVendorApproval, loading, success } = useAdminStore();

    useEffect(() => {
        if (id) {
            getVendorDetails(id);
        }
    }, [getVendorDetails, id]);

    useEffect(() => {
        if (success) {
            navigate('/dashboard/admin');
        }
    }, [success, navigate]);

    const handleApprove = () => {
        if (window.confirm("Are you sure you want to approve this vendor?")) {
            setVendorApproval({ status: 'Approved', vendorId: id });
        }
    };

    const handleActionSend = (message) => {
        setVendorApproval({ 
            status: reviewModal.type, 
            vendorId: id, 
            reason: message // Store's setVendorApproval uses 'reason' key in body
        });
        setReviewModal({ isOpen: false, type: '' });
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        
        // If it's a sensitive document (has 'doc_' prefix), use the secure endpoint
        if (path.includes('doc_')) {
            return `${BACKEND_URL}/api/admin/serve-secure-image?path=${encodeURIComponent(path)}`;
        }
        
        return `${BACKEND_URL}/${path.replace(/\\/g, '/')}`;
    };

    if (loading || !vendorData) {
        return <div className="max-w-5xl mx-auto p-6 space-y-6">
            <SkeletonBase className="h-10 w-32" />
            <SkeletonBase className="h-40 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonBase className="h-60 md:col-span-2" />
                <SkeletonBase className="h-60" />
            </div>
        </div>;
    }

    const { businessDetails, businessContact, ownerDetails, contactPerson, businessAddress, status, createdAt, adminMessage } = vendorData;

    const getStatusBadgeClass = () => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Action Required': return 'bg-amber-100 text-amber-800';
            case 'Disabled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="w-full mb-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className='inline-flex items-center gap-2 text-rose-600 font-bold p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors cursor-pointer'
                    >
                        <ArrowLeft className="h-6 w-6" /> Back to List
                    </button>
                </div>

                {/* Status Alert if Action Required or Rejected */}
                {(status === 'Action Required' || status === 'Rejected') && adminMessage && (
                    <div className={`mb-6 p-4 rounded-xl border-2 flex gap-4 ${status === 'Rejected' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                        <div className="p-2 h-fit bg-white rounded-lg shadow-sm">
                            {status === 'Rejected' ? <FileX size={20} className="text-red-600" /> : <AlertCircle size={20} className="text-amber-600" />}
                        </div>
                        <div>
                            <h4 className="font-bold uppercase tracking-wider text-xs mb-1">{status} Message:</h4>
                            <p className="text-sm font-medium">{adminMessage}</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-2xl mb-6 overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center">
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {businessDetails.businessName ? businessDetails.businessName.charAt(0).toUpperCase() : 'V'}
                                </div>
                                <div className="ml-5">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                        {businessDetails.businessName || 'Unnamed Business'}
                                    </h1>
                                    <p className="text-gray-500 font-medium">
                                        {businessDetails.businessType || 'N/A'} • {businessDetails.businessIndustry}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:items-end">
                                <span className={`px-4 py-1.5 inline-flex text-xs font-bold uppercase tracking-widest rounded-full shadow-sm ${getStatusBadgeClass()}`}>
                                    {status}
                                </span>
                                <span className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-tight">
                                    Applied {formatDate(createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Details Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section Card Component */}
                        <DetailSection title="Business Details" icon={<Building2 size={20}/>}>
                            <InfoRow label="Business Name" value={businessDetails.businessName}/>
                            <InfoRow label="Legal Name" value={businessDetails.legalBusinessName}/>
                            <InfoRow label="Registration #" value={businessDetails.registrationNumber}/>
                            <InfoRow label="Industry" value={businessDetails.businessIndustry}/>
                        </DetailSection>

                        <DetailSection title="Location" icon={<MapPin size={20}/>}>
                            <div className="col-span-full">
                                <InfoRow label="Street" value={businessAddress.street}/>
                            </div>
                            <InfoRow label="City" value={businessAddress.city}/>
                            <InfoRow label="State" value={businessAddress.state}/>
                            <InfoRow label="Country" value={businessAddress.country}/>
                        </DetailSection>

                        <DetailSection title="Contact Info" icon={<Phone size={20}/>}>
                            <InfoRow label="Business Email" value={businessContact.businessEmail}/>
                            <InfoRow label="Business Phone" value={businessContact.businessPhone}/>
                            <div className="col-span-full">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Website</h3>
                                {businessContact.website ? <a href={businessContact.website} target="_blank" className="text-rose-600 font-bold hover:underline">{businessContact.website}</a> : <p className="text-gray-300">Not provided</p>}
                            </div>
                        </DetailSection>
                    </div>

                    {/* Ownership & Actions Column */}
                    <div className="space-y-6">
                        <DetailSection title="Owner" icon={<User size={20}/>} columns={1}>
                            {ownerDetails.ownerPhoto && (
                                <div className="flex justify-center mb-6">
                                    <div className="h-32 w-32 rounded-3xl overflow-hidden ring-4 ring-rose-50 dark:ring-rose-900/20 shadow-xl">
                                        <img src={getImageUrl(ownerDetails.ownerPhoto)} className="h-full w-full object-cover" />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-4">
                                <InfoRow label="Owner Name" value={ownerDetails.name} bold/>
                                <InfoRow label="Nationality" value={ownerDetails.nationality}/>
                                <InfoRow label="ID Number" value={ownerDetails.identificationNumber} mono/>
                                <button
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all text-sm cursor-pointer"
                                    onClick={() => setDocumentModalOpen(true)}
                                >
                                    <FileText size={18} /> View Documents
                                </button>
                            </div>
                        </DetailSection>

                        {/* Admin Action Box */}
                        {mode !== 'view' && status !== 'Approved' && status !== 'Disabled' && (
                            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 p-6 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                                    <Info size={14}/> Decision Center
                                </h3>
                                <button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                    onClick={handleApprove}
                                >
                                    <CheckCircle size={20}/> Approve Vendor
                                </button>
                                <button
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-100 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                    onClick={() => setReviewModal({ isOpen: true, type: 'Action Required' })}
                                >
                                    <AlertCircle size={20}/> Request Correction
                                </button>
                                <button
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                    onClick={() => setReviewModal({ isOpen: true, type: 'Rejected' })}
                                >
                                    <FileX size={20}/> Reject Application
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isDocumentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Identity Proof</h3>
                                <button onClick={() => setDocumentModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer"><X size={24} /></button>
                            </div>
                            <div className="p-6 flex items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-[400px]">
                                {ownerDetails.ownerDocumentPhoto ? <img src={getImageUrl(ownerDetails.ownerDocumentPhoto)} className="max-h-[70vh] rounded-xl shadow-lg object-contain" /> : <div className="text-center text-gray-400"><FileX size={64} className="mx-auto mb-2"/><p>No Document Found</p></div>}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ReviewActionModal
                isOpen={reviewModal.isOpen}
                type={reviewModal.type}
                onClose={() => setReviewModal({ isOpen: false, type: '' })}
                onSend={handleActionSend}
            />
        </div>
    );
};

// Helper Components
const DetailSection = ({ title, icon, children, columns = 2 }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-rose-50/20 dark:bg-rose-900/5 flex items-center gap-2">
            <div className="text-rose-600">{icon}</div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className={`p-6 grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value, bold = false, mono = false }) => (
    <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</h3>
        <p className={`text-sm ${bold ? 'font-bold' : 'font-medium'} ${mono ? 'font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded-lg' : ''} text-gray-900 dark:text-gray-100`}>
            {value || 'N/A'}
        </p>
    </div>
);

export default VendorDetailPage;
