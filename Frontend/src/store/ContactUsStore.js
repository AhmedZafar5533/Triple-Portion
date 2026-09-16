import { create } from "zustand";

export const useContactUsStore = create((set) => ({
  messages: [
    { _id: "m1", reason: "Support", email: "user@example.com", message: "How do I update my profile?", replied: false, createdAt: new Date().toISOString() },
    { _id: "m2", reason: "Billing", email: "bill@example.com", message: "I have a question about my last invoice.", replied: true, reply: "We have processed your refund.", createdAt: new Date().toISOString() },
  ],
  loading: false,
  getAllMessages: async () => {},
  deleteMessage: (id) => {
    set((state) => ({ messages: state.messages.filter(m => m._id !== id) }));
  },
  replyMessage: async (id, content) => {
    set((state) => ({
      messages: state.messages.map(m => m._id === id ? { ...m, replied: true, reply: content } : m)
    }));
    return true;
  },
}));
