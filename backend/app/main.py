from fastapi import FastAPI
from app.core.init_dbse import init_db
from app.api import auth, events, dashboard

app = FastAPI(title="FFT Church API")

# ✅ Include routers
# app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(dashboard.router)
# app.include_router(events.router, prefix="/events", tags=["Events"])
# app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

# 🔹 Initialize database on startup
# @app.on_event("startup")
# def startup_event():
#     init_db()
#     print("Database initialized successfully ✅")