import { useEffect, useState } from "react";
import ViewerRatingCorrelationHeatmap from "../components/ViewerRatingCorrelationHeatmap";
import { getGenreCorrelationMatrix } from "../services/viewerRatingService";

export default function ViewerRatingGenreCorrelation() {
    const [matrix, setMatrix] = useState({});
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadCorrelationMatrix() {
            try {
                const result = await getGenreCorrelationMatrix();
                const nextMatrix = result && typeof result === "object" ? result : {};
                const nextGenres = Object.keys(nextMatrix).sort((a, b) => a.localeCompare(b));

                if (!cancelled) {
                    setMatrix(nextMatrix);
                    setGenres(nextGenres);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setMatrix({});
                    setGenres([]);
                    setError(err?.response?.data?.detail || "Failed to load genre correlation data.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadCorrelationMatrix();
        return () => {
            cancelled = true;
        };
    }, []);

    return <ViewerRatingCorrelationHeatmap matrix={matrix} genres={genres} loading={loading} error={error} />;
}
