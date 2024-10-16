require('dotenv').config();
import { execSync } from 'child_process';

const token = process.env.GH_TOKEN;
execSync(`cross-env GH_TOKEN=${token} electron-builder --win --publish always`, { stdio: 'inherit' });
