# Edulign

## 📚 Visão Geral do Projeto
Edulign é uma plataforma educacional abrangente projetada para alinhar experiências de aprendizagem em múltiplos contextos, facilitando o desenvolvimento acadêmico e profissional dos usuários focada principalmente no ENADE.

## 🎯 Objetivos
- Democratizar o acesso à educação de qualidade
- Personalizar experiências de aprendizagem
- Conectar alunos, professores e instituições
- Otimizar o processo educacional através de tecnologia

## 🚀 Como Começar

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn
- Banco de dados PostgreSQL (para Prisma)
- Conta Supabase (para armazenamento)

### Instalação

#### Configuração do Backend
```bash
# Clone o repositório
git clone https://github.com/seuusuario/edulign.git
cd edulign/back

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Configure o banco de dados
npx prisma migrate dev

# Popule o banco de dados
npm run seed

# Inicie o servidor de desenvolvimento
npm run dev
```

#### Configuração do Frontend
```bash
# Navegue até o diretório do frontend
cd ../edulign-front

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 💻 Acessando a Aplicação
- **Backend**: http://localhost:3000/api
- **Frontend**: http://localhost:3001
- **Documentação API**: http://localhost:3000/api-docs

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL com ORM Prisma
- **Autenticação**: JWT com bcrypt
- **Documentação API**: Swagger
- **Armazenamento**: Supabase
- **Geração de PDF**: pdf-lib
- **Integração com IA**: API OpenAI
- **Segurança**: Helmet, Express Rate Limit
- **Logs**: Morgan

### Frontend
- **Framework**: Next.js (com Turbopack)
- **Componentes UI**: Radix UI
- **Estilização**: Tailwind CSS
- **Gerenciamento de Formulários**: React Hook Form com validação Zod
- **Gerenciamento de Estado**: Zustand
- **Cliente API**: Axios, TanStack Query
- **Autenticação**: NextAuth.js
- **Temas**: next-themes
- **Geração de PDF**: jsPDF com AutoTable
- **Integração com IA**: OpenAI e AI SDK

## 📝 Scripts

### Backend
- `npm run dev`: Inicia o servidor de desenvolvimento com reinício automático
- `npm run seed`: Popula o banco de dados com dados iniciais
- `npm run test`: Executa os testes (não implementado)

### Frontend
- `npm run dev`: Inicia o servidor de desenvolvimento com Turbopack
- `npm run build`: Compila para produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o ESLint para verificação de código

## 🔄 Fluxo de Trabalho de Desenvolvimento
1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Desenvolva as alterações necessárias
4. Execute os testes locais
5. Faça commit das alterações (`git commit -m 'Adiciona nova feature'`)
6. Faça push para a branch (`git push origin feature/nome-da-feature`)
7. Abra um Pull Request

## 👥 Colaboradores
- Daniel Duarte - Desenvolvedor Full-stack
- Tiago de Lima - Desenvolvedor Full-stack
- Yasmin Mendes - Desenvolvedora Full-stack
- Lucas Emanoel Amaral - Desenvolvedora Full-stack
- Arlindo Macieira - Desenvolvedora Full-stack

## 🎓 Informações Acadêmicas
Este projeto foi desenvolvido como parte da disciplina PROJETO E DESENVOLVIMENTO DE SOFTWARE, sob orientação do Professor Dr. THALES LEVI AZEVEDO VALENTE, durante o semestre letivo 2024.2 no curso de Engenharia da Computação da Universidade Federal do Maranhão (UFMA).

## 📄 Licença
Este projeto está licenciado sob a Licença MIT - veja os detalhes abaixo.

---

## Reconhecimentos e Direitos Autorais

### Informações do Projeto
- **Versão:** 1.0
- **Data da última atualização:** 21/02/2025
- **Agradecimentos:** Universidade Federal do Maranhão (UFMA), Professor Doutor Thales Levi Azevedo Valente e colegas de curso.

### Licença MIT

Copyright (c) 2025 Daniel Duarte, Tiago de Lima, Yasmin Mendes, Lucas Emanoel Amaral, Arlindo Macieira

É concedida permissão, gratuitamente, a qualquer pessoa que obtenha uma cópia deste software e dos arquivos de documentação associados (o "Software"), para lidar no Software sem restrição, incluindo, sem limitação, os direitos de usar, copiar, modificar, fundir, publicar, distribuir, sublicenciar e/ou vender cópias do Software, e permitir que as pessoas a quem o Software é fornecido o façam, sujeitas às seguintes condições:

O aviso de direitos autorais acima e este aviso de permissão devem ser incluídos em todas as cópias ou partes substanciais do Software.

O SOFTWARE É FORNECIDO "COMO ESTÁ", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM DETERMINADO FIM E NÃO VIOLAÇÃO. EM NENHUM CASO OS AUTORES OU DETENTORES DE DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER RECLAMAÇÃO, DANOS OU OUTRA RESPONSABILIDADE, SEJA EM UMA AÇÃO DE CONTRATO, DELITO OU DE OUTRA FORMA, DECORRENTE, FORA OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTRAS NEGOCIAÇÕES NO SOFTWARE.

Para mais informações sobre a Licença MIT: https://opensource.org/licenses/MIT

---

*Última atualização: 21 de fevereiro de 2025*
