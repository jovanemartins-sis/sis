/* ========================================================= */
/* VARIÁVEIS DE ESTADO GLOBAL */
/* ========================================================= */
let currentPage = 'pedidos';
let authorizationSuccessMessage = '';

/* ========================================================= */
/* GESTÃO DE DADOS (Simulação de Backend) */
/* ========================================================= */

// Dados Mockados para Simulação (Persistência via localStorage)

function getIntegracoes() {
    // Manter a simulação para os filtros e display da tabela de integração,
    // mas a busca de pedidos é real via API.
    const defaultIntegracoes = [
        { id: '62305', descricao: 'Mercado Livre - Principal', marketplace: 'Mercado Livre', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta', creationDate: '2025-09-29' },
        { id: '62306', descricao: 'Mercado Livre - Secundário', marketplace: 'Mercado Livre', idEmpresa: '1933', tokenStatus: 'ERRO', fluxo: 'Emitir Nota/Etiqueta', creationDate: '2025-09-30' },
        { id: '62307', descricao: 'Shopee - Oficial', marketplace: 'Shopee', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta', creationDate: '2025-09-28' },
    ];
    let integracoes = JSON.parse(localStorage.getItem('integracoes')) || defaultIntegracoes;
    return integracoes;
}

function saveIntegracoes(integracoes) {
    localStorage.setItem('integracoes', JSON.stringify(integracoes));
}

function addIntegracao(descricao, marketplace, idEmpresa) {
    const integracoes = getIntegracoes();
    const newId = String(Math.floor(Math.random() * 90000) + 10000);
    const today = new Date().toISOString().slice(0, 10);

    const newIntegracao = {
        id: newId,
        descricao: descricao,
        marketplace: marketplace,
        idEmpresa: idEmpresa,
        tokenStatus: 'OK', 
        fluxo: 'Emitir Nota/Etiqueta',
        creationDate: today
    };

    integracoes.push(newIntegracao);
    saveIntegracoes(integracoes);
    // Não adicionamos mais pedidos mockados, pois a API Java fará isso
    return newIntegracao;
}

function getEmpresas() {
    return JSON.parse(localStorage.getItem('empresas')) || [
        { id: '1933', razaoSocial: 'L LOPES DE SOUZA', cnpj: '20.748.410/0001-86', vencimentoCertificado: '26/03/2026', horaVencimento: '13:12' },
        { id: '2000', razaoSocial: 'EMPRESA TESTE CADASTRADA', cnpj: '11.111.111/0001-11', vencimentoCertificado: '30/09/2026', horaVencimento: '10:00' }
    ];
}

function saveEmpresas(empresas) {
    localStorage.setItem('empresas', JSON.stringify(empresas));
}

function addEmpresa(razaoSocial, cnpj) {
    const empresas = getEmpresas();
    const newId = String(Math.floor(Math.random() * 9000) + 2000);
    const novaEmpresa = {
        id: newId,
        razaoSocial: razaoSocial,
        cnpj: cnpj,
        vencimentoCertificado: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('pt-BR'),
        horaVencimento: '12:00'
    };
    empresas.push(novaEmpresa);
    saveEmpresas(empresas);
}

/* ========================================================= */
/* FUNÇÕES DE BUSCA REAL DE PEDIDOS NO BACKEND JAVA */
/* ========================================================= */

/**
 * Busca pedidos no Back-end Java usando filtros.
 * @param {string} tipo - Tipo do pedido (Ex: 'Padrão', 'FULL', 'FLEX').
 * @param {string} loja - Filtro de loja (Ex: 'Mercado Livre').
 * @returns {Promise<Array>} Lista de pedidos.
 */
async function getPedidos(tipo, loja) {
    let url = '/api/pedidos/listar';
    const params = new URLSearchParams();
    
    // Constrói os parâmetros de filtro para a API Java
    if (tipo) params.append('tipo', tipo);
    if (loja) params.append('loja', loja);

    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    console.log(`Buscando pedidos reais em: ${url}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Falha na API: ${response.status} ${response.statusText}`);
        }
        
        const pedidosReais = await response.json();

        // Mapeia os dados do Backend Java para o formato da sua tabela no Front-end
        return pedidosReais.map(p => ({
            id: p.id,
            idMp: p.idMp,
            loja: p.lojaDescricao, 
            marketplace: p.marketplace,
            data: new Date(p.dataCriacao).toLocaleDateString('pt-BR') + ' ' + new Date(p.dataCriacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            cliente: p.clienteNome,
            total: `R$ ${p.totalVenda.toFixed(2).replace('.', ',')}`,
            status: p.statusMp, 
            tipo: p.tipo,
            statusHub: p.statusHub,
            avisos: p.avisos || '', // Usa o campo avisos do BD
            transportadora: p.transportadora
        }));

    } catch (error) {
        console.error("Erro ao buscar pedidos no Backend Java:", error.message);
        // Retorna um array vazio em caso de erro para não quebrar a UI
        return [];
    }
}


/* ========================================================= */
/* FUNÇÕES DE RENDERIZAÇÃO DE PÁGINAS */
/* ========================================================= */

// Ícones de Aviso (Simulação baseada na imagem)
function getAvisosIcons(avisos) {
    if (avisos.includes('Nota Fiscal Pendente')) {
        return `
            <span class="material-icons-outlined info-icon" title="Nota Fiscal Pendente">receipt_long</span>
            <span class="material-icons-outlined warning-icon" title="Avisos no Pedido">warning_amber</span>
        `;
    }
     if (avisos.includes('2')) {
        return `
            <span class="material-icons-outlined info-icon" title="Nota Fiscal Emitida">receipt_long</span>
        `;
    }
    return '';
}

// 1. Renderiza a Tabela de Pedidos
function renderPedidosTable(pedidos, isFullPage = false) {
    const content = document.getElementById('content');
    
    // Filtros de Loja e Marketplace para o Select
    const integracoes = getIntegracoes().filter(i => i.tokenStatus === 'OK');
    const lojasOptions = integracoes.map(i => `<option value="${i.descricao}">${i.descricao}</option>`).join('');
    const mpOptions = [...new Set(integracoes.map(i => i.marketplace))]
                        .map(mp => `<option value="${mp}">${mp}</option>`).join('');

    let pageTitle = 'Padrão';
    let containerId = 'pedidos-padrao-container';

    if (isFullPage) {
        pageTitle = 'FULL - Mercado Livre';
        containerId = 'pedidos-full-ml-container';
    } else if (currentPage === 'pedidos-flex') {
        pageTitle = 'FLEX';
        containerId = 'pedidos-flex-container';
    }


    let tableHtml = `
        <div class="header">
            <h2><span class="material-icons-outlined">shopping_cart</span> Pedidos ${pageTitle}</h2>
            <div class="botoes-acao">
                <button class="botao-secundario">
                    <span class="material-icons-outlined">refresh</span>
                    Atualizar
                </button>
                <button class="botao-principal">
                    <span class="material-icons-outlined">print</span>
                    Imprimir Etiquetas
                </button>
            </div>
        </div>
        
        <div class="filtros-container filtros-pedidos">
            <div class="filtro-item">
                <label for="filtro-loja">Loja</label>
                <select id="filtro-loja">
                    <option value="">Todas</option>
                    ${lojasOptions}
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-marketplace">Marketplace</label>
                <select id="filtro-marketplace">
                    <option value="">Todos</option>
                    ${mpOptions}
                </select>
            </div>
            </div>
        
        <div class="botoes-filtro">
            <button class="botao-principal" id="aplicar-filtros">Filtrar</button>
            <button class="botao-secundario" id="limpar-filtros">Limpar</button>
        </div>

        <div class="abas-tipo-pedido">
            <a href="#" class="tipo-tab ${!isFullPage && currentPage === 'pedidos' ? 'active' : ''}" data-page="pedidos"><span class="status-badge-padrao">Padrão</span></a>
            <a href="#" class="tipo-tab ${currentPage === 'pedidos-flex' ? 'active' : ''}" data-page="pedidos-flex"><span class="status-badge-flex">FLEX</span></a>
            <a href="#" class="tipo-tab ${isFullPage ? 'active' : ''}" data-page="pedidos-full-ml"><span class="status-badge-full">FULL</span></a>
        </div>

        <div class="tabela-acoes">
            <div class="acoes-esquerda">
                <button class="botao-principal"><span class="material-icons-outlined">receipt_long</span> Emitir nota</button>
                <button class="botao-secundario">Preparar etiqueta</button>
                <button class="botao-secundario">Imprimir Etiquetas</button>
            </div>
            <div class="acoes-direita">
                <button class="botao-secundario">Mais opções</button>
            </div>
        </div>

        <div class="tabela-pedidos-container" id="${containerId}">
            <div class="pedidos-selecionados">
                Pedidos selecionados: <span id="count-pedidos-selecionados">0</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" id="select-all-pedidos"></th>
                        <th>ID</th>
                        <th>ID MP</th>
                        <th>Loja</th>
                        <th>Tipo</th>
                        <th>Status MP</th>
                        <th>Cliente</th>
                        <th>Data</th>
                        <th>Status Hub</th>
                        <th>Avisos / Info</th>
                        <th>Total</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (pedidos.length === 0) {
        tableHtml += `<tr><td colspan="12" class="no-results">Nenhum pedido encontrado.</td></tr>`;
    } else {
        pedidos.forEach(p => {
            const statusHubClass = `status-hub-${p.statusHub ? p.statusHub.toLowerCase().replace(/ /g, '-') : 'pendente'}`;
            const tipoBadgeClass = `status-badge-${p.tipo.toLowerCase()}`;
            tableHtml += `
                <tr>
                    <td><input type="checkbox" class="select-pedido"></td>
                    <td class="id-link">${p.id}</td>
                    <td>${p.idMp}</td>
                    <td>${p.loja}</td>
                    <td><span class="${tipoBadgeClass}">${p.tipo}</span></td>
                    <td>${p.status}</td>
                    <td>${p.cliente}</td>
                    <td>${p.data}</td>
                    <td><span class="${statusHubClass}">${p.statusHub}</span></td>
                    <td><div class="avisos-icons">${getAvisosIcons(p.avisos)}</div></td>
                    <td>${p.total}</td>
                    <td>
                        <button class="botao-tabela-config">
                            <span class="material-icons-outlined">settings</span>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    tableHtml += `
                </tbody>
            </table>
            </div>
    `;

    content.innerHTML = tableHtml;
    setupPedidosTabNavigation();
}

// 4. Renderiza a Tabela de Pedidos Padrão
async function renderPedidosPadrao() {
    const pedidos = await getPedidos('Padrão', ''); // Busca todos os pedidos "Padrão"
    renderPedidosTable(pedidos, false);
}

// 5. Renderiza a Tabela de Pedidos FULL (Busca real e filtrada)
async function renderPedidosFullML() {
     // Filtra pedidos: deve ser do tipo 'FULL' E a loja deve ser do 'Mercado Livre'
    const pedidosFullML = await getPedidos('FULL', 'Mercado Livre');
    renderPedidosTable(pedidosFullML, true);
}


function renderIntegracoesTable(integracoes) {
    const content = document.getElementById('content');
    
    let successBanner = '';
    if (authorizationSuccessMessage) {
        successBanner = `<div class="success-banner"><span class="material-icons-outlined icon-check">check_circle</span>${authorizationSuccessMessage}</div>`;
        authorizationSuccessMessage = ''; 
    }

    let tableHtml = `
        <div class="header config-header">
            <h2>Integrações de Marketplaces</h2>
            <button class="botao-principal" id="abrir-modal-cadastro">
                <span class="material-icons-outlined">add</span>
                Nova Integração
            </button>
        </div>
        
        ${successBanner}

        <div class="tabela-integracoes-container">
            <table>
                </table>
        </div>
    `;

    content.innerHTML = tableHtml;
    content.insertAdjacentHTML('beforeend', getModalCadastroHtml()); 
    setupCadastroIntegracao(); 
}


// ... (renderEmpresasTable e renderMaintenancePage, mantidos) ...
function renderEmpresasTable(empresas) { /* ... */ }
function renderMaintenancePage(title) { /* ... */ }


// HTML do Modal de Cadastro de Integração (Escolha do MP)
function getModalCadastroHtml() {
    return `
        <div id="cadastro-integracao-modal" class="cadastro-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Nova Integração</h3>
                    <button class="close-button" id="close-modal">&times;</button>
                </div>
                
                <p style="margin-bottom: 15px;">Selecione o Marketplace que deseja integrar:</p>
                
                <div class="marketplaces-grid">
                    <div class="marketplace-card" data-mp="shopee">
                        <img src="https://logospng.org/download/shopee/logo-shopee-icone-256.png" alt="Shopee Logo">
                        Shopee
                    </div>
                    <div class="marketplace-card" data-mp="mercado-livre">
                        <img src="https://logospng.org/download/mercado-livre/logo-mercado-livre-icone-256.png" alt="Mercado Livre Logo">
                        Mercado Livre
                    </div>
                    <div class="marketplace-card coming-soon">
                        <img src="https://i.imgur.com/xQW5R0q.png" alt="B2W Logo">
                        Americanas/B2W
                        <span class="soon-tag">Em breve</span>
                    </div>
                </div>

                <div id="shopee-form" style="display:none; margin-top: 30px;">
                    </div>
            </div>
        </div>
    `;
}

// Lógica de abertura/fechamento e salvamento de integração
function setupCadastroIntegracao() {
    const modal = document.getElementById('cadastro-integracao-modal');
    const openModalBtn = document.getElementById('abrir-modal-cadastro');
    const closeModalBtn = document.getElementById('close-modal');
    const marketplaces = document.querySelectorAll('.marketplace-card');
    const shopeeForm = document.getElementById('shopee-form');
    // ... (outros elementos) ...

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            shopeeForm.style.display = 'none'; 
            // ... (lógica de preenchimento do select de empresa)
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    marketplaces.forEach(card => {
        card.addEventListener('click', (e) => {
            if (card.classList.contains('coming-soon')) return;

            const mp = card.getAttribute('data-mp');
            if (mp === 'shopee') {
                shopeeForm.style.display = 'block';
            } else if (mp === 'mercado-livre') {
                // ***** FLUXO DE INTEGRAÇÃO REAL COM O BACK-END JAVA *****
                modal.style.display = 'none';
                // Redireciona para o Controller Java que inicia o Oauth2 do Mercado Livre
                window.location.href = '/api/integracao/ml/auth'; 
            }
        });
    });
    
    // ... (lógica de salvar shopee) ...
}


// ... (setupCadastroEmpresa e modais de empresa, mantidos) ...

/**
 * Configura a navegação entre as abas Padrão, FLEX e FULL na página de Pedidos
 */
function setupPedidosTabNavigation() {
    document.querySelectorAll('.abas-tipo-pedido a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.currentTarget.getAttribute('data-page');
            
            // 1. Remove o active de todas as abas e adiciona no clicado
            document.querySelectorAll('.abas-tipo-pedido a').forEach(a => a.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // 2. Carrega o conteúdo da tabela correspondente
            if (targetPage === 'pedidos') {
                loadPage(targetPage); // Chama loadPage para manter o estado do menu e carregar
            } else if (targetPage === 'pedidos-full-ml') {
                loadPage(targetPage);
            } else {
                // Simular carregamento de FLEX
                const title = e.currentTarget.textContent.trim();
                renderMaintenancePage(`Pedidos - ${title}`);
            }
        });
    });
}


