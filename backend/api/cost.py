from fastapi import APIRouter
from services.cost_tracker import get_usage_stats

router = APIRouter()

@router.get("/")
def get_cost():
    """Get token usage and request count."""
    return get_usage_stats()
