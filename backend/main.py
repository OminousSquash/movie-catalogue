from fastapi import FastAPI
from controllers.movie_controller import router as movie_router

app = FastAPI(title="Movie Catalogue API")

app.include_router(movie_router)