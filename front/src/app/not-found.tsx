import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Página não encontrada</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Ops! A página que você está procurando não existe.
      </p>
      <Link href="/">
        <Button>Voltar para a página inicial</Button>
      </Link>
    </div>
  );
}
