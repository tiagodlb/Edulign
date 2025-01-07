import Image from "next/image";

export function RegisterHero() {
  return (
    <div className="hidden lg:block lg:w-1/2 relative">
      <Image
        src="/placeholder.jpg"
        alt="Estudantes colaborando em um projeto"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 flex items-end p-16">
        <div className="space-y-2 text-white">
          <h2 className="text-4xl font-bold">
            Comece sua jornada para o sucesso no ENADE
          </h2>
          <p className="text-lg">
            Registre-se agora e tenha acesso a recursos exclusivos de preparação.
          </p>
        </div>
      </div>
    </div>
  );
}
