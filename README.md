<div align="center">

```text
    ____  __           _____                      __ 
   / __ )/ /_  _____  / ___/______________  __  / /_
  / __  / / / / / _ \ \__ \/ ___/ ___/ __ \/ / / / __/
 / /_/ / / /_/ /  __/ ___/ / /__/ /  / /_/ / /_/ / /_ 
/_____/_/\__,_/\___/ /____/\___/_/   \__, /\__,_/\__/ 
                                    /____/            
                 by Akira Rech v1.2.0

```

### Cofre local seguro. Criptografia avançada.

---

# **/> BlueScrypt v1.2.0**

**BlueScrypt** é um gerenciador de senhas local-first, soberano e zero-knowledge, projetado para oferecer segurança criptográfica de nível industrial e extrema acessibilidade. Combinando Argon2id, a função autoral de deformação por entropia $H_{\Omega}$, cifra AES-256-GCM e o protocolo Zeroize de limpeza ativa de memória RAM, o BlueScrypt garante proteção máxima sem que dados ou chaves mestres jamais deixem o seu dispositivo.

---
</div>
## 🔒 Arquitetura de Criptografia e Segurança

O **BlueScrypt** adota um modelo estrito de **Zero-Knowledge Local**: nenhum dado, metadado ou chave mestre deixa o ambiente de execução do usuário ou trafega pela rede.

* **Derivação de Chave de Alta Resistência (KDF):** Utiliza o algoritmo **Argon2id** (vencedor da *Password Hashing Competition* e recomendado pelas diretrizes OWASP) configurado para **64 MB de alocação de RAM**, 3 iterações de processamento e 4 threads concorrentes, neutralizando ataques massivos paralelos.
* **Escudo Autoral de Entropia ($H_{\Omega}$):** Implementação da função autoral de deformação vetorial $H_{\Omega}$, que aplica transformações não lineares pseudo-estocásticas baseadas na Proporção Áurea ($\phi$) e dispersão logarítmica sobre a chave do Argon2id, criando uma barreira extra contra força bruta via hardware especializado (GPUs e ASICs).
* **Cifra Simétrica com Autenticação (AEAD):** Criptografia de dados via **AES-256-GCM** (*Galois/Counter Mode*), garantindo confidencialidade, integridade e verificação de autenticidade através de *Auth Tags* de 128 bits e Vetores de Inicialização (IV) de 96 bits gerados estocasticamente a cada operação.
* **Gerador de Senhas Criptográfico (PRNG):** A funcionalidade de geração de senhas consome diretamente a entropia do barramento do sistema operacional (`crypto.randomInt`), eliminando qualquer previsibilidade associada a geradores pseudo-aleatórios convencionais (`Math.random`).
* **Gerenciamento e Sanitização de Memória Volátil (*Zeroize Protocol*):**
  * Manipulação de segredos e chaves através de `Buffer` e `Uint8Array` mutáveis.
  * Blocos de controle `try...finally` garantem a sobrescrita compulsória com zeros (`.fill(0)`) e anulação de referências na memória RAM imediatamente após cada operação criptográfica.
  * Tratamento ativo de sinais do sistema operacional (`SIGINT` / `Ctrl+C`) para assegurar a limpeza de memória mesmo no encerramento abrupto da aplicação.
* **Proteção contra Hijacking de Area de Transferência:** Sanitização temporal automática (10 segundos) do Clipboard do sistema operacional para mitigar a exposição de segredos em logs e ataques de escuta de clipboard.

---

## 📦 Tecnologias Utilizadas

* **Runtime & Compiler:** [Bun](https://bun.sh/) (Compilação *standalone* AOT para binários nativos sem dependências externas).
* **Linguagem:** TypeScript (ESM - ECMAScript Modules com tipagem estrita `strictNullChecks`).
* **Criptografia & Core:** Node.js Native `crypto` + `argon2`.
* **Interface CLI:** `@inquirer/prompts` (prompts interativos com mascaramento de buffer no terminal).
* **Integração com SO:** `clipboardy` para manipulação segura e temporal do Clipboard.

---

## 🚀 Downloads (Releases v1.2.0)

Baixe a versão pré-compilada executável para a sua plataforma sem a necessidade de instalar runtimes ou dependências externas:

| Plataforma | Arquivo | Download |
| :--- | :--- | :--- |
| 🪟 **Windows** | `bluescrypt-win.exe` | [Baixar Executável](https://github.com/cosmeramos/bluescrypt/releases) |
| 🐧 **Linux** | `bluescrypt-linux` | [Baixar Binário](https://github.com/cosmeramos/bluescrypt/releases) |
| 🍎 **macOS** | `bluescrypt-macos` | [Baixar Binário](https://github.com/cosmeramos/bluescrypt/releases) |

💡 *Dica rápida: Acesse a lista completa de versões e o histórico detalhado de mudanças na aba de **Releases** do repositório no GitHub.*

---

## 💻 Como Executar

### I. Binário Compilado (Direto)
Não é necessário ter Node.js ou Bun instalados no sistema. Baixe o executável correspondente e rode pelo terminal:

| Plataforma | Comando de Execução |
| :--- | :--- |
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

# III. Executar os testes automatizados da criptografia
bun src/test-crypto.ts

# IV. Executar a aplicação principal
bun src/index.ts

```

---

## ⚠️ Resolução de problemas frequentes

* **Windows Defender bloqueando a execução:** Por ser um executável não assinado digitalmente, o SmartScreen pode exibir um aviso no primeiro uso. Clique em *"Mais informações"* e selecione *"Executar assim mesmo"*.
* **Permissão negada no Linux/macOS (`permission denied`):** Lembre-se de rodar `chmod +x <nome-do-arquivo>` antes da primeira execução para atribuir permissões de binário executável.

---

## 🗺️ Roadmap & próximas melhorias

Buscamos aprimorar continuamente o **BlueScrypt** para atender a padrões de auditoria e *hardening*. As seguintes frentes estão sob análise de viabilidade:

* [x] **Migração para AES-256-GCM:** Autenticação e integridade de dados via AEAD (v1.2.0).
* [X] **Derivação via Argon2id + *HΩ*:** Proteção avançada e deformação de chaves contra ataques de hardware (v1.2.0).
* [ ] **Protocolo Zeroize na RAM:** Sobrescrita ativa de memória com try...finally (v1.2.0).
* [X] **Cofre Centralizado Global (`~/.bluescrypt`):** Suporte a um diretório de configuração padrão no perfil do usuário, permitindo acessar o cofre de qualquer ponto do terminal sem depender do diretório atual de trabalho.(v1.1.0)
* [ ] **Lockdown de Memória (`mlock`):** Exploração de chamadas nativas de sistema para evitar que a memória contendo as chaves seja gravada em discos de *swap* (paginação).
* [ ] **Exportação/Importação Encriptada:** Mecanismos de *backup* com redundância e chave de recuperação.

---

## 📄 Licença

Este projeto está distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---
