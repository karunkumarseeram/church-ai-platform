from fastapi import FastAPI
from app.core.init_dbse import init_db
from fastapi import FastAPI
from app.api import auth, events,dashboard

# app = FastAPI()


app = FastAPI(title="FFT Church API")

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(dashboard.router)
# @app.on_event("startup")
# def startup():
#     init_db()