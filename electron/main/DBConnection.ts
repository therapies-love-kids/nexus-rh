import { ipcMain } from 'electron';
import { Pool } from 'pg';

const pool = new Pool({
    host: '192.168.1.13',
    port: 5432,
    database: 'recepcao',
    user: 'master',
    password: 'tlk@951753',
});

export const queryDatabase = async (sql: string, params: unknown[] = []): Promise<unknown> => {
    const client = await pool.connect();
    
    try {
        const res = await client.query(sql, params);
        const updatedRows = res.rows.map((row: any) => row);
        return updatedRows;
    } catch (err: any) {
        throw new Error(`Query failed: ${err.message}`);
    } finally {
        client.release();
    }
};

export const deleteRecords = async (ids: number[]): Promise<void> => {
    const client = await pool.connect();
    
    try {
        const query = 'DELETE FROM profissional WHERE id = ANY($1::int[])';
        await client.query(query, [ids]);
    } catch (err: any) {
        throw new Error(`Delete failed: ${err.message}`);
    } finally {
        client.release();
    }
};

export const insertRecord = async (table: string, columns: string[], values: (string | Buffer | null)[]): Promise<void> => {
    const client = await pool.connect();
    
    // Cria a string de colunas e valores para a consulta SQL
    const columnsString = columns.join(', ');
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${columnsString}) VALUES (${placeholders})`;
    
    try {
        await client.query(query, values);
    } catch (err: any) {
        console.error('Erro ao inserir o registro:', err);
        throw err;
    } finally {
        client.release();
    }
};

// Configura os handlers IPC
export const setupDatabaseIpcHandlers = () => {
    ipcMain.handle('query-database-postgres', async (event, sql, params) => {
        return await queryDatabase(sql, params);
    });

    ipcMain.handle('delete-records-postgres', async (event, ids: number[]) => {
        await deleteRecords(ids);
    });

    ipcMain.handle('insert-into-database', async (event, { table, columns, values }) => {
        try {
            await insertRecord(table, columns, values);
            return { success: true };
        } catch (error) {
            console.error('Erro ao inserir no banco de dados:', error);
        }
    });
};