import './style.css';
import { supabase } from './supabase.js';

const cadastroForm = document.getElementById('cadastro-form');
const messageDiv = document.getElementById('message');
const btnCadastrar = document.getElementById('cadastrar');

cadastroForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmarPassword = document.getElementById('confirmar-password').value;

  if (password !== confirmarPassword) {
    mostrarMensagem('As senhas informadas nao conferem.', 'erro');
    return;
  }

  definirCarregando(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  definirCarregando(false);

  if (error) {
    mostrarMensagem(`Erro: ${error.message}`, 'erro');
    return;
  }

  cadastroForm.reset();

  if (data.session) {
    mostrarMensagem('Usuario cadastrado com sucesso. Redirecionando...', 'sucesso');
    window.location.assign('./menu.html');
    return;
  }

  mostrarMensagem('Usuario cadastrado com sucesso. Verifique seu e-mail para confirmar a conta.', 'sucesso');
});

function definirCarregando(carregando) {
  btnCadastrar.disabled = carregando;
  btnCadastrar.textContent = carregando ? 'Cadastrando...' : 'Cadastrar usuario';
}

function mostrarMensagem(texto, tipo) {
  const classes = tipo === 'erro'
    ? 'mt-4 text-center text-sm text-red-500 bg-red-100 p-4 rounded-xl'
    : 'mt-4 text-center text-sm text-emerald-700 bg-emerald-100 p-4 rounded-xl';

  messageDiv.className = classes;
  messageDiv.innerText = texto;
}
