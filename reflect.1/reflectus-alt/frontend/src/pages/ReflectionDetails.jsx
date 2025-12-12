import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Link, useParams } from "react-router-dom";

export default function ReflectionDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api.get(`/api/reflections/${id}`).then(r => setItem(r.data.item));
  }, [id]);

  if (!item) return <div style={{ padding: 16 }}>Kraunama...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <Link to="/">← Atgal</Link>
      <h2>{item.dateKey}</h2>
      <div>Mood: {item.mood}/5</div>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <div><b>Ką išmokau:</b><div>{item.answers.learned}</div></div>
        <div><b>Kas buvo sunku:</b><div>{item.answers.hard}</div></div>
        <div><b>Ko reikia:</b><div>{item.answers.help}</div></div>
        {item.teacherComment ? (
          <div style={{ marginTop: 10, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>
            <b>Mokytojo komentaras:</b>
            <div>{item.teacherComment}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
