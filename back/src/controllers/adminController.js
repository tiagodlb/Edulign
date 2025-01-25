import supabase from '../config/supabase.js';
import bcrypt from 'bcrypt';

// Listar todos os usuários
export const listUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at');

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro ao listar usuários.', 
      details: error.message 
    });
  }
};

// Criar administrador
export const createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar se o email já está registrado
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

    // Inserir novo administrador
    const { error } = await supabase
      .from('users')
      .insert({ 
        email, 
        password: hashedPassword, 
        name,
        role: 'admin' // Define explicitamente que é um administrador
      });

    if (error) {
      return res.status(500).json({ 
        message: 'Erro ao criar administrador',
        details: error.message 
      });
    }

    res.status(201).json({ 
      message: 'Administrador criado com sucesso',
      user: { email, name, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Deletar usuário
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Excluir o usuário com base no ID
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro ao excluir usuário.', 
      details: error.message 
    });
  }
};

// Atualizar informações do usuário
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, password, role } = req.body;

  try {
    // Hash da senha (se fornecida)
    let hashedPassword = null;
    if (password) {
      const saltRounds = 12;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Atualizar os dados no banco
    const { error } = await supabase
      .from('users')
      .update({
        email,
        name,
        password: hashedPassword || undefined, // Atualiza a senha apenas se fornecida
        role
      })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro ao atualizar usuário.', 
      details: error.message 
    });
  }
};

// Gerenciar questões (Exemplo de criação de questão)
export const createQuestion = async (req, res) => {
  const { question, options, correctAnswer } = req.body;

  try {
    const { error } = await supabase
      .from('questions')
      .insert([{ question, options, correct_answer: correctAnswer }]);

    if (error) throw error;

    res.status(201).json({ message: 'Questão criada com sucesso.' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erro ao criar questão.', 
      details: error.message 
    });
  }
};
