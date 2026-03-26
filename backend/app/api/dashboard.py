from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.chr_models import User, Event, Donation

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def dashboard(db: Session = Depends(get_db), user=Depends(get_current_user)):
    members = db.query(User).count()
    events = db.query(Event).count()
    donations = db.query(Donation).count()

    return {
        "members": members,
        "events": events,
        "donations": donations
    }