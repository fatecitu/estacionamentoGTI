import './style.css';
import { supabase } from './supabase.js';

const botaoLogout = document.getElementById('btn-logout');
const formulario = document.getElementById('form-modelo');
const campoId = document.getElementById('modelo-id');
const campoMarca = document.getElementById('marca');
const campoDescricao = document.getElementById('descricao');
const tabela = document.getElementById('tabela-modelos');
const tituloFormulario = document.getElementById('titulo-formulario');
const mensagemFormulario = document.getElementById('mensagem-formulario');
const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');
const totalModelos = document.getElementById('total-modelos');
const campoBusca = document.getElementById('busca-modelos');

let modelos = [];

botaoLogout.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.assign('./index.html');
});

formulario.addEventListener('submit', salvarModelo);
botaoCancelar.addEventListener('click', limparFormulario);
campoBusca.addEventListener('input', renderizarTabela);

tabela.addEventListener('click', (event) => {
  const botao = event.target.closest('button[data-acao]');
  if (!botao) return;

  const modelo = modelos.find((item) => item.id === botao.dataset.id);
  if (!modelo) return;

  if (botao.dataset.acao === 'editar') {
    preencherFormulario(modelo);
  }

  if (botao.dataset.acao === 'excluir') {
    excluirModelo(modelo);
  }
});

async function validaSessao() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.assign('./index.html');
  }
}

async function carregarModelos() {
  tabela.innerHTML = `
    <tr>
      <td colspan="3" class="px-5 py-8 text-center text-slate-500">Carregando modelos...</td>
    </tr>
  `;

  const { data, error } = await supabase
    .from('modelos')
    .select('*')
    .order('marca', { ascending: true })
    .order('descricao', { ascending: true });

  if (error) {
    mostrarMensagem('Erro ao carregar os modelos: ' + error.message, 'erro');
    tabela.innerHTML = `
      <tr>
        <td colspan="3" class="px-5 py-8 text-center text-red-600">Nao foi possivel carregar os modelos.</td>
      </tr>
    `;
    totalModelos.textContent = 'Falha ao carregar registros';
    return;
  }

  modelos = data || [];
  renderizarTabela();
}

function renderizarTabela() {
  const busca = campoBusca.value.trim().toLowerCase();
  const modelosFiltrados = modelos.filter((modelo) => {
    return `${modelo.marca} ${modelo.descricao}`.toLowerCase().includes(busca);
  });

  totalModelos.textContent = `${modelos.length} registro${modelos.length === 1 ? '' : 's'} cadastrado${modelos.length === 1 ? '' : 's'}`;

  if (modelosFiltrados.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="3" class="px-5 py-10 text-center">
          <div class="mx-auto flex max-w-sm flex-col items-center gap-2 text-slate-500">
            <svg class="h-9 w-9 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <p class="font-semibold text-slate-700">Nenhum modelo encontrado</p>
            <p class="text-sm">Cadastre um novo modelo ou ajuste a busca.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tabela.innerHTML = modelosFiltrados.map((modelo) => `
    <tr class="transition hover:bg-slate-50">
      <td class="px-5 py-4 font-semibold text-slate-900">${escaparHtml(modelo.marca)}</td>
      <td class="px-5 py-4 text-slate-600">${escaparHtml(modelo.descricao)}</td>
      <td class="px-5 py-4">
        <div class="flex justify-end gap-2">
          <button type="button" data-acao="editar" data-id="${modelo.id}" title="Alterar modelo"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <svg class="h-4 w-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span class="sr-only">Alterar</span>
          </button>
          <button type="button" data-acao="excluir" data-id="${modelo.id}" title="Excluir modelo"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
            <svg class="h-4 w-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
            <span class="sr-only">Excluir</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function salvarModelo(event) {
  event.preventDefault();

  const id = campoId.value;
  const marca = campoMarca.value.trim();
  const descricao = campoDescricao.value.trim();

  if (!marca || !descricao) {
    mostrarMensagem('Preencha marca e modelo para continuar.', 'erro');
    return;
  }

  definirSalvando(true);

  const operacao = id
    ? supabase.from('modelos').update({ marca, descricao }).eq('id', id)
    : supabase.from('modelos').insert({ marca, descricao });

  const { error } = await operacao;
  definirSalvando(false);

  if (error) {
    mostrarMensagem('Erro ao salvar o modelo: ' + error.message, 'erro');
    return;
  }

  mostrarMensagem(id ? 'Modelo alterado com sucesso.' : 'Modelo incluido com sucesso.', 'sucesso');
  limparFormulario(false);
  await carregarModelos();
}

function preencherFormulario(modelo) {
  campoId.value = modelo.id;
  campoMarca.value = modelo.marca;
  campoDescricao.value = modelo.descricao;
  tituloFormulario.textContent = 'Alterar modelo';
  botaoCancelar.classList.remove('hidden');
  campoMarca.focus();
}

async function excluirModelo(modelo) {
  const confirmado = confirm(`Deseja excluir o modelo "${modelo.marca} ${modelo.descricao}"?`);
  if (!confirmado) return;

  const { error } = await supabase
    .from('modelos')
    .delete()
    .eq('id', modelo.id);

  if (error) {
    mostrarMensagem('Erro ao excluir o modelo: ' + error.message, 'erro');
    return;
  }

  if (campoId.value === modelo.id) {
    limparFormulario(false);
  }

  mostrarMensagem('Modelo excluido com sucesso.', 'sucesso');
  await carregarModelos();
}

function limparFormulario(limparMensagem = true) {
  formulario.reset();
  campoId.value = '';
  tituloFormulario.textContent = 'Novo modelo';
  botaoCancelar.classList.add('hidden');

  if (limparMensagem) {
    mensagemFormulario.className = 'hidden rounded-md px-3 py-2 text-sm';
    mensagemFormulario.textContent = '';
  }
}

function definirSalvando(salvando) {
  botaoSalvar.disabled = salvando;
  botaoSalvar.classList.toggle('opacity-70', salvando);
  botaoSalvar.classList.toggle('cursor-not-allowed', salvando);
  botaoSalvar.lastChild.textContent = salvando ? 'Salvando...' : 'Salvar';
}

function mostrarMensagem(texto, tipo) {
  const classes = tipo === 'erro'
    ? 'rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'
    : 'rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700';

  mensagemFormulario.className = classes;
  mensagemFormulario.textContent = texto;
}

function escaparHtml(valor) {
  const div = document.createElement('div');
  div.textContent = valor ?? '';
  return div.innerHTML;
}

await validaSessao();
await carregarModelos();
