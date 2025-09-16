import { exec } from 'child_process';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const {
  DISCORD_WEBHOOK_URL,
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH,
  PR_BASE_BRANCH
} = process.env;

// Enviar mensagem para Discord
async function sendDiscordNotification(message) {
  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  });
}

// Executar comando Git
function execGit(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(stderr);
      else resolve(stdout);
    });
  });
}

// Criar Pull Request via GitHub API
async function createPR(branchName, title) {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({
      title,
      head: branchName,
      base: PR_BASE_BRANCH,
      body: 'Pull request criado automaticamente pelo bot.'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar PR: ${errorText}`);
  }

  return response.json();
}

// Bot principal
async function runBot() {
  try {
    console.log('Adicionando alterações...');
    await execGit('git add .');

    console.log('Commitando alterações...');
    await execGit('git commit -m "Automated commit via bot"');

    console.log('Tentando push...');
    await execGit(`git push origin ${GITHUB_BRANCH}`);

    console.log('Criando Pull Request...');
    const pr = await createPR(GITHUB_BRANCH, 'Automated PR via bot');

    await sendDiscordNotification(`✅ Push e PR criados com sucesso! PR: ${pr.html_url}`);
    console.log('Operação concluída com sucesso.');

  } catch (err) {
    console.error('❌ Falha detectada, executando rollback...', err);

    // Rollback automático do commit local
    try {
      await execGit('git reset --soft HEAD~1');
      console.log('Rollback realizado com sucesso.');
      await sendDiscordNotification('❌ Push/PR falhou! Commit revertido automaticamente.');
    } catch (rollbackErr) {
      console.error('❌ Falha ao tentar rollback:', rollbackErr);
      await sendDiscordNotification('❌ Falha no push/PR e rollback automático falhou!');
    }
  }
}

runBot();
