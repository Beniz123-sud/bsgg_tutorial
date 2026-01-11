"use client";

import { useEffect, useState } from "react";

export default function PageV3() {
  const [count, setCount] = useState(0);
  const [squared, setSquared] = useState(0);

  function increment() {
    setCount((value) => value + 1);
  }

  const decrement = () => {
    setCount((value) => value - 1);
  };

  useEffect(() => {
    setSquared(count * count);
  }, [count]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-black">
      <h1 className="text-3xl font-semibold">Counter: {count}</h1>
      <p className="text-lg text-gray-700">Quadrat: {squared}</p>
      <div className="flex gap-4">
        <button
          onClick={increment}
          className="rounded bg-blue-600 px-5 py-3 text-lg font-medium text-white hover:bg-blue-700"
        >
          Increment
        </button>
        <button
          onClick={decrement}
          className="rounded bg-gray-200 px-5 py-3 text-lg font-medium text-gray-900 hover:bg-gray-300"
        >
          Decrement
        </button>
      </div>
    </main>
  );
}
