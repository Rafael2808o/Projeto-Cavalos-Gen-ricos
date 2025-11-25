// importa o pacote 'pg' (PostgreSQL) para conectar o Node.js
import pkg from 'pg';

// extrai o objeto 'Pool' do pacote, usado para gerenciar conexões
const { Pool } = pkg;

// cria uma nova conexão com o banco de dados PostgreSQL
const BD = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'empresa_cavalos',
    password: 'admin',
    port: 5432
});

// exporta a conexão para ser usada em outros arquivos
export default BD;
