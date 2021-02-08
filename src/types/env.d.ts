declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    RMQ_URL: string;
    RMQ_SERVICE_QUEUE_NAME: string;
    RMQ_SERVICE_PREFETCH: string;

    POSTGRES_DB_NAME: string;
    POSTGRES_DB_USERNAME: string;
    POSTGRES_DB_PASSWORD: string;
    POSTGRES_DB_HOST: string;
    POSTGRES_DB_PORT: string;
    POSTGRES_DB_SSL: string;

    TYPEORM_ENTITIES: string;
    TYPEORM_MIGRATIONS: string;
    TYPEORM_MIGRATIONS_DIR: string;
    TYPEORM_MIGRATIONS_RUN: string;
    TYPEORM_SYNCHRONIZE: string;
    TYPEORM_CONNECTION: string;
    TYPEORM_USERNAME: string;
    TYPEORM_PASSWORD: string;
    TYPEORM_HOST: string;
    TYPEORM_PORT: string;
    TYPEORM_DATABASE: string;

    JWT_SECRET: string;
    JWT_EXPIRES: string;
    REFRESH_EXPIRES: string;
  }
}
