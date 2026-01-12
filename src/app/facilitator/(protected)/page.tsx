"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { csrfFetch } from "@/lib/csrf-client";

type Group = {
  id: string;
  name: string;
  description?: string | null;
  code: string;
};

export default function FacilitatorHome() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/groups");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Nepavyko gauti grupių");
      }
      const data = await res.json();
      setGroups(data.groups ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepavyko gauti grupių");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    setStatus("Kuriama...");
    const res = await csrfFetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setName("");
      setDescription("");
      await load();
      setStatus("Sukurta");
    } else {
      const d = await res.json().catch(() => ({}));
      setStatus(d.error ?? "Klaida");
    }
  };

  return (
    <div className="page-shell flex max-w-5xl flex-col gap-6 py-8">
      <div className="space-y-2">
        <Badge variant="muted">Fasilitatorius</Badge>
        <h1 className="text-3xl font-semibold">Grupės ir dalyviai</h1>
        <p className="text-muted-foreground">
          Sukurk grupę, importuok dalyvius, kurk veiklas.
        </p>
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" asChild>
          <Link href="/facilitator/login">Prisijungti</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nauja grupė</CardTitle>
          <CardDescription>Greita forma grupei sukurti.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Pavadinimas"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Aprašymas (nebūtina)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button onClick={create}>Sukurti</Button>
            {status && <span className="text-sm text-muted-foreground">{status}</span>}
          </div>
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-muted-foreground">Kraunama...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Kodas: {group.code}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void navigator.clipboard.writeText(group.code)}
                >
                  Kopijuoti
                </Button>
              </div>
              <Button asChild variant="outline">
                <Link href={`/facilitator/${group.id}`}>Atidaryti grupę</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground px-2">Dar nėra grupių.</p>
        )}
      </div>
    </div>
  );
}
