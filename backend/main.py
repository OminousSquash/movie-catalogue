from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from backend.controllers.movie_controller import router as movie_router
from backend.controllers.popularity_controller import router as genre_popularity_router
from backend.controllers.contributor_controller import router as contributor_router
from backend.controllers.polarisation_controller import router as polarisation_router
from backend.controllers.trend_analytics_controller import router as trend_analytics_router
from backend.controllers.viewer_rating_controller import router as viewer_ratings_router
from backend.controllers.personality_traits_controller import router as personality_traits_router
from backend.controllers.login_signup_controller import router as auth_router
from backend.controllers.user_list_crud_controller import router as user_list_crud_router
from backend.controllers.app_user_details_controller import router as app_user_details_router

app = FastAPI(title="Movie Catalogue API")
posters_dir = Path(__file__).resolve().parents[1] / "datasets" / "movie-posters"
app.mount("/posters", StaticFiles(directory=str(posters_dir), check_dir=False), name="posters")


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
app.include_router(contributor_router)
app.include_router(polarisation_router)
app.include_router(trend_analytics_router)
app.include_router(viewer_ratings_router)
app.include_router(personality_traits_router)
app.include_router(auth_router)
app.include_router(user_list_crud_router)
app.include_router(app_user_details_router)