from app.core.database import Base, engine


def init_db():
    from app.models.chr_models import (
        User,
        Member,
        Event,
        EventAttendance,
        Donation,
        Verse,
        BibleVerse,
        PrayerRequest,
        AdminActionLog,
        OTPS,
        Feedback,
        FeedbackReply,
    )
    Base.metadata.create_all(bind=engine)