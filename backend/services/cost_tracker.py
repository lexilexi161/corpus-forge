import json
import os

COST_FILE = os.path.join(os.path.dirname(__file__), "../../data/usage.json")

def _load() -> dict:
    if not os.path.exists(COST_FILE):
        return {"request_count": 0, "prompt_tokens": 0, "completion_tokens": 0}
    with open(COST_FILE, "r") as f:
        return json.load(f)

def _save(data: dict):
    os.makedirs(os.path.dirname(COST_FILE), exist_ok=True)
    with open(COST_FILE, "w") as f:
        json.dump(data, f, indent=2)

def track_usage(usage: dict):
    data = _load()
    data["request_count"] += 1
    data["prompt_tokens"] += usage.get("prompt_tokens", 0)
    data["completion_tokens"] += usage.get("completion_tokens", 0)
    _save(data)

def get_usage_stats() -> dict:
    data = _load()
    total_tokens = data["prompt_tokens"] + data["completion_tokens"]
    # GPT-4o-mini pricing: ~$0.15/1M input, $0.60/1M output
    estimated_cost = (data["prompt_tokens"] * 0.00000015) + (data["completion_tokens"] * 0.0000006)
    return {**data, "total_tokens": total_tokens, "estimated_cost_usd": round(estimated_cost, 6)}
