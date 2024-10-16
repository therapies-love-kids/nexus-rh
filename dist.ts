import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Carregue as variáveis de ambiente
dotenv.config();

// Acesse a variável de ambiente
const token = process.env.GH_TOKEN;

// Execute o comando com execSync
execSync(`cross-env GH_TOKEN=${token} electron-builder --win --publish always`, { stdio: 'inherit' });
