import swaggerAutogen from "swagger-autogen";

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'VMS Backend Apis',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:4000/api/v1', // Specify your base URL here
          description: 'Local development server', // Optional description
        },
      ],
    },
    apis: ['./src/routes/index.js'], 
  };

const outputFile = './swagger.json';

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile,options.apis,options);