import {
  BarChart3,
  Lock,
  Sparkles,
  Users2,
} from "lucide-react";
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

const flows = [
  {
    title: "Grupės refleksija",
    body: "Fasilitatorius kuria veiklą, dalyviai atsako telefone, dashboard rodo gyvą užpildymą.",
    icon: <Users2 className="h-5 w-5 text-primary" />,
  },
  {
    title: "Privatumo jungiklis",
    body: "Vardinė arba anoniminė refleksija kiekvienai veiklai. Eksportai gerbia pasirinktą režimą.",
    icon: <Lock className="h-5 w-5 text-primary" />,
  },
  {
    title: "Analitika be triukšmo",
    body: "Pasiskirstymai, trendai, completion rate ir individualus progresas (vardiniu režimu).",
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
  },
];

const questionTypes = [
  "Šviesoforas",
  "Skalė / termometras",
  "Neužbaigtos frazės",
  "Laisvas tekstas",
];

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-background to-muted/30">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-16 pt-12 sm:px-10 lg:px-12">
        <section className="space-y-6 rounded-3xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur">
          <Badge className="w-fit rounded-full bg-primary/10 px-3 py-1 text-primary">
            Reflectus · MVP
          </Badge>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Refleksijos grupėms su aiškia, veiksminga statistika
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
              Sukurk veiklą, pasirink privatumo režimą, pakviesk dalyvius kodu ir
              gauk įžvalgas be perteklinio sudėtingumo. Mobile-first pildymas,
              desktop-first dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button size="lg" className="gap-2 sm:w-auto" asChild>
              <Link href="/facilitator/login">Fasilitatoriaus prisijungimas</Link>
            </Button>
            <Button variant="outline" size="lg" className="sm:w-auto" asChild>
              <Link href="/participant/login">Dalyvio prisijungimas</Link>
            </Button>
          </div>
          <div className="grid gap-4 rounded-2xl bg-muted/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat title="Privatumo režimai" value="Vardinė / Anoniminė" />
            <Stat title="Klausimų tipai" value={questionTypes.join(" · ")} />
            <Stat title="Eksportas" value="CSV / JSON" />
            <Stat title="Offline pildymas" value="Autosave + sync" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((item) => (
            <Card key={item.title} className="h-full">
              <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {item.icon}
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {item.body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle>Klausimų biblioteka</CardTitle>
              </div>
              <CardDescription>
                Greitai pritaikomi tipai mokykloms, terapinėms grupėms ir
                darbovietėms.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {questionTypes.map((type) => (
                <Badge key={type} variant="muted" className="justify-between">
                  {type}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <CardTitle>Analitika pasiruošusi AI</CardTitle>
              </div>
              <CardDescription>
                Completion rate, pasiskirstymai, trendai. Struktūra jau paruošta
                AI suvestinėms ir emocijų analizei.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <ProgressRow label="Completion rate" value="78%" />
              <ProgressRow label="Termometras · vidurkis" value="3.8 / 5" />
              <ProgressRow label="Tekstiniai atsakymai" value="129 įžvalgų" />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
