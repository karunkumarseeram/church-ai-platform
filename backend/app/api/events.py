from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.event import EventCreate, EventOut
from app.models.chr_models import Event
from app.core.dependencies import get_db, admin_required

router = APIRouter(prefix="/events", tags=["Events"])


# CREATE (ADMIN ONLY)
@router.post("/")
def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):
    event = Event(**data.dict())
    db.add(event)
    db.commit()
    return event


# GET ALL + PAGINATION
@router.get("/", response_model=list[EventOut])
def get_events(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return db.query(Event).offset(skip).limit(limit).all()


# GET BY ID
@router.get("/{id}", response_model=EventOut)
def get_event(id: str, db: Session = Depends(get_db)):
    return db.query(Event).filter(Event.id == id).first()


# UPDATE (ADMIN)
@router.put("/{id}")
def update_event(
    id: str,
    data: EventCreate,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):
    event = db.query(Event).filter(Event.id == id).first()

    for key, value in data.dict().items():
        setattr(event, key, value)

    db.commit()
    return event


# DELETE (ADMIN)
@router.delete("/{id}")
def delete_event(
    id: str,
    db: Session = Depends(get_db),
    user=Depends(admin_required)
):
    event = db.query(Event).filter(Event.id == id).first()
    db.delete(event)
    db.commit()
    return {"msg": "Deleted"}