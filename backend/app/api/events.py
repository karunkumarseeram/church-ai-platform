from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.event import EventCreate, EventOut
from app.models.chr_models import Event, RoleEnum
from app.core.database import get_db
from app.core.dependencies import admin_required
# from app.services.websocket_manager import manager

router = APIRouter(prefix="/events", tags=["Events"])


# CREATE EVENT (ADMIN / PASTOR)
# POST /events/
@router.post("/", response_model=EventOut)
async def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):
    event = Event(**data.dict(), created_by=user.id)
    db.add(event)
    db.commit()
    db.refresh(event)

    # 🔔 Notify all connected clients
    await manager.broadcast({
        "type": "NEW_EVENT",
        "event": {
            "id": str(event.id),
            "title": event.title,
            "event_date": str(event.event_date)
        }
    })

    return event


# GET EVENTS
@router.get("/", response_model=list[EventOut])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_date.asc()).all()


# DELETE
@router.delete("/{id}")
def delete_event(id: str, db: Session = Depends(get_db), user=Depends(admin_required)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404)

    db.delete(event)
    db.commit()

    return {"msg": "Deleted"}