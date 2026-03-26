from fastapi import FastAPI
from app.core.init_dbse import init_db

app = FastAPI(title="FFT Church API")


# @app.on_event("startup")
# def startup():
#     init_db()