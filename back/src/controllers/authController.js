import supabase from '../config/supabase.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        message: 'Usuário já cadastrado',
        field: 'email'
      });
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserir usuário
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role: 'student'
      });

    if (error) {
      return res.status(500).json({
        message: 'Erro no cadastro',
        details: error.message
      });
    }

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      user: { email, name }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erro interno do servidor',
      details: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      return res.status(401).json({
        message: 'Credenciais inválidas',
        field: 'email'
      });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Credenciais inválidas',
        field: 'password'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env['JWT_SECRET'],
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erro interno do servidor',
      details: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Buscar perfil completo do usuário
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({
        message: 'Perfil não encontrado',
        details: error.message
      });
    }

    res.json({ user: profile });
  } catch (error) {
    res.status(500).json({
      message: 'Erro interno do servidor',
      details: error.message
    });
  }
};