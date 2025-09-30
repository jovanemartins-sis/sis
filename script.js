// =========================================================
// CONFIGURAÇÕES DA INTEGRAÇÃO MERCADO LIVRE (OAuth 2.0)
// =========================================================
const OAUTH_URL = 'https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=2535848994116239&redirect_uri=https://jovanemartins-sis.github.io/sis/';

// Variável global para armazenar a mensagem de sucesso após o retorno do ML
let authorizationSuccessMessage = null;


// =========================================================
// GESTÃO DE DADOS PERSISTENTES (LOCAL STORAGE)
// =========================================================

// Mock inicial que será usado se nada estiver salvo no localStorage
const INITIAL_INTEGRATIONS_MOCK = [
    { id: '62305', descricao: 'Shopee - Principal', marketplace: 'Shopee', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta' },
    { id: '62306', descricao: 'Mercado Livre - Principal', marketplace: 'Mercado Livre', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta' },
    { id: '62307', descricao: 'Shein - Principal', marketplace: 'SHEIN', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta' }
];

// Função para obter a lista de integrações salvas no navegador
function getIntegracoes() {
    const saved = localStorage.getItem('sis_integracoes');
    if (saved) {
        return JSON.parse(saved);
    }
    // Salva e retorna a lista inicial se for o primeiro acesso
    saveIntegracoes(INITIAL_INTEGRATIONS_MOCK);
    return INITIAL_INTEGRATIONS_MOCK;
}

// Função para salvar a lista atual de integrações no navegador
function saveIntegracoes(integracoes) {
    localStorage.setItem('sis_integracoes', JSON.stringify(integracoes));
}


// =========================================================
// Conteúdo das Páginas (Mockup)
// =========================================================

const pageContent = {
    'inicio': `<div class="header"><h2>Início</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'integracoes': `
        <div class="header">
            <h2><span class="icon-asterisk">*</span> Integrações</h2>
            <button class="botao-principal cadastrar-integracao">Cadastrar Integrações</button>
        </div>
        <div class="integracoes-container">
            <div class="pagination-controls">
                <div class="pagination-nav">
                    <button class="page-arrow" disabled>&lt;</button>
                    <button class="page-number active">1</button>
                    <button class="page-arrow" disabled>&gt;</button>
                </div>
                <select class="items-per-page">
                    <option value="10">10 / Página</option>
                    <option value="20">20 / Página</option>
                </select>
            </div>
            <div class="tabela-integracoes-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descrição</th>
                            <th>Marketplace</th>
                            <th>Id Empresa</th>
                            <th>Token de Acesso</th>
                            <th>Fluxo de Pedidos</th>
                        </tr>
                    </thead>
                    <tbody id="integracoes-table-body">
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="cadastro-modal" class="cadastro-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cadastrar Integração</h3>
                    <span class="close-button">&times;</span>
                </div>
                <div class="marketplaces-grid">
                    <button class="marketplace-card" data-marketplace="Mercado Livre"><img src="mercadolivre-ico.svg" alt="Mercado Livre">Mercado Livre</button>
                    <button class="marketplace-card" data-marketplace="Shopee"><img src="shopee-logo.png" alt="Shopee">Shopee</button>
                    <button class="marketplace-card" data-marketplace="SHEIN"><img src="shein-logo.png" alt="SHEIN">SHEIN</button>
                    <button class="marketplace-card" data-marketplace="Magalu"><img src="magalu-logo.png" alt="Magalu">Magalu</button>
                    <button class="marketplace-card disabled" data-marketplace="Lojas Americanas"><img src="americanas-logo.png" alt="Lojas Americanas">Lojas Americanas</button>
                    <button class="marketplace-card" data-marketplace="Olist"><img src="olist-logo.png" alt="Olist">Olist</button>
                    <button class="marketplace-card" data-marketplace="Netshoes"><img src="netshoes-logo.png" alt="Netshoes">Netshoes</button>
                    <button class="marketplace-card" data-marketplace="Bling!"><img src="bling-logo.png" alt="Bling">Bling!</button>
                    <button class="marketplace-card" data-marketplace="Yampi"><img src="yampi-logo.png" alt="Yampi">Yampi</button>
                    <button class="marketplace-card" data-marketplace="Tray"><img src="tray-logo.png" alt="Tray">Tray</button>
                    <button class="marketplace-card" data-marketplace="Kwai"><img src="kwai-logo.png" alt="Kwai">Kwai</button>
                    <button class="marketplace-card" data-marketplace="Irroba"><img src="irroba-logo.png" alt="Irroba">Irroba</button>
                    <button class="marketplace-card" data-marketplace="Loja Integrada"><img src="loja-integrada-logo.png" alt="Loja Integrada">Loja Integrada</button>
                    <button class="marketplace-card" data-marketplace="Bagy"><img src="bagy-logo.png" alt="Bagy">Bagy</button>
                    <button class="marketplace-card" data-marketplace="Nuvemshop"><img src="nuvemshop-logo.png" alt="Nuvemshop">Nuvemshop</button>
                    <button class="marketplace-card" data-marketplace="TikTok"><img src="tiktok-logo.png" alt="TikTok">TikTok</button>
                    <button class="marketplace-card coming-soon" data-marketplace="Shopify"><img src="shopify-logo.png" alt="Shopify">Shopify <span class="soon-tag">Em breve</span></button>
                </div>
            </div>
        </div>
    `,
    'pedidos': `
        <div class="header"><h2>Pedidos</h2></div>
        <div class="filtros-container">
            <div class="filtro-item">
                <label for="filtro-loja">Loja</label>
                <select id="filtro-loja">
                    <option value="todos">Todos</option>
                    <option value="shopee-principal">Shopee - Principal</option>
                    <option value="mercado-livre-principal">Mercado Livre - Principal</option>
                    <option value="shein-principal">Shein - Principal</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-marketplace">Marketplace</label>
                <select id="filtro-marketplace">
                    <option value="todos">Todos</option>
                    <option value="mercado-livre">Mercado Livre</option>
                    <option value="shopee">Shopee</option>
                    <option value="magalu">Magalu</option>
                    <option value="b2w">B2W</option>
                    <option value="holiste">Holiste</option>
                    <option value="netshoes">Netshoes</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-status">Status</label>
                <select id="filtro-status">
                    <option value="todos">Todos</option>
                    <option value="mlb-cancelado">MLB - Cancelado</option>
                    <option value="mlb-confirmado">MLB - Confirmado</option>
                    <option value="mlb-invalido">MLB - Inválido</option>
                    <option value="mlb-pagamento-em-proc">MLB - Pagamento em Proc...</option>
                    <option value="mlb-pagamento-requerido">MLB - Pagamento Requerido</option>
                    <option value="mlb-pago">MLB - Pago</option>
                    <option value="mlb-parcialmente-pago">MLB - Parcialmente Pago</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-status-hub">Status Hub</label>
                <select id="filtro-status-hub">
                    <option value="todos">Todos</option>
                    <option value="sem-vinculo">Sem vínculo</option>
                    <option value="pendente">Pendente</option>
                    <option value="expedir">Expedir</option>
                    <option value="em-separacao">Em separação</option>
                    <option value="completo">Completo</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="tem-mensagem">Tem mensagem</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-transportadora">Transportadora</label>
                <select id="filtro-transportadora">
                    <option value="todos">Todos</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-id-hub">ID Hub</label>
                <input type="text" id="filtro-id-hub">
            </div>
            <div class="filtro-item">
                <label for="filtro-cliente">Nome do Cliente</label>
                <input type="text" id="filtro-cliente">
            </div>
            <div class="filtro-item">
                <label for="filtro-id-mp">ID Marketplace</label>
                <input type="text" id="filtro-id-mp">
            </div>
            <div class="filtro-item">
                <label for="filtro-id-carrinho">ID do Carrinho</label>
                <input type="text" id="filtro-id-carrinho">
            </div>
            <div class="filtro-item">
                <label for="filtro-data-inicial">Data Inicial</label>
                <input type="date" id="filtro-data-inicial">
            </div>
            <div class="filtro-item">
                <label for="filtro-data-final">Data Final</label>
                <input type="date" id="filtro-data-final">
            </div>
            <div class="filtro-item filtro-erro">
                <label for="filtro-pedidos-erro">Filtrar Pedidos com Erro <span class="info-icon">?</span></label>
                <label class="switch">
                    <input type="checkbox" id="filtro-pedidos-erro">
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
        <div class="abas-container">
            <button class="tab-button active">Padrão</button>
            <button class="tab-button">Flex</button>
            <button class="tab-button">FULL</button>
        </div>
        <div class="botoes-filtro">
            <button id="limpar-filtro">Limpar</button>
            <button id="aplicar-filtro" class="botao-principal">Filtrar</button>
        </div>
        <div class="botoes-acao">
            <button class="botao-principal">Emitir nota</button>
            <button class="botao-principal">Preparar etiqueta</button>
            <button class="botao-principal">Imprimir Etiquetas</button>
            <button class="botao-secundario">Gerar Etiqueta Seven</button>
            <button class="botao-secundario">Atualizar pedido mercado livre</button>
            <button class="botao-mais-opcoes">Mais opções</button>
        </div>
        <div class="tabela-pedidos-container">
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox"></th>
                        <th>ID</th>
                        <th>ID MP</th>
                        <th>Loja</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Cliente</th>
                        <th>Data</th>
                        <th>Status Hub</th>
                        <th>Avisos / Info</th>
                        <th>Total</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="pedidos-table-body">
                </tbody>
            </table>
        </div>
    `,
    'produtos': `<div class="header"><h2>Produtos</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'anuncios': `<div class="header"><h2>Anúncios</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'expedicao': `<div class="header"><h2>Expedição</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'coleta': `<div class="header"><h2>Conferência de Coleta</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'relatorios': `<div class="header"><h2>Relatórios</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'configuracoes': `<div class="header"><h2>Configurações</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'notas-fiscais': `<div class="header"><h2>Notas Fiscais</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'mensagens': `<div class="header"><h2>Mensagens</div><div class="maintenance-message">Página em Manutenção</div>`,
    'plp': `<div class="header"><h2>PLP</h2></div><div class="maintenance-message">Página em Manutenção</div>`
};

const pedidosMock = [
    { id: '56556090', idMp: '250927JGM6BK0R6', loja: 'Shopee', tipo: 'Padrão', status: 'PROCESSED', cliente: 'Viviane de L.A. Rosa', data: '26/09/2025', statusHub: 'Expedir', avisos: '', total: 'R$ 35,00' },
    { id: '56556018', idMp: '250927JGSVEGC', loja: 'SHEIN', tipo: 'Padrão', status: 'to be collected by SHEIN', cliente: 'Josefa Madalena', data: '26/09/2025', statusHub: 'Expedir', avisos: '', total: 'R$ 22,48' },
    { id: '56556100', idMp: '250927JGSVEGD', loja: 'Shopee', tipo: 'Padrão', status: 'PROCESSED', cliente: 'Pedro Santos', data: '26/09/2025', statusHub: 'Pendente', avisos: 'Caractere especial', total: 'R$ 55,00' }
];


// =========================================================
// Funções de Renderização e Lógica
// =========================================================

function renderIntegracoesTable(integracoes) {
    const tableBody = document.getElementById('integracoes-table-body');
    if (!tableBody) {
        return;
    }
    tableBody.innerHTML = '';
    integracoes.forEach(integracao => {
        const marketplaceClass = integracao.marketplace.toLowerCase().replace(/ /g, '-');
        const tokenClass = integracao.tokenStatus.toLowerCase();

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="id-link">${integracao.id}</td>
            <td>${integracao.descricao}</td>
            <td><span class="marketplace-logo ${marketplaceClass}">${integracao.marketplace}</span></td>
            <td>${integracao.idEmpresa}</td>
            <td><span class="token-status ${tokenClass}">${integracao.tokenStatus}</span></td>
            <td>
                <button class="fluxo-btn">${integracao.fluxo}</button>
                <select class="fluxo-select">
                    <option value="emitir-nota">Emitir Nota/Etiqueta</option>
                    <option value="emitir-nota-somente">Emitir Nota Somente</option>
                    <option value="emitir-etiqueta-somente">Emitir Etiqueta Somente</option>
                    <option value="nenhum">Nenhum</option>
                </select>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderTable(pedidos) {
    const tableBody = document.getElementById('pedidos-table-body');
    if (!tableBody) {
        return;
    }
    tableBody.innerHTML = '';
    pedidos.forEach(pedido => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${pedido.id}</td>
            <td>${pedido.idMp}</td>
            <td>${pedido.loja}</td>
            <td>${pedido.tipo}</td>
            <td>${pedido.status}</td>
            <td>${pedido.cliente}</td>
            <td>${pedido.data}</td>
            <td><span class="status-hub-${pedido.statusHub.toLowerCase().replace(/ /g, '-')}">${pedido.statusHub}</span></td>
            <td>${pedido.avisos}</td>
            <td>${pedido.total}</td>
            <td><button>...</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function setupCadastroIntegracao() {
    const btn = document.querySelector('.cadastrar-integracao');
    const modal = document.getElementById('cadastro-modal');
    const closeBtn = document.querySelector('#cadastro-modal .close-button');

    if (btn && modal) {
        btn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        document.querySelectorAll('.marketplace-card').forEach(card => {
            if (!card.classList.contains('disabled') && !card.classList.contains('coming-soon')) {
                card.addEventListener('click', () => {
                    const name = card.getAttribute('data-marketplace'); 
                    
                    if (name === 'Mercado Livre') {
                        modal.style.display = 'none'; 
                        // Ação de Redirecionamento CORRETA
                        window.location.href = OAUTH_URL; 
                    } else {
                        modal.style.display = 'none'; 
                        alert(`Iniciando o fluxo de cadastro para: ${name}`);
                    }
                });
            }
        });
    }
}

function filterPedidos() {
    const lojaFilterValue = document.getElementById('filtro-loja').value.toLowerCase().replace('-principal', '').trim();
    const statusHubFilterValue = document.getElementById('filtro-status-hub').value.toLowerCase().trim();
    const idHubFilterValue = document.getElementById('filtro-id-hub').value.trim().toLowerCase();
    const clienteFilterValue = document.getElementById('filtro-cliente').value.trim().toLowerCase();
    

    const filteredPedidos = pedidosMock.filter(pedido => {
        
        if (lojaFilterValue !== 'todos' && !pedido.loja.toLowerCase().includes(lojaFilterValue)) {
             return false;
        }
        
        if (statusHubFilterValue !== 'todos' && pedido.statusHub.toLowerCase() !== statusHubFilterValue) {
            return false;
        }

        if (idHubFilterValue && pedido.id.toLowerCase().includes(idHubFilterValue) === false) {
            return false;
        }

        if (clienteFilterValue && pedido.cliente.toLowerCase().includes(clienteFilterValue) === false) {
            return false;
        }

        return true;
    });

    renderTable(filteredPedidos);
}

function setupFilterButtons() {
    const limparFiltroBtn = document.getElementById('limpar-filtro');
    const aplicarFiltroBtn = document.getElementById('aplicar-filtro');

    if (limparFiltroBtn) {
        limparFiltroBtn.addEventListener('click', () => {
            const formElements = document.querySelectorAll('.filtros-container select, .filtros-container input');
            formElements.forEach(element => {
                if (element.type === 'checkbox') {
                    element.checked = false;
                } else if (element.tagName === 'SELECT') { 
                    element.value = 'todos'; 
                } else { 
                    element.value = ''; 
                }
            });
            renderTable(pedidosMock); 
        });
    }

    if (aplicarFiltroBtn) {
        aplicarFiltroBtn.addEventListener('click', () => {
            filterPedidos(); 
        });
    }
}

function loadPage(pageName) {
    const contentArea = document.getElementById('content');
    let pageHtml = pageContent[pageName];

    // LÓGICA DE EXIBIÇÃO DA MENSAGEM DE SUCESSO
    if (pageName === 'integracoes' && authorizationSuccessMessage) {
        const successHtml = `
            <div class="success-banner">
                <span class="icon-check">✓</span> ${authorizationSuccessMessage}
            </div>
        `;
        pageHtml = successHtml + pageHtml;
        authorizationSuccessMessage = null; 
    }

    contentArea.innerHTML = pageHtml;
    
    // RENDERIZAÇÃO DA TABELA DE INTEGRAÇÕES AGORA CHAMA O getIntegracoes()
    if (pageName === 'pedidos') {
        renderTable(pedidosMock);
        setupFilterButtons();
    } else if (pageName === 'integracoes') {
        renderIntegracoesTable(getIntegracoes()); 
        setupCadastroIntegracao();
    }
    setupSidebarMenu();
}

function setupSidebarMenu() {
    const parentMenu = document.querySelector('.parent-menu');
    if (parentMenu) {
        parentMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && !e.target.closest('.submenu')) {
                e.preventDefault();
                parentMenu.classList.toggle('open');
            }
        });
    }

    document.querySelectorAll('#sidebar a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.getAttribute('data-page');

            document.querySelectorAll('#sidebar li').forEach(li => {
                li.classList.remove('active');
            });

            link.closest('li').classList.add('active');

            if (link.closest('.parent-menu')) {
                link.closest('.parent-menu').classList.add('open');
            }

            loadPage(pageName);
        });
    });
}


// =========================================================
// FUNÇÃO DE INICIALIZAÇÃO (DOMContentLoaded)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    let pageToLoad = 'pedidos'; 

    // 1. LÓGICA CRÍTICA: Verifica se o Mercado Livre nos enviou o 'code'
    if (urlParams.has('code')) {
        // --- ADICIONA A NOVA INTEGRAÇÃO NO LOCALSTORAGE ---
        let integracoesAtuais = getIntegracoes();
        
        // Simula que a integração foi realizada, apenas se a URL não tiver sido limpa ainda
        if (window.history.length > 1) { // Verifica se houve navegação (simplificação)
            integracoesAtuais.push({
                id: (Math.floor(Math.random() * 90000) + 10000).toString(), 
                descricao: 'Mercado Livre - Nova Loja', // Descrição diferente para teste
                marketplace: 'Mercado Livre',
                idEmpresa: (Math.floor(Math.random() * 9000) + 1000).toString(),
                tokenStatus: 'OK',
                fluxo: 'Emitir Nota/Etiqueta'
            });

            // Salva a nova lista no localStorage
            saveIntegracoes(integracoesAtuais);
        }
        // -----------------------------------------------------------

        authorizationSuccessMessage = `Integração com Mercado Livre concluída! A nova loja foi salva e agora é exibida na tabela.`;
        
        pageToLoad = 'integracoes'; 

        // Limpa o URL no navegador para remover o parâmetro 'code'
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: newUrl}, '', newUrl);

    } else if (urlParams.has('error')) {
        authorizationSuccessMessage = "Erro na integração com o Mercado Livre. Por favor, tente novamente.";
        pageToLoad = 'integracoes';
    }


    // 2. Carrega a página inicial ou a página de integrações
    loadPage(pageToLoad);
    
    // 3. Define a classe 'active' no menu lateral
    const activeLink = document.querySelector(`[data-page="${pageToLoad}"]`);
    if (activeLink) {
        activeLink.closest('li').classList.add('active');
        const parentMenu = activeLink.closest('.parent-menu');
        if (parentMenu) {
            parentMenu.classList.add('open');
        }
    }
});
