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
        return res.rows;
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`Query failed: ${err.message}`);
        } else {
            throw new Error('Erro desconhecido na consulta ao banco de dados');
        }
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
    } catch (err) {
        if (err instanceof Error) {
            console.error('Erro ao inserir o registro:', err.message);
        } else {
            console.error('Erro desconhecido ao inserir o registro');
        }
        throw err;
    } finally {
        client.release();
    }
};

export const deleteRecords = async (table: string, ids: number[]): Promise<void> => {
    const client = await pool.connect();
    
    // Monta a query para deletar múltiplos registros
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const query = `DELETE FROM ${table} WHERE profissional_id IN (${placeholders})`;

    try {
        await client.query(query, ids);
    } catch (err) {
        if (err instanceof Error) {
            console.error('Erro ao excluir registros:', err.message);
            throw err;
        } else {
            console.error('Erro desconhecido ao excluir registros');
            throw new Error('Erro desconhecido ao excluir registros');
        }
    } finally {
        client.release();
    }
};

export const setupDatabaseIpcHandlers = () => {
    ipcMain.handle('query-database-postgres', async (event, sql, params) => {
        return await queryDatabase(sql, params);
    });

    ipcMain.handle('insert-into-database', async (event, { table, columns, values }) => {
        try {
            await insertRecord(table, columns, values);
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                console.error('Erro ao inserir no banco de dados:', error.message);
                return { success: false, message: error.message };
            } else {
                console.error('Erro desconhecido ao inserir no banco de dados');
                return { success: false, message: 'Erro desconhecido' };
            }
        }
    });

    // Handler para deletar registros
    ipcMain.handle('delete-records-postgres', async (event, ids: number[]) => {
        try {
            await deleteRecords('profissionais', ids);
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, message: error.message };
            } else {
                return { success: false, message: 'Erro desconhecido' };
            }
        }
    });
};
