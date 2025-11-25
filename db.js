import pkg from 'pg';


const { Pool } = pkg;


const BD = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'empresa_cavalos',
    password: 'admin',
    port: 5432
});


export default BD;
