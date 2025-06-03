// config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Farmers Marketplace Backend API',
            version: '1.0.0',
            description: 'API documentation for your application',
        },
        servers: [
            {
                url: 'http://localhost:8000',
            },
        ],
    },
    apis: ['./routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
