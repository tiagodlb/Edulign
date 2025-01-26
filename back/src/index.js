import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
//import adminRoutes from './routes/adminRoutes.js'

import setupSwagger from './config/swagger.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Configuração do Swagger
setupSwagger(app);

// Rotas
app.use('/eduling/auth', authRoutes);
//app.use('/eduling/admin', adminRoutes); 

const PORT = process.env['PORT'] || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Documentação disponível em http://localhost:${PORT}/api-docs`);
});