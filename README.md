<div align="center">
  <pre>
    ____  __           _____                      __ 
   / __ )/ /_  _____  / ___/______________  __  / /_
  / __  / / / / / _ \ \__ \/ ___/ ___/ __ \/ / / / __/
 / /_/ / / /_/ /  __/ ___/ / /__/ /  / /_/ / /_/ / /_ 
/_____/_/\__,_/\___/ /____/\___/_/   \__, /\__,_/\__/ 
                                    /____/            
                 by Akira Rech v1.0.0
  </pre>
  <h3>Cofre local seguro. Zero nuvem. Criptografia avançada.</h3>
</div>

---

BlueScrypt CLI
BlueScrypt é uma ferramenta de linha de comando (CLI) interativa, minimalista e autônoma, desenvolvida para o gerenciamento seguro de credenciais e utilitários criptográficos locais. O objetivo principal do projeto é fornecer uma alternativa enxuta, auditável e zero-dependency-cloud para profissionais de tecnologia e entusiastas de segurança que demandam controle total sobre a custódia de suas chaves.

🔒 Arquitetura de criptografia & segurança
O BlueScrypt adota um modelo de Zero-Knowledge Local: nenhum dado, metadado ou chave mestre deixa o ambiente de execução do usuário.

Derivação de chave (KDF): Utiliza o algoritmo nativo PBKDF2 (Password-Based Key Derivation Function 2) combinado com SHA-256, aplicando um alto número de iterações e salts criptograficamente aleatórios (crypto.randomBytes) gerados por sessão/cofre.

Cifra simétrica: Criptografia de dados via AES-256-CBC (Advanced Encryption Standard com vetor de inicialização - IV aleatório por operação de escrita).

Gerador de senhas criptográfico (PRNG): A funcionalidade de geração de senhas consome a entropia do barramento do sistema operacional (crypto.randomInt), evitando a previsibilidade de geradores pseudo-aleatórios convencionais (Math.random).

Gerenciamento Seguro de Memória Volátil:

Tratamento do sinal SIGINT (Ctrl+C) para interceptar o encerramento abrupto do processo.

Sobrescrita explícita de buffers em memória (Buffer.alloc(0)) e limpeza de referências de objetos ao trancar o cofre ou fechar a aplicação.

Sanitização de Clipboard: Integração com limpeza temporal automática (10 segundos) da área de transferência para conter clipboard hijacking e mitigar a exposição de segredos em logs de sistema.

📦 Tecnologias Utilizadas
Runtime & Compiler: Bun (compilação standalone AOT para binários nativos de plataforma).

Linguagem: TypeScript (ESM - ECMAScript Modules).

Interface CLI: @inquirer/prompts (prompts interativos e mascaramento de senha no buffer do terminal).

Integração com SO: clipboardy para manipulação de clipboard.

🚀 Como Executar
Vai pelo binário compilado
Não é necessário ter Node.js ou Bun instalados. Baixe o executável pré-compilado para a sua plataforma na aba de Releases.

Windows
PowerShell
.\bluescrypt-win.exe
Linux / macOS
Bash
chmod +x bluescrypt-linux
./bluescrypt-linux
Ou vai pela execução via Código-Fonte
Pré-requisitos
Bun v1.0+ instalado.

Passos
Bash
# Clone o repositório
git clone https://github.com/cosmeramos/bluescrypt.git
cd bluescrypt

# Instale as dependências
bun install

# Execute em modo de desenvolvimento
bun src/index.ts
🛠️ Scripts de Build
Para compilar manualmente os binários autônomos utilizando o empacotador nativo do Bun:

Bash
# Build para a plataforma atual (ex: Windows)
bun run build

# Build multiplataforma
bun run build:all
Os executáveis gerados serão salvos no diretório build/.

🗺️ Roadmap & próximas possiveis melhorias
Buscamos aprimorar continuamente o BlueScrypt para atender a padrões de auditoria e hardening. As seguintes frentes estão em desenvolvimento ou sob análise de viabilidade:

[ ] Migração de cifra (AES-GCM): Transição do modo CBC para AES-256-GCM (Galois/Counter Mode) para prover Authenticated Encryption (AEAD), garantindo integridade e autenticidade juntamente à confidencialidade.

[ ] Derivação via argon2id: Substituição/Suporte opcional ao Argon2id como KDF padrão, aumentando a resistência contra ataques baseados em hardware especializado (GPUs/ASICs).

[ ] Cofre centralizado global (~/.bluescrypt): Suporte a um diretório de configuração padrão no perfil do usuário, permitindo acessar o cofre de qualquer ponto do terminal sem depender do diretório atual de trabalho.

[ ] Lockdown de memória (mlock): Exploração de chamadas nativas de sistema para evitar que a memória contendo as chaves seja gravada em discos de swap (paginação).

[ ] Exportação/importação encriptada: Mecanismos de backup com redundância e chave de recuperação.

📄 Licença
Este projeto está distribuído sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
