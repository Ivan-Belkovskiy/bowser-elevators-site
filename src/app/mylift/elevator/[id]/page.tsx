"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LiftJson } from "@/types/elevator";
import ElevatorVideoPlayer from "@/components/ElevatorVideoPlayer/ElevatorVideoPlayer";


export default function MyLiftElevatorPage() {
  const { id } = useParams();
  const [lift, setLift] = useState<LiftJson | null>(null);
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

  return <ElevatorVideoPlayer liftData={lift} />
}
