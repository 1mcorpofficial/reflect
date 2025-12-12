import { useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function NewReflection() {
  const nav = useNavigate();
  const [mood, setMood] = useState(3);
  const [learned, setLearned] = useState("");
  const [hard, setHard] = useState("");
  const [help, setHelp] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/api/reflections", {
        mood,
        answers: { learned, hard, help }
      });
      nav(`/r/${data.item._id}`);
    } catch (e) {
      setErr(e?.response?.data?.error || "SAVE_FAILED");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <h2>Nauja refleksija</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label>
          Savijauta (1-5):
          <input type="number" min="1" max="5" value={mood} onChange={e=>setMood(Number(e.target.value))} />
        </label>
        <textarea value={learned} onChange={e=>setLearned(e.target.value)} rows={4} placeholder="Ką šiandien išmokau?" />
        <textarea value={hard} onChange={e=>setHard(e.target.value)} rows={4} placeholder="Kas buvo sunku?" />
        <textarea value={help} onChange={e=>setHelp(e.target.value)} rows={4} placeholder="Ko man reikia / kokios pagalbos?" />
        <button type="submit">Pateikti</button>
        {err ? <div style={{ color: "crimson" }}>{err}</div> : null}
      </form>
    </div>
  );
}
