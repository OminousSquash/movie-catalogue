from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.controllers.movie_controller import router as movie_router
from backend.controllers.popularity_controller import router as genre_popularity_router

app = FastAPI(title="Movie Catalogue API")


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movie_router)
app.include_router(genre_popularity_router)
