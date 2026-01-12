"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { csrfFetch } from "@/lib/csrf-client";

export default function FacilitatorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");

  const submit = async () => {
    const emailClean = email.trim().toLowerCase();
    const passwordClean = password.trim();

    if (!emailClean || passwordClean.length < 8) {
      setStatus("El. paštas arba slaptažodis neteisingi (min 8 simboliai)");
      return;
    }

    setStatus(isRegister ? "Registruojama..." : "Jungiama...");
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister
      ? { email: emailClean, password: passwordClean, name: name || undefined }
      : { email: emailClean, password: passwordClean };

    const res = await csrfFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("Sėkmingai!");
      router.push("/facilitator");
    } else {
      setStatus(data.error ?? "Klaida");
    }
  };

  return (
    <div className="page-shell flex min-h-screen max-w-md flex-col justify-center">
      <div className="space-y-2 text-center mb-6">
        <Badge variant="muted">Fasilitatorius</Badge>
        <h1 className="text-2xl font-semibold">
          {isRegister ? "Registracija" : "Prisijungimas"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isRegister
            ? "Sukurkite naują paskyrą"
            : "Prisijunkite prie savo paskyros"}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isRegister ? "Registracija" : "Prisijungti"}</CardTitle>
          <CardDescription>
            {isRegister
              ? "Sukurkite paskyrą valdyti grupėms ir veikloms"
              : "Įveskite el. paštą ir slaptažodį"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name">Vardas (neprivaloma)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jonas Jonaitis"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">El. paštas</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Slaptažodis</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {status && (
            <p className={`text-sm ${status === "Sėkmingai!" ? "text-green-600" : "text-red-600"}`}>
              {status}
            </p>
          )}
          <Button onClick={submit} className="w-full">
            {isRegister ? "Registruotis" : "Prisijungti"}
          </Button>
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setStatus(null);
              }}
              className="text-primary hover:underline"
            >
              {isRegister
                ? "Jau turite paskyrą? Prisijunkite"
                : "Neturite paskyros? Registruokitės"}
            </button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Grįžti į pagrindinį
        </Link>
      </div>
    </div>
  );
}
