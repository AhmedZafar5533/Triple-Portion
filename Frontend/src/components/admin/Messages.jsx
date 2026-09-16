import React, { useEffect, useState } from "react";
import { Search, MoreVertical, AlertTriangle, X, Loader2 } from "lucide-react";
import { useContactUsStore } from "../../store/ContactUsStore";
import { SkeletonTable } from "../Skeleton";

const formatDateTime = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [viewMode, setViewMode] = useState("unreplied");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);

  const { getAllMessages, messages, loading, deleteMessage, replyMessage } = useContactUsStore();

  useEffect(() => {
    getAllMessages();
  }, [getAllMessages]);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unrepliedMessages = filteredMessages.filter((msg) => !msg.replied);
  const repliedMessages = filteredMessages.filter((msg) => msg.replied);

  const openModal = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    setReplyMode(false);
    setReplyContent("");
  };

  const closeModal = () => {
    if (sendingReply) return;
    setSelectedMessage(null);
    setShowMessageModal(false);
    setReplyMode(false);
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    setSendingReply(true);
    const success = await replyMessage(selectedMessage._id, replyContent);
    if (success) {
      closeModal();
    }
    setSendingReply(false);
  };

  const renderMessagesList = (list) => {
    if (loading) {
      return (
        <div className="space-y-4">
          <SkeletonTable rows={3} cols={1} />
        </div>
      );
    }
    if (list.length === 0) return <div className="p-8 text-center text-gray-500">No messages found.</div>;

    return list.map((message) => (
      <div
        key={message._id}
        className="relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer mb-4"
        onClick={() => openModal(message)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{message.reason}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">From: {message.email}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); deleteMessage(message._id); }} className="text-red-500 hover:text-red-700"><X size={18} /></button>
        </div>
        <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-2">{message.message}</p>
      </div>
    ));
  };

  return (
    <div className="space-y-6 mb-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button onClick={() => setViewMode("unreplied")} className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === "unreplied" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700"}`}>Unreplied ({unrepliedMessages.length})</button>
        <button onClick={() => setViewMode("replied")} className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === "replied" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700"}`}>Replied ({repliedMessages.length})</button>
      </div>

      <div className="space-y-4">
        {viewMode === "unreplied" ? renderMessagesList(unrepliedMessages) : renderMessagesList(repliedMessages)}
      </div>

      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black opacity-50" onClick={closeModal}></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Message Details</h3>
              <button onClick={closeModal}><X size={20} /></button>
            </div>
            <p><strong>From:</strong> {selectedMessage.email}</p>
            <p><strong>Reason:</strong> {selectedMessage.reason}</p>
            <p className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">{selectedMessage.message}</p>
            
            {selectedMessage.replied ? (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-400">
                <p><strong>Your Reply:</strong></p>
                <p>{selectedMessage.reply}</p>
              </div>
            ) : (
              replyMode ? (
                <div className="mt-4">
                  <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700" rows="4" placeholder="Type your reply..."></textarea>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setReplyMode(false)} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={handleSendReply} className="px-4 py-2 bg-blue-600 text-white rounded">Send Reply</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setReplyMode(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Reply</button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
