#!/usr/bin/env node
import { select, password as passwordPrompt, input } from '@inquirer/prompts';
import * as clipboardy from 'clipboardy';
import { generateSalt, deriveKey, encrypt, decrypt, generateStrongPassword } from './crypto.js';
import { saveVault, loadVault } from './storage.js';
// IDENTIDADE VISUAL
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const ORANGE = '\x1b[33m';
process.on('SIGINT', () => {
    console.log(BLUE + '\n🔒 Encerramento de emergência detectado.' + RESET);
    try {
        clipboardy.default.writeSync(''); // Yep, tenta limpar o clipboard
    }
    catch (e) { } // Yep, ignora se der erro
    console.log('Chaves destruídas da memória. BlueScrypt encerrado.');
    process.exit(0);
});
function printLogo() {
    console.clear();
    console.log(BLUE + `
    ____  __           _____                      __ 
   / __ )/ /_  _____  / ___/______________  __  / /_
  / __  / / / / / _ \\ \\__ \\/ ___/ ___/ __ \\/ / / / __/
 / /_/ / / /_/ /  __/ ___/ / /__/ /  / /_/ / /_/ / /_ 
/_____/_/\\__,_/\\___/ /____/\\___/_/   \\__, /\\__,_/\\__/ 
                                    /____/            
                 by Akira Rech v1.0.0
  ` + RESET);
}
// FLUXO DE SEGURANÇA
async function openVaultInteractive() {
    const existingVault = loadVault();
    if (!existingVault) {
        console.log(ORANGE + '⚠️ Cofre não encontrado no diretório atual. Criando novo cofre...' + RESET);
        const masterPass = await passwordPrompt({ message: 'Crie uma Senha Mestre forte:', mask: '*' });
        const confirmPass = await passwordPrompt({ message: 'Confirme a Senha Mestre:', mask: '*' });
        if (masterPass !== confirmPass) {
            console.log('❌ As senhas não coincidem. Sistema abortado.');
            process.exit(1);
        }
        const salt = generateSalt();
        const key = deriveKey(masterPass, salt);
        return { key, data: {}, salt, isNew: true };
    }
    const masterPass = await passwordPrompt({ message: '🔑 Digite sua Senha Mestre:', mask: '*' });
    try {
        const key = deriveKey(masterPass, existingVault.salt);
        const decryptedData = decrypt(existingVault.payload, key);
        return { key, data: JSON.parse(decryptedData), salt: existingVault.salt, isNew: false };
    }
    catch (error) {
        console.log('\n❌ ACESSO NEGADO: Senha incorreta ou arquivo corrompido.\n');
        process.exit(1);
    }
}
// LOOP PRINCIPAL
async function mainMenu() {
    printLogo();
    const session = await openVaultInteractive();
    let vaultData = session.data;
    let masterKey = session.key;
    let salt = session.salt;
    if (session.isNew) {
        saveVault(salt, encrypt(JSON.stringify(vaultData), masterKey));
    }
    while (true) {
        printLogo();
        console.log(GREEN + '🔓 Cofre aberto e protegido na memória volátil.\n' + RESET);
        const action = await select({
            message: 'O que você deseja fazer?',
            choices: [
                { name: '1. 🔍 Navegar/Ver senhas', value: 'view' },
                { name: '2. ➕ Adicionar nova senha', value: 'add' },
                { name: '3. ⚡ Gerar Senha Segura (Automático)', value: 'generate' },
                { name: '4. 🗑️ Apagar uma senha', value: 'delete' },
                { name: '5. 🚪 Trancar cofre e sair', value: 'exit' }
            ],
        });
        switch (action) {
            case 'view':
                const services = Object.keys(vaultData);
                if (services.length === 0) {
                    console.log(ORANGE + '\nO cofre está vazio.' + RESET);
                    await input({ message: 'Pressione ENTER para voltar...' });
                    break;
                }
                const selectedService = await select({
                    message: 'Selecione o serviço para copiar a senha:',
                    choices: [...services.map(s => ({ name: s, value: s })), { name: '⬅️ Voltar', value: 'back' }]
                });
                if (selectedService !== 'back') {
                    const pass = vaultData[selectedService] || '';
                    try {
                        clipboardy.default.writeSync(pass);
                        console.log(GREEN + `\n✅ Senha copiada para a área de transferência!` + RESET);
                        console.log(`[A senha visível é: ${pass}]`);
                        console.log(ORANGE + '⚠️ A área de transferência será limpa em 10 segundos...' + RESET);
                        setTimeout(() => {
                            try {
                                clipboardy.default.writeSync('');
                            }
                            catch (e) { }
                        }, 10000);
                    }
                    catch (err) {
                        console.log(ORANGE + '\n⚠️ O sistema operacional bloqueou o acesso automático à área de transferência.' + RESET);
                        console.log(`Você precisará copiar manualmente: [ ${pass} ]`);
                    }
                    await input({ message: '\nPressione ENTER para voltar ao menu...' });
                }
                break;
            case 'add':
                const newService = await input({ message: 'Nome do serviço (ex: GitHub):' });
                const newPass = await passwordPrompt({ message: 'Digite a senha a ser guardada:', mask: '*' });
                vaultData[newService] = newPass;
                saveVault(salt, encrypt(JSON.stringify(vaultData), masterKey));
                console.log(GREEN + '\n✅ Guardado com sucesso!' + RESET);
                await input({ message: 'Pressione ENTER para voltar...' });
                break;
            case 'generate':
                const genService = await input({ message: 'Nome do serviço para a nova senha:' });
                const newStrongPass = generateStrongPassword(25); // Yep, senha criptográfica de 25 chars
                vaultData[genService] = newStrongPass;
                saveVault(salt, encrypt(JSON.stringify(vaultData), masterKey));
                clipboardy.default.writeSync(newStrongPass);
                console.log(GREEN + `\n✅ Senha de 25 caracteres gerada e salva: [ ${newStrongPass} ]` + RESET);
                console.log(GREEN + `✅ Ela já foi copiada para sua área de transferência!` + RESET);
                await input({ message: 'Pressione ENTER para voltar...' });
                break;
            case 'delete':
                const delServices = Object.keys(vaultData);
                if (delServices.length === 0)
                    break;
                const delSelection = await select({
                    message: 'Qual serviço deseja apagar?',
                    choices: [...delServices.map(s => ({ name: s, value: s })), { name: '⬅️ Voltar', value: 'back' }]
                });
                if (delSelection !== 'back') {
                    delete vaultData[delSelection];
                    saveVault(salt, encrypt(JSON.stringify(vaultData), masterKey));
                    console.log(GREEN + `\n✅ Serviço apagado do cofre.` + RESET);
                    await input({ message: 'Pressione ENTER para voltar...' });
                }
                break;
            case 'exit':
                vaultData = {};
                masterKey = Buffer.alloc(0);
                salt = Buffer.alloc(0);
                try {
                    clipboardy.default.writeSync('');
                }
                catch (e) { }
                console.clear();
                console.log(BLUE + '🔒 Cofre trancado. Área de transferência e memória limpas. Até logo.' + RESET);
                process.exit(0);
        }
    }
}
// Inicia o programa
mainMenu().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map