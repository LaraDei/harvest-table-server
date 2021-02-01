module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: ['https://harvest-table.vercel.app',
    'https://harvest-table.vercel.app/search',
    'https://harvest-table.vercel.app/demo',
    'https://harvest-table.vercel.app/user',
    'https://harvest-table.vercel.app/login',
    'https://harvest-table.vercel.app/register',
    'https://harvest-table.vercel.app/create-listing'] ,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://bluth@localhost/harvesttable',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://bluth@localhost/harvesttable_test',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '1h'
}
/*
['https://harvest-table.vercel.app',
'https://harvest-table.vercel.app/search',
'https://harvest-table.vercel.app/demo',
'https://harvest-table.vercel.app/user',
'https://harvest-table.vercel.app/login',
'https://harvest-table.vercel.app/register',
'https://harvest-table.vercel.app/create-listing']
*/
/*[ 'http://localhost:3000',
                     'http://localhost:3000/search', 
                     'http://localhost:3000/demo', 
                     'http://localhost:3000/create-listing', 
                     'http://localhost:3000/register', 
                     'http://localhost:3000/login',],*/