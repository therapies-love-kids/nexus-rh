import { ipcMain } from 'electron';
import { Pool } from 'pg';
import { Buffer } from 'buffer'; 

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
    if (!table || columns.length === 0 || values.length === 0) {
        throw new Error('Tabela, colunas ou valores não podem ser indefinidos ou vazios.');
    }

    const client = await pool.connect();
    const columnsString = columns.join(', ');
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO ${table} (${columnsString}) VALUES (${placeholders})`;
    console.log('Query:', query, 'Values:', values);
    
    try {
        await client.query(query, values);
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`Erro ao inserir o registro: ${err.message}`);
        } else {
            throw new Error('Erro desconhecido ao inserir o registro');
        }
    } finally {
        client.release();
    }
};

export const deleteRecords = async (table: string, ids: number[], idColumn: string): Promise<void> => {
    if (!table || !idColumn || ids.length === 0) {
        throw new Error('Tabela, coluna de ID ou IDs não podem ser indefinidos ou vazios.');
    }

    const client = await pool.connect();
    
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const query = `DELETE FROM ${table} WHERE ${idColumn} IN (${placeholders})`;

    try {
        await client.query(query, ids);
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`Erro ao excluir registros: ${err.message}`);
        } else {
            throw new Error('Erro desconhecido ao excluir registros');
        }
    } finally {
        client.release();
    }
};

export const updateRecords = async (table: string, updates: Record<string, unknown>, ids: number[], idColumn: string): Promise<void> => {
    const client = await pool.connect();

    if (!table || !updates || !ids || ids.length === 0 || !idColumn) {
        throw new Error('Parâmetros inválidos para atualização.');
    }

    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = [...Object.values(updates), ...ids];

    const idPlaceholders = ids.map((_, i) => `$${Object.keys(updates).length + 1 + i}`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE ${idColumn} IN (${idPlaceholders})`;

    try {
        await client.query(query, values);
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`Erro ao atualizar registros: ${err.message}`);
        } else {
            throw new Error('Erro desconhecido ao atualizar registros');
        }
    } finally {
        client.release();
    }
};

export const moveRecords = async (sourceTable: string, destinationTable: string, ids: number[], idColumn: string): Promise<void> => {
    const client = await pool.connect();
    
    try {
        // Begin transaction
        await client.query('BEGIN');
        
        // Get columns from source table
        const columnsQuery = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [sourceTable]);
        const columns = columnsQuery.rows.map(row => row.column_name);
        if (columns.length === 0) {
            throw new Error(`No columns found for table ${sourceTable}`);
        }
        const columnsString = columns.join(', ');

        // Ensure IDs are correctly formatted as integers
        const idValues = ids.map(id => parseInt(id.toString(), 10));

        // Generate placeholders for the IDs
        const idPlaceholders = idValues.map((_, i) => `$${i + 1}`).join(', ');

        // Insert records into destination table
        const insertQuery = `INSERT INTO ${destinationTable} (${columnsString}) SELECT ${columnsString} FROM ${sourceTable} WHERE ${idColumn} IN (${idPlaceholders})`;
        await client.query(insertQuery, idValues);

        // Delete records from source table
        const deleteQuery = `DELETE FROM ${sourceTable} WHERE ${idColumn} IN (${idPlaceholders})`;
        await client.query(deleteQuery, idValues);

        // Commit transaction
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        if (err instanceof Error) {
            throw new Error(`Erro ao mover registros: ${err.message}`);
        } else {
            throw new Error('Erro desconhecido ao mover registros');
        }
    } finally {
        client.release();
    }
};


export const setupDatabaseIpcHandlers = () => {
    
    ipcMain.handle('query-database-postgres', async (event, sql, params) => {
        return await queryDatabase(sql, params);
    });

    ipcMain.handle('insert-records-postgres', async (event, { table, columns, values }) => {
        try {
            await insertRecord(table, columns, values);
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, message: error.message };
            } else {
                return { success: false, message: 'Erro desconhecido' };
            }
        }
    });

    ipcMain.handle('delete-records-postgres', async (event, { table, ids, idColumn }: { table: string; ids: number[]; idColumn: string }) => {
        try {
            await deleteRecords(table, ids, idColumn);
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, message: error.message };
            } else {
                return { success: false, message: 'Erro desconhecido' };
            }
        }
    });

    ipcMain.handle('update-records-postgres', async (event, { table, updates, ids, idColumn }) => {
        try {
            await updateRecords(table, updates, ids, idColumn);
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, message: error.message };
            } else {
                return { success: false, message: 'Erro desconhecido' };
            }
        }
    });

    ipcMain.handle('move-records-postgres', async (event, { sourceTable, destinationTable, ids, idColumn }) => {
        try {
            await moveRecords(sourceTable, destinationTable, ids, idColumn);
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
