"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import MarkdownDisplay from "./components/MarkdownDisplay";

interface DatasetItem {
  id: string;
  input: string;
  output: string;
}

interface ScoreState {
  medical_accuracy: number | null;
  helpfulness: number | null;
  clarity: number | null;
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dataset, setDataset] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState<DatasetItem | null>(null);
  const [scores, setScores] = useState<ScoreState>({
    medical_accuracy: null,
    helpfulness: null,
    clarity: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current number from URL (number is index+1)
  const numberParam = searchParams.get("number");
  const currentNumber = numberParam
    ? Math.max(0, parseInt(numberParam, 10) - 1)
    : 0;

  // Load dataset
  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const response = await fetch("/dataset.json");
        if (!response.ok) {
          throw new Error("Failed to load dataset");
        }
        const data = await response.json();
        setDataset(data);
        setLoading(false);
      } catch (err) {
        setError("Error loading dataset. Please try again.");
        setLoading(false);
      }
    };

    fetchDataset();
  }, []);

  // Set current item based on number parameter
  useEffect(() => {
    if (dataset.length > 0 && currentNumber < dataset.length) {
      setCurrentItem(dataset[currentNumber]);
      // Reset scores when moving to a new item
      setScores({
        medical_accuracy: null,
        helpfulness: null,
        clarity: null,
      });
    }
  }, [dataset, currentNumber]);

  // Handle score selection
  const handleScoreSelect = (category: keyof ScoreState, value: number) => {
    setScores((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // Check if all scores are selected
  const allScoresSelected =
    scores.medical_accuracy !== null &&
    scores.helpfulness !== null &&
    scores.clarity !== null;

  // Handle submission
  const handleSubmit = async () => {
    if (!currentItem || !allScoresSelected) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/label", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentItem.id,
          input: currentItem.input,
          output: currentItem.output,
          medical_accuracy: scores.medical_accuracy,
          helpfulness: scores.helpfulness,
          clarity: scores.clarity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit label");
      }

      // Move to next item (number is index+1)
      router.push(`?number=${currentNumber + 2}`);
    } catch (err) {
      setError("Error submitting label. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-gray-700">Loading dataset...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!currentItem) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-gray-700">
            No item found at index {currentNumber} (number {currentNumber + 1}).
          </p>
          <Link href="?number=1">
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Start from beginning
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              Nuriyev Toolkit: RLHF Labeling
            </h1>
            <div className="text-sm font-medium">
              Item: {currentNumber + 1} / {dataset.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Input */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Input:</h2>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <MarkdownDisplay content={currentItem.input} />
            </div>
          </div>

          {/* Output */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Output:</h2>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
              <MarkdownDisplay content={currentItem.output} />
            </div>
          </div>

          {/* Scoring Section */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-medium text-gray-900">Scoring:</h2>

            {/* Medical Accuracy */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Medical Accuracy (1-5):
              </p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={`medical-${score}`}
                    onClick={() => handleScoreSelect("medical_accuracy", score)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium 
                      ${
                        scores.medical_accuracy === score
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Helpfulness */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Helpfulness (1-5):
              </p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={`helpfulness-${score}`}
                    onClick={() => handleScoreSelect("helpfulness", score)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium 
                      ${
                        scores.helpfulness === score
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Clarity */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Clarity (1-5):
              </p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={`clarity-${score}`}
                    onClick={() => handleScoreSelect("clarity", score)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium 
                      ${
                        scores.clarity === score
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={!allScoresSelected || submitting}
              className={`w-full py-3 px-4 rounded-md text-white font-medium 
                ${
                  allScoresSelected && !submitting
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              {submitting ? "Submitting..." : "Submit & Continue"}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between text-sm pt-2">
            <Link href={`?number=${Math.max(1, currentNumber)}`}>
              <button className="text-blue-600 hover:text-blue-800">
                ← Previous
              </button>
            </Link>
            <Link href={`?number=${currentNumber + 2}`}>
              <button className="text-blue-600 hover:text-blue-800">
                Skip →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
