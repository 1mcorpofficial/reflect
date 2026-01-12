"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { csrfFetch } from "@/lib/csrf-client";

export default function ParticipantLogin() {
  const router = useRouter();
  const [groupCode, setGroupCode] = useState("");
  const [personalCode, setPersonalCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    setStatus("Jungiama...");
    const res = await csrfFetch("/api/participants/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupCode, personalCode }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("Prisijungta");
      router.push("/participant");
    } else {
      setStatus(data.error ?? "Prisijungti nepavyko");
    }
  };

  return (
    <div className="page-shell flex min-h-screen max-w-md flex-col justify-center">
      <div className="space-y-2 text-center mb-6">
        <Badge variant="muted">Dalyvis</Badge>
        <h1 className="text-2xl font-semibold">Prisijungimas</h1>
        <p className="text-sm text-muted-foreground">
          Įvesk grupės kodą ir savo kodą.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Prisijungti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Grupės kodas"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
          />
          <Input
            placeholder="Tavo kodas"
            value={personalCode}
            onChange={(e) => setPersonalCode(e.target.value)}
          />
          <Button onClick={submit}>Prisijungti</Button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
