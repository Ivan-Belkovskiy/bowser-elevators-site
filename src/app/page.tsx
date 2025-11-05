'use client';
import { useState } from "react";

export default function HomePage() {
  const [count, setCount] = useState(0);
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <img src='/images/logo.png' alt="" className="logo" />
      <button onClick={() => setCount(count + 1)}>Меня нажали {count} раз!</button>
    </main>
  );
}