/* ========================================================= */
/* LÓGICA DE NAVEGAÇÃO E CARREGAMENTO DE PÁGINA */
/* ========================================================= */

// Função Principal de Carregamento de Página
async function loadPage(pageName) {
    currentPage = pageName;
    
    // Atualiza o menu lateral
    document.querySelectorAll('#menu li').forEach(item => item.classList.remove('active'));
    const targetLink = document.querySelector(`[data-page="${pageName}"]`);
    if (targetLink) {
        targetLink.closest('li').classList.add('active');
        const parentMenu = targetLink.closest('.parent-menu');
        if (parentMenu) {
            parentMenu.classList.add('open');
        }
    }

    // Lógica de Carregamento
    if (pageName === 'pedidos') {
        await renderPedidosPadrao(); 

    } else if (pageName === 'pedidos-full-ml') {
        await renderPedidosFullML(); 

    } else if (pageName === 'integracoes') {
        const allIntegrations = getIntegracoes();
        renderIntegracoesTable(allIntegrations); 

    } else if (pageName === 'empresas') {
        const allEmpresas = getEmpresas();
        renderEmpresasTable(allEmpresas);

    } else {
        const title = targetLink ? targetLink.textContent.trim() : pageName.charAt(0).toUpperCase() + pageName.slice(1);
        renderMaintenancePage(title);
    }
}

// Inicialização do Sistema
document.addEventListener('DOMContentLoaded', () => {
    // 1. Configura a navegação da barra lateral
    document.getElementById('menu').addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const pageName = link.getAttribute('data-page');
            const parentMenu = link.closest('.parent-menu');

            if (pageName) {
                e.preventDefault();
                loadPage(pageName);
            } else if (parentMenu) {
                parentMenu.classList.toggle('open');
            }
        }
    });

    // 2. Carrega a página inicial
    loadPage('pedidos'); 
});
