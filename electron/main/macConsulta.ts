import { ipcMain } from 'electron';
import os from 'os';

export function setupMacAddressIpcHandler() {
    ipcMain.handle('get-mac-address', async () => {
        const interfaces = os.networkInterfaces();

        for (const interfaceName in interfaces) {
            const networkInterface = interfaces[interfaceName];

            // Verifica se a interface é um array e contém dados
            if (Array.isArray(networkInterface)) {
                for (const network of networkInterface) {
                    if (network && network.mac && network.mac !== '00:00:00:00:00:00') {
                        return network.mac;
                    }
                }
            }
        }
        return null;
    });
}