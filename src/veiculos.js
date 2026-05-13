import './style.css';
import { supabase } from './supabase.js';

const botaoLogout = document.getElementById('btn-logout');
const formulario = document.getElementById('form-veiculo');
const campoId = document.getElementById('veiculo-id');
const campoPlaca = document.getElementById('placa');
const campoModeloId = document.getElementById('modelo-id');
const campoAno = document.getElementById('ano');
const campoObservacao = document.getElementById('observacao');
const campoDataSaida = document.getElementById('data-saida');
const tabela = document.getElementById('tabela-veiculos');
const tituloFormulario = document.getElementById('titulo-formulario');
const mensagemFormulario = document.getElementById('mensagem-formulario');
const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');
const totalVeiculos = document.getElementById('total-veiculos');
const campoBusca = document.getElementById('busca-veiculos');

let veiculos = [];
let modelos = [];

botaoLogout.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.assign('./index.html');
});

formulario.addEventListener('submit', salvarVeiculo);
botaoCancelar.addEventListener('click', limparFormulario);
campoBusca.addEventListener('input', renderizarTabela);
campoPlaca.addEventListener('input', () => {
  campoPlaca.value = campoPlaca.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
});

tabela.addEventListener('click', (event) => {
  const botao = event.target.closest('button[data-acao]');
  if (!botao) return;

  const veiculo = veiculos.find((item) => item.id === botao.dataset.id);
  if (!veiculo) return;

  if (botao.dataset.acao === 'editar') {
    preencherFormulario(veiculo);
  }

  if (botao.dataset.acao === 'excluir') {
    excluirVeiculo(veiculo);
  }
});

async function validaSessao() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.assign('./index.html');
  }
}

async function carregarModelos() {
  const { data, error } = await supabase
    .from('modelos')
    .select('id, marca, descricao')
    .order('marca', { ascending: true })
    .order('descricao', { ascending: true });

  if (error) {
    mostrarMensagem('Erro ao carregar os modelos: ' + error.message, 'erro');
    campoModeloId.innerHTML = '<option value="">Nao foi possivel carregar</option>';
    return;
  }

  modelos = data || [];

  if (modelos.length === 0) {
    campoModeloId.innerHTML = '<option value="">Cadastre um modelo primeiro</option>';
    botaoSalvar.disabled = true;
    return;
  }

  campoModeloId.innerHTML = `
    <option value="">Selecione um modelo</option>
    ${modelos.map((modelo) => `
      <option value="${modelo.id}">${escaparHtml(formatarModelo(modelo))}</option>
    `).join('')}
  `;
}

async function carregarVeiculos() {
  tabela.innerHTML = `
    <tr>
      <td colspan="5" class="px-5 py-8 text-center text-slate-500">Carregando veiculos...</td>
    </tr>
  `;

  const { data, error } = await supabase
    .from('veiculos')
    .select('*, modelos(id, marca, descricao)')
    .order('criado_em', { ascending: false });

  if (error) {
    mostrarMensagem('Erro ao carregar os veiculos: ' + error.message, 'erro');
    tabela.innerHTML = `
      <tr>
        <td colspan="5" class="px-5 py-8 text-center text-red-600">Nao foi possivel carregar os veiculos.</td>
      </tr>
    `;
    totalVeiculos.textContent = 'Falha ao carregar registros';
    return;
  }

  veiculos = data || [];
  renderizarTabela();
}

