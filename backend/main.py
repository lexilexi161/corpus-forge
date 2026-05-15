from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import corpus, chat, generation, cost

app = FastAPI(title="Corpus Forge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(corpus.router, prefix="/api/corpus", tags=["corpus"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(generation.router, prefix="/api/generate", tags=["generation"])
app.include_router(cost.router, prefix="/api/cost", tags=["cost"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Corpus Forge API running"}
