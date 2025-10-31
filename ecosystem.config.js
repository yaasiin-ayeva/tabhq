module.exports = {
    apps: [
        // Backend Application
        {
            name: 'tabhq-backend',
            script: './backend/src/server.ts',
            cwd: './backend',
            interpreter: 'node',
            interpreter_args: '--require ts-node/register',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            env: {
                NODE_ENV: 'development',
                PORT: 4000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 4000,
            },
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
        },

        // Backend Development Mode (with auto-reload)
        {
            name: 'tabhq-backend-dev',
            script: './backend/node_modules/.bin/ts-node-dev',
            args: '--respawn --transpile-only ./backend/src/server.ts',
            cwd: './backend',
            instances: 1,
            exec_mode: 'fork',
            watch: false, // ts-node-dev handles watching
            autorestart: true,
            env: {
                NODE_ENV: 'development',
                PORT: 4000,
            },
            error_file: './logs/backend-dev-error.log',
            out_file: './logs/backend-dev-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
        },

        // Backend Production Mode (built version)
        {
            name: 'tabhq-backend-prod',
            script: './backend/dist/server.js',
            cwd: './backend',
            instances: 'max', // Use all CPU cores
            exec_mode: 'cluster',
            watch: false,
            env_production: {
                NODE_ENV: 'production',
                PORT: 4000,
            },
            error_file: './logs/backend-prod-error.log',
            out_file: './logs/backend-prod-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
            max_memory_restart: '1G',
            autorestart: true,
            restart_delay: 4000,
        },

        // Frontend Development Mode (Vite dev server)
        {
            name: 'tabhq-frontend-dev',
            script: './frontend/node_modules/.bin/vite',
            cwd: './frontend',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            autorestart: true,
            env: {
                NODE_ENV: 'development',
            },
            error_file: './logs/frontend-dev-error.log',
            out_file: './logs/frontend-dev-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
        },

        // Frontend Production Mode (serve built files with a static server)
        {
            name: 'tabhq-frontend-prod',
            script: 'npx',
            args: 'serve -s dist -l 3000',
            cwd: './frontend',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            env_production: {
                NODE_ENV: 'production',
            },
            error_file: './logs/frontend-prod-error.log',
            out_file: './logs/frontend-prod-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
        },
    ],
};