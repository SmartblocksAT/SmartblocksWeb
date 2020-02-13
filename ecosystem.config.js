module.exports = {
    apps: [{
        name: 'Smartblocks-API',
        script: 'bin/www',

        // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
        args: '',
        instances: 3,
        autorestart: true,
        watch: true,
        max_memory_restart: '1G',
        env_dev: {
            NODE_ENV: 'development',
            PORT: 8082,
            DEBUG: 'express:*'

        },
        env: {
            NODE_ENV: 'production',
            PORT: 8082,
            DEBUG: ''
        }
    }]
};
