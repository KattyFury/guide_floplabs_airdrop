// Owner-only: push Agent Kibble to the VPS and restart container flop-agent.
// Reads VPS_* and keys from D:\Files\Claude\.secrets\keys.env on the owner's PC (never in git).
//   node deploy/deploy.mjs                → push code + restart
//   node deploy/deploy.mjs --env          → + write agent/.env on the VPS (OPEN_AI_API, FLOP_BOT, DID label, VPS limits)
//   node deploy/deploy.mjs --secrets      → + copy DID keys from D:\Files\Claude\.secrets\flop-did\ to the VPS
//   node deploy/deploy.mjs --flop-wallet  → + copy the agent's FLOP devnet wallet (flop-devnet-wallet.json) into flop-home/
//   node deploy/deploy.mjs --state        → + copy agent/data/ memory from this machine to the VPS (only when migrating)
//   node deploy/deploy.mjs --logs         → only view 50 log lines, no deploy
//   node deploy/deploy.mjs --exec "cmd"   → run one command on the VPS
// Never print secret values. Before deploying: check logs and wait for the current job.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Client } from 'ssh2';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = 'D:/Files/Claude/.secrets';
const DIR = '/opt/flop-agent';
const keys = Object.fromEntries(fs.readFileSync(`${A}/keys.env`, 'utf8').split(/\r?\n/)
  .map((l) => l.match(/^([A-Z_0-9]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim().replace(/^['"]|['"]$/g, '')]));
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);

const c = new Client();
const run = (cmd, stdin) => new Promise((resolve, reject) => c.exec(cmd, (err, s) => {
  if (err) return reject(err);
  s.on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
  s.on('close', (code) => (code ? reject(new Error(`exit ${code}: ${cmd.slice(0, 60)}`)) : resolve()));
  if (stdin != null) s.end(stdin);
}));
const tar = (cwd, ...items) => execFileSync('tar', ['czf', '-', ...items], { cwd, maxBuffer: 1 << 28 });

c.on('ready', async () => {
  try {
    if (has('--exec')) { await run(argv[argv.indexOf('--exec') + 1]); return; }
    if (has('--logs')) { await run('docker logs --tail 50 flop-agent 2>&1'); return; }

    await run(`mkdir -p ${DIR}/agent ${DIR}/data ${DIR}/secrets ${DIR}/flop-home && chmod 700 ${DIR}/secrets ${DIR}/flop-home`);
    // Code only: no secrets, .env, memory, logs, wallet, .git, node_modules, docs for humans
    await run(`tar xzf - -C ${DIR}`, tar(ROOT, '--exclude=.git', '--exclude=secrets', '--exclude=flop-home', '--exclude=agent/.env',
      '--exclude=agent/data', '--exclude=agent/logs', '--exclude=node_modules', '--exclude=data',
      '--exclude=docs', '--exclude=guide', '--exclude=thuc-hanh', '--exclude=ops', '.'));
    console.log('✓ code');

    if (has('--env')) {
      for (const k of ['OPEN_AI_API', 'FLOP_BOT']) if (!keys[k]) throw new Error(`thiếu ${k} trong keys.env`);
      // LIMIT_*: the owner's VPS limits (override config.json defaults meant for guide users)
      await run(`cat > ${DIR}/agent/.env && chmod 600 ${DIR}/agent/.env`,
        `OPENAI_API_KEY=${keys.OPEN_AI_API}\nTELEGRAM_BOT_TOKEN=${keys.FLOP_BOT}\nDID_LABEL=hieu\nLIMIT_DAILY_TOKENS=500000\nLIMIT_MAX_STEPS_PER_JOB=10\n`);
      console.log('✓ .env');
    }
    if (has('--secrets')) {
      for (const f of fs.readdirSync(`${A}/flop-did`))
        await run(`cat > ${DIR}/secrets/${f} && chmod 600 ${DIR}/secrets/${f}`, fs.readFileSync(`${A}/flop-did/${f}`));
      await run(`chown -R root:root ${DIR}/secrets && chmod 700 ${DIR}/secrets`);
      console.log('✓ khoá DID');
    }
    if (has('--flop-wallet')) {
      // The Flop CLI reads its wallet from devnet-enroll-wallet.json {type, address, mnemonic}
      const w = JSON.parse(fs.readFileSync(`${A}/flop-devnet-wallet.json`, 'utf8'));
      await run(`cat > ${DIR}/flop-home/devnet-enroll-wallet.json && chmod 600 ${DIR}/flop-home/devnet-enroll-wallet.json && chown -R root:root ${DIR}/flop-home && chmod 700 ${DIR}/flop-home`,
        JSON.stringify({ type: w.type || 'sr25519', address: w.address, mnemonic: w.mnemonic }));
      console.log(`✓ ví FLOP agent ${w.address.slice(0, 6)}…${w.address.slice(-4)}`);
    }
    if (has('--state')) {
      await run(`tar xzf - -C ${DIR}`, tar(ROOT, 'agent/data'));
      console.log('✓ bộ nhớ agent');
    }
    await run(`cd ${DIR} && docker compose pull -q 2>&1 | tail -2; docker compose up -d --force-recreate 2>&1 | tail -2 && sleep 8 && docker logs --tail 8 flop-agent 2>&1`);
  } catch (e) { console.error('✗', e.message); process.exitCode = 1; } finally { c.end(); }
}).on('error', (e) => { console.error('SSH:', e.message); process.exit(1); })
  .connect({ host: keys.VPS_HOST, port: Number(keys.VPS_PORT) || 22, username: keys.VPS_USER, password: keys.VPS_PASSWORD, readyTimeout: 20000 });
