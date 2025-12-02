import pkg from 'pg';


const { Pool } = pkg;


const BD = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'empresa_cavalos',
    password: 'admin',
    port: 5432
});

// const BD = new Pool({
//     user: 'postgres',                   // CORRETO
//     host: 'aws-1-sa-east-1.pooler.supabase.com',
//     database: 'postgres',
//     password: '4nnBeSi1k0iJJSeB',      // sua senha
//     port: 6543,
//     ssl: { rejectUnauthorized: false }
// });

export default BD;
