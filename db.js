import pkg from 'pg';


const { Pool } = pkg;


// const BD = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'empresa_cavalos',
//     password: 'admin',
//     port: 5432
// });

const BD = new Pool({
    user: 'postgres.kdcjgumytrmricqjmqwm',                   // CORRETO
    host: 'aws-1-sa-east-1.pooler.supabase.com',
    database: 'postgres',
    password: 'm9N7JAQR3w4KVUnw',      // sua senha
    port: 6543,
    ssl: { rejectUnauthorized: false }
});


// postgres://postgres.kdcjgumytrmricqjmqwm:m9N7JAQR3w4KVUnw@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
export default BD;
