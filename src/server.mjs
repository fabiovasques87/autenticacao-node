
import express from "express";
import path from "path";
import dotenv from 'dotenv';

const port = 3000;

dotenv.config();

import bcrypt from 'bcrypt';

const server = express();

import jwt from 'jsonwebtoken'; // Importe a biblioteca 'jsonwebtoken'


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

server.use(express.json());

const secretKey = '<F@bio102030>'; // Substitua pela sua chave secreta

// Função para verificar a senha
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

server.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Busque o usuário no banco de dados usando o Prisma
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Verifique a senha
    const passwordMatch = await verifyPassword(password, user.password);

    if (passwordMatch) {
      // A senha está correta, crie um token de autenticação
      const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

      return res.status(200).json({ message: 'Autenticado com sucesso', token });
    } else {
      return res.status(401).json({ message: 'Senha incorreta' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro de servidor' });
  }
});

server.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});