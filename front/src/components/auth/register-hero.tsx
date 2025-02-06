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
       <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <Image
                src="/edulignlogoprincipal.svg"
                alt="Logo EduLign"
                width={600}
                height={600}
                className="w-96 h-96"
              />
        </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/15 to-black flex items-end p-16 z-10">
        <div className="space-y-4 text-white max-w-1g text-left mx-auto">
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
