/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5000";

type ChatOptions = {
    audience_level?: string;
    tone?: string;
    output_format?: string;
};

type ArtifactOptions = {
    count?: number;
    audience_level?: string;
    tone?: string;
};

export type CostApiResponse = {
    request_count?: number;
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    total_requests?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    estimated_cost?: number;
};

async function readErrorMessage(response: Response): Promise<string> {
    const fallbackMessage = `Request failed with status ${response.status}.`;

    try {
        const payload = (await response.json()) as { message?: string; error?: string; details?: string };
        return payload.message || payload.error || payload.details || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return (await response.json()) as T;
}

async function postFormData<T>(path: string, formData: FormData): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return (await response.json()) as T;
}

export async function uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return postFormData<unknown>("/documents", formData);
}

export async function sendChatMessage(message: string, options: ChatOptions = {}) {
    return postJson<unknown>("/chat", {
        message,
        ...options,
    });
}

export async function generateFlashcards(topic: string, options: ArtifactOptions = {}) {
    return postJson<unknown>("/artifacts/flashcards", {
        topic,
        ...options,
    });
}

export async function generateQuiz(topic: string, options: ArtifactOptions = {}) {
    return postJson<unknown>("/artifacts/quiz", {
        topic,
        ...options,
    });
}

export async function generateCodeAnalysis(topic: string, options: ArtifactOptions = {}) {
    return postJson<unknown>("/artifacts/code-analysis", {
        topic,
        ...options,
    });
}

export async function getCost() {
    const response = await fetch(`${API_BASE_URL}/cost`);

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return (await response.json()) as CostApiResponse;
}
