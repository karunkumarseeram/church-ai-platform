# api/events.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.chr_models import Event
from app.schemas.event import EventCreate, EventOut
from app.core.dependencies import admin_required,get_current_user
import uuid

router = APIRouter(prefix="/events", tags=["Events"])


# ➕ CREATE
@router.post("", response_model=EventOut)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required),
):
    new_event = Event(
        id=uuid.uuid4(),
        title=event.title,
        description=event.description,
        location=event.location,
        event_date=event.event_date,
        created_by=user.id,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


# 📄 GET ALL (public)
@router.get("", response_model=list[EventOut])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_date).all()


# ✏️ UPDATE
@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: str,
    updated: EventCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(404, "Event not found")

    event.title = updated.title
    event.description = updated.description
    event.location = updated.location
    event.event_date = updated.event_date

    db.commit()
    db.refresh(event)
    return event


# ❌ DELETE
@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    user=Depends(admin_required),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(404, "Event not found")

    db.delete(event)
    db.commit()

    return {"message": "Event deleted"}