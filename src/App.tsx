
import { useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

function RecipeGenerator() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateRecipe() {
    const ingredientList = ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (ingredientList.length === 0) {
      setError("Please enter at least one ingredient.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipe("");

    try {
      const { data, errors } = await client.queries.askBedrock({
        ingredients: ingredientList,
      });

      if (errors?.length) {
        throw new Error(errors.map((e) => e.message).join(", "));
      }

      setRecipe(data?.body ?? "No recipe was generated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h1>AI Recipe Generator</h1>
      <p>Enter ingredients to generate a recipe using Amazon Nova Micro.</p>

      <label htmlFor="ingredients">Ingredients</label>
      <textarea
        id="ingredients"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Chicken, rice, garlic, onions"
        rows={4}
        style={{ width: "100%", padding: 12, marginTop: 8 }}
      />

      <button
        onClick={generateRecipe}
        disabled={loading}
        style={{ marginTop: 16, padding: "12px 20px" }}
      >
        {loading ? "Generating..." : "Generate Recipe"}
      </button>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {recipe && (
        <section style={{ marginTop: 24 }}>
          <h2>Generated Recipe</h2>
          <div style={{ whiteSpace: "pre-wrap" }}>{recipe}</div>
        </section>
      )}
    </main>
  );
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut }) => (
        <>
          <div style={{ textAlign: "right", padding: 16 }}>
            <button onClick={signOut}>Sign Out</button>
          </div>
          <RecipeGenerator />
        </>
      )}
    </Authenticator>
  );
}
