"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MyLiftEditor from "@/components/MyLiftEditor/MyLiftEditor";


export default function EditorPage() {
  const { id } = useParams();
  const [lift, setLift] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/elevators/${id}`);
        const data = await res.json();
        if (data.success) setLift(data.lift);
        else setError(data.error);
      } catch (err: any) {
        setError(err.message);
      }
    };
    if (id) load();
  }, [id]);

  if (error) return <div>Ошибка: {error}</div>;
  if (!lift) return <div>Загрузка...</div>;

  return <MyLiftEditor elevator={lift} />;
}
