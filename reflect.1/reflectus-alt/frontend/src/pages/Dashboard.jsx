import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";

export default function Dashboard({ user, onLogout }) {
  const [today, setToday] = useState(null);
  const [items, setItems] = useState([]);

  async function load() {
    const t = await api.get("/api/reflections/today");
    setToday(t.data);
    const r = await api.get("/api/reflections");
    setItems(r.data.items || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Mokinio zona</h2>
          <div>{user.email}</div>
        </div>
        <button onClick={onLogout}>Atsijungti</button>
      </div>

      <div style={{ marginTop: 20, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Šiandien ({today?.dateKey})</h3>
        {today?.item ? (
          <div>
            <div>✅ Refleksija pateikta</div>
            <Link to={`/r/${today.item._id}`}>Peržiūrėti</Link>
          </div>
        ) : (
          <div>
            <div>⚠️ Refleksijos dar nėra</div>
            <Link to="/new">Sukurti refleksiją</Link>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Istorija</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {items.map(x => (
            <Link key={x._id} to={`/r/${x._id}`} style={{ padding: 10, border: "1px solid #eee", borderRadius: 8 }}>
              <div><b>{x.dateKey}</b> • Mood: {x.mood}/5</div>
              <div style={{ opacity: 0.8 }}>{x.answers?.learned?.slice(0, 80)}...</div>
            </Link>
          ))}
          {items.length === 0 ? <div>Kol kas nėra įrašų.</div> : null}
        </div>
      </div>
    </div>
  );
}
