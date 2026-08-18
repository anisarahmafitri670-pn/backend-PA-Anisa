const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PETA RANKO API',
      version: '1.0.0',
      description:
        'Dokumentasi API Register, Login, dan Pengajuan Form Layanan pada Sistem Pelayanan Terpadu PETA RANKO Kantor Camat Rantau Kopar.'
    },
    servers: [
      {
        url: 'https://anisa-rahma-fitri.alwaysdata.net',
        description: 'Server produksi AlwaysData'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Register dan login pengguna'
      },
      {
        name: 'Pengajuan Layanan',
        description: 'Pengajuan form untuk delapan jenis layanan'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [path.resolve(__dirname, '../docs/swagger.js').replace(/\\/g, '/')]
});

module.exports = swaggerSpec;
