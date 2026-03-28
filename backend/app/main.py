from fastapi import FastAPI
from app.core.init_dbse import init_db
from app.api import auth, events, dashboard,admin
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FFT Church API")

# ✅ CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],         # allow all methods
    allow_headers=["*"],         # allow all headers
)

# ✅ Include routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(dashboard.router)
app.include_router(admin.router)

# 🔹 Initialize database on startup
# @app.on_event("startup")
# def startup_event():
#     init_db()
#     print("Database initialized successfully ✅")