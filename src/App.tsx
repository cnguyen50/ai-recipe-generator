
import { useState, type FormEvent } from "react";
import {
  Authenticator,
  Loader,
  Placeholder,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import "./App.css";

const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

function RecipeGenerator() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const ingredients = (formData.get("ingredients")?.toString() ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (ingredients.length === 0) {
      setError("Please enter at least one ingredient.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients,
      });

      if (errors?.length) {
        throw new Error(errors.map((e) => e.message).join(", "));
      }

      setResult(data?.body ?? "No recipe was generated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Recipe AI</span>
        </h1>

        <p className="description">
          Enter a few ingredients separated by commas, and Amazon Nova
          Micro will generate a recipe just for you.
        </p>
      </div>

      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Chicken, rice, garlic, onions..."
            required
          />

          <button
            type="submit"
            className="search-button"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>

      <div className="result-container">
        {error && (
          <p role="alert" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        {loading ? (
          <div className="loader-container">
            <p>Generating your recipe...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          result && <p className="result">{result}</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut }) => (
        <>
          <div className="sign-out-container">
            <button onClick={signOut} className="sign-out-button">
              Sign Out
            </button>
          </div>

          <RecipeGenerator />
        </>
      )}
    </Authenticator>
  );
}
