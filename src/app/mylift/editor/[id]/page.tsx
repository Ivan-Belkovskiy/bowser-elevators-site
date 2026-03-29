"use client";
import "./page.css";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MyLiftEditor from "@/components/MyLiftEditor/MyLiftEditor";
import { LiftJson } from "@/types/elevator";


export default function EditorPage() {
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
  if (!lift) return <div className="mylift-editor__loading">
    <span className="mylift-editor__loader"></span>
    <span className="mylift-editor__label">MyLift Editor</span>
  </div>;

  return <MyLiftEditor elevator={lift} />;
}