function renderizarTabela() {
  const busca = campoBusca.value.trim().toLowerCase();
  const veiculosFiltrados = veiculos.filter((veiculo) => {
    return [
      veiculo.placa,
      veiculo.ano,
      veiculo.observacao,
      formatarModelo(veiculo.modelos),
      formatarData(veiculo.data_saida),
    ].join(' ').toLowerCase().includes(busca);
  });

  totalVeiculos.textContent = `${veiculos.length} registro${veiculos.length === 1 ? '' : 's'} cadastrado${veiculos.length === 1 ? '' : 's'}`;

  if (veiculosFiltrados.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="5" class="px-5 py-10 text-center">
          <div class="mx-auto flex max-w-sm flex-col items-center gap-2 text-slate-500">
            <svg class="h-9 w-9 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8l-2 4-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            <p class="font-semibold text-slate-700">Nenhum veiculo encontrado</p>
            <p class="text-sm">Cadastre um novo veiculo ou ajuste a busca.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tabela.innerHTML = veiculosFiltrados.map((veiculo) => `
    <tr class="transition hover:bg-slate-50">
      <td class="px-5 py-4 font-semibold text-slate-900">${escaparHtml(veiculo.placa)}</td>
      <td class="px-5 py-4 text-slate-600">${escaparHtml(formatarModelo(veiculo.modelos))}</td>
      <td class="px-5 py-4 text-slate-600">${escaparHtml(veiculo.ano || '-')}</td>
      <td class="px-5 py-4 text-slate-600">${escaparHtml(formatarData(veiculo.data_saida))}</td>
      <td class="px-5 py-4">
        <div class="flex justify-end gap-2">
          <button type="button" data-acao="editar" data-id="${veiculo.id}" title="Alterar veiculo"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <svg class="h-4 w-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span class="sr-only">Alterar</span>
          </button>
          <button type="button" data-acao="excluir" data-id="${veiculo.id}" title="Excluir veiculo"
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

async function salvarVeiculo(event) {
  event.preventDefault();

  const id = campoId.value;
  const placa = campoPlaca.value.trim().toUpperCase();
  const modelo_id = campoModeloId.value;
  const ano = campoAno.value ? Number(campoAno.value) : null;
  const observacao = campoObservacao.value.trim() || null;
  const data_saida = campoDataSaida.value ? new Date(campoDataSaida.value).toISOString() : null;

  if (placa.length !== 7 || !modelo_id) {
    mostrarMensagem('Preencha placa com 7 caracteres e selecione o modelo.', 'erro');
    return;
  }

  if (ano && (ano < 1900 || ano > 2100)) {
    mostrarMensagem('Informe um ano entre 1900 e 2100.', 'erro');
    return;
  }

  definirSalvando(true);

  const dadosVeiculo = { placa, modelo_id, ano, observacao, data_saida };
  const operacao = id
    ? supabase.from('veiculos').update(dadosVeiculo).eq('id', id)
    : supabase.from('veiculos').insert(dadosVeiculo);

  const { error } = await operacao;
  definirSalvando(false);

  if (error) {
    mostrarMensagem('Erro ao salvar o veiculo: ' + error.message, 'erro');
    return;
  }

  mostrarMensagem(id ? 'Veiculo alterado com sucesso.' : 'Veiculo incluido com sucesso.', 'sucesso');
  limparFormulario(false);
  await carregarVeiculos();
}

function preencherFormulario(veiculo) {
  campoId.value = veiculo.id;
  campoPlaca.value = veiculo.placa;
  campoModeloId.value = veiculo.modelo_id || '';
  campoAno.value = veiculo.ano || '';
  campoObservacao.value = veiculo.observacao || '';
  campoDataSaida.value = converterParaCampoData(veiculo.data_saida);
  tituloFormulario.textContent = 'Alterar veiculo';
  botaoCancelar.classList.remove('hidden');
  campoPlaca.focus();
}

async function excluirVeiculo(veiculo) {
  const confirmado = confirm(`Deseja excluir o veiculo "${veiculo.placa}"?`);
  if (!confirmado) return;

  const { error } = await supabase
    .from('veiculos')
    .delete()
    .eq('id', veiculo.id);

  if (error) {
    mostrarMensagem('Erro ao excluir o veiculo: ' + error.message, 'erro');
    return;
  }

  if (campoId.value === veiculo.id) {
    limparFormulario(false);
  }

  mostrarMensagem('Veiculo excluido com sucesso.', 'sucesso');
  await carregarVeiculos();
}

function limparFormulario(limparMensagem = true) {
  formulario.reset();
  campoId.value = '';
  tituloFormulario.textContent = 'Novo veiculo';
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

function formatarModelo(modelo) {
  if (!modelo) return '-';
  return `${modelo.marca} ${modelo.descricao}`;
}

function formatarData(valor) {
  if (!valor) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(valor));
}

function converterParaCampoData(valor) {
  if (!valor) return '';

  const data = new Date(valor);
  const deslocamento = data.getTimezoneOffset() * 60000;
  return new Date(data.getTime() - deslocamento).toISOString().slice(0, 16);
}

function escaparHtml(valor) {
  const div = document.createElement('div');
  div.textContent = valor ?? '';
  return div.innerHTML;
}

await validaSessao();
await carregarModelos();
await carregarVeiculos();
