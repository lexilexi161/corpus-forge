import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const uploadDocument = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/corpus/upload", form);
};

export const getDocuments = () => api.get("/corpus/");
export const deleteDocument = (id: string) => api.delete(`/corpus/${id}`);

export const sendChat = (messages: any[], doc_ids: string[], settings: any) =>
  api.post("/chat/", { messages, doc_ids, ...settings });

export const generateFlashcards = (doc_ids: string[], settings: any) =>
  api.post("/generate/flashcards", { doc_ids, ...settings });

export const generateQuiz = (doc_ids: string[], settings: any) =>
  api.post("/generate/quiz", { doc_ids, ...settings });

export const generateCodeReview = (doc_ids: string[], settings: any) =>
  api.post("/generate/code-review", { doc_ids, ...settings });

export const getCost = () => api.get("/cost/");
