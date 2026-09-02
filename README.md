<div align="center">

```text
    ____  __           _____                      __ 
   / __ )/ /_  _____  / ___/______________  __  / /_
  / __  / / / / / _ \ \__ \/ ___/ ___/ __ \/ / / / __/
 / /_/ / / /_/ /  __/ ___/ / /__/ /  / /_/ / /_/ / /_ 
/_____/_/\__,_/\___/ /____/\___/_/   \__, /\__,_/\__/ 
                                    /____/            
                 by Akira Rech v1.0.0

```

### Cofre local seguro. Zero nuvem. Criptografia avançada.

---

# 🛡️ BlueScrypt CLI

**BlueScrypt** é uma ferramenta de linha de comando (CLI) interativa, minimalista e autônoma, desenvolvida para o gerenciamento seguro de credenciais e utilitários criptográficos locais. O objetivo principal do projeto é fornecer uma alternativa enxuta, auditável e *zero-dependency-cloud* para profissionais de tecnologia e entusiastas de segurança que demandam controle total sobre a custódia de suas chaves.

---
</div>

## 🔒 Arquitetura de criptografia

O **BlueScrypt** adota um modelo de **Zero-Knowledge Local**: nenhum dado, metadado ou chave mestre deixa o ambiente de execução do usuário.

* **Derivação de chave (KDF):** Utiliza o algoritmo nativo `PBKDF2` (*Password-Based Key Derivation Function 2*) combinado com `SHA-256`, aplicando um alto número de iterações e *salts* criptograficamente aleatórios (`crypto.randomBytes`) gerados por sessão/cofre.
* **Cifra simétrica:** Criptografia de dados via **AES-256-CBC** (*Advanced Encryption Standard* com vetor de inicialização - IV aleatório por operação de escrita).
* **Gerador de senhas criptográfico (PRNG):** A funcionalidade de geração de senhas consome a entropia do barramento do sistema operacional (`crypto.randomInt`), evitando a previsibilidade de geradores pseudo-aleatórios convencionais (`Math.random`).
* **Gerenciamento seguro de memória volátil:**
* Tratamento do sinal `SIGINT` (Ctrl+C) para interceptar o encerramento abrupto do processo.
* Sobrescrita explícita de *buffers* em memória (`Buffer.alloc(0)`) e limpeza de referências de objetos ao trancar o cofre ou fechar a aplicação.


* **Sanitização de clipboard:** Integração com limpeza temporal automática (10 segundos) da área de transferência para conter *clipboard hijacking* e mitigar a exposição de segredos em logs de sistema.

---

## 📦 Tecnologias usadas

* **Runtime & Compiler:** [Bun](https://bun.sh/) (compilação *standalone* AOT para binários nativos de plataforma).
* **Linguagem:** TypeScript (ESM - ECMAScript Modules).
* **Interface CLI:** `@inquirer/prompts` (prompts interativos e mascaramento de senha no buffer do terminal).
* **Integração com SO:** `clipboardy` para manipulação de *clipboard*.

---

## 🚀 Downloads

Baixe a versão pré-compilada para a sua plataforma sem precisar instalar dependências:

| Plataforma | Arquivo | Download |
| --- | --- | --- |
| 🪟 **Windows** | `bluescrypt-win.exe` | [Baixar .exe](https://github.com/cosmeramos/bluescrypt/releases/latest/download/bluescrypt-win.exe) |
| 🐧 **Linux** | `bluescrypt-linux` | [Baixar binário](https://github.com/cosmeramos/bluescrypt/releases/latest/download/bluescrypt-linux) |
| 🍎 **macOS** | `bluescrypt-macos` | [Baixar binário](https://github.com/cosmeramos/bluescrypt/releases/latest/download/bluescrypt-macos) |

> 💡 **Dica rápida:** Acesse a lista completa de versões e o histórico de mudanças diretamente na aba de **[Releases do GitHub](https://github.com/cosmeramos/bluescrypt/releases/latest)**.

---

## 💻 Como executar

### I. Binário compilado (Direto)

Não é necessário ter Node.js ou Bun instalados. Baixe o executável na tabela de Downloads e rode no terminal:

| Plataforma | Comando de Execução |
| --- | --- |
| **Windows** | `.\bluescrypt-win.exe` |
| **Linux** | `chmod +x bluescrypt-linux && ./bluescrypt-linux` |
| **macOS** | `chmod +x bluescrypt-macos && ./bluescrypt-macos` |

### II. A partir do Código-Fonte (Desenvolvimento)

**Pré-requisito:** Bun v1.0+ instalado.

```bash
# I. Clonar o repositório
git clone [https://github.com/cosmeramos/bluescrypt.git](https://github.com/cosmeramos/bluescrypt.git)
cd bluescrypt

# II. Instalar dependências
bun install

# III. Executar o projeto
bun src/index.ts

```

---

## ⚠️ Resolução de problemas frequentes

* **Windows Defender bloqueando a execução:** Por ser um executável não assinado digitalmente, o SmartScreen pode exibir um aviso no primeiro uso. Clique em *"Mais informações"* e selecione *"Executar assim mesmo"*.
* **Permissão negada no Linux/macOS (`permission denied`):** Lembre-se de rodar `chmod +x <nome-do-arquivo>` antes da primeira execução para atribuir permissões de binário executável.

---

## 🗺️ Roadmap & próximas melhorias

Buscamos aprimorar continuamente o **BlueScrypt** para atender a padrões de auditoria e *hardening*. As seguintes frentes estão sob análise de viabilidade:

* [X] **Migração de Cifra (AES-GCM):** Transição do modo CBC para **AES-256-GCM** (*Galois/Counter Mode*) para prover *Authenticated Encryption* (AEAD), garantindo integridade e autenticidade juntamente à confidencialidade.
* [X] **Derivação via Argon2id:** Substituição/Suporte opcional ao `Argon2id` como KDF padrão, aumentando a resistência contra ataques baseados em hardware especializado (GPUs/ASICs).
* [X] **Cofre Centralizado Global (`~/.bluescrypt`):** Suporte a um diretório de configuração padrão no perfil do usuário, permitindo acessar o cofre de qualquer ponto do terminal sem depender do diretório atual de trabalho.
* [ ] **Lockdown de Memória (`mlock`):** Exploração de chamadas nativas de sistema para evitar que a memória contendo as chaves seja gravada em discos de *swap* (paginação).
* [ ] **Exportação/Importação Encriptada:** Mecanismos de *backup* com redundância e chave de recuperação.

---

## 📄 Licença

Este projeto está distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---
