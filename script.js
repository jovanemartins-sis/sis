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
    const defaultIntegracoes = [
        { id: '62305', descricao: 'Shopee - Principal', marketplace: 'Shopee', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta', creationDate: '2025-09-29' },
        { id: '62306', descricao: 'Mercado Livre - Secundário', marketplace: 'Mercado Livre', idEmpresa: '1933', tokenStatus: 'ERRO', fluxo: 'Emitir Nota/Etiqueta', creationDate: '2025-09-30' },
        { id: '62307', descricao: 'Mercado Livre - Antiga OK', marketplace: 'Mercado Livre', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta', creationDate: '2025-09-28' },
    ];
    let integracoes = JSON.parse(localStorage.getItem('integracoes')) || defaultIntegracoes;
    const today = new Date().toISOString().slice(0, 10);
    integracoes = integracoes.map(i => {
        if (i.creationDate === today && i.tokenStatus !== 'ERRO') {
            i.tokenStatus = 'OK'; 
        }
        return i;
    });

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
    addMockPedidos(descricao);
    return newIntegracao;
}

function getPedidos() {
    const defaultPedidos = [
        // Pedido Padrão Shopee
        { id: '56819121', idMp: '251001UNSDRFU', loja: 'Shopee - Principal', tipo: 'Padrão', status: 'PROCESSED', cliente: 'Ana Paula Santana de Oliveira', data: '30/09/2025 13:51', statusHub: 'Completo', avisos: '1', total: 'R$ 18,60', transportadora: 'Shopee Xpress' },
        // Pedido FLEX Shopee
        { id: '56819122', idMp: '251002FLEXSP', loja: 'Shopee - Principal', tipo: 'FLEX', status: 'PENDING', cliente: 'Roberto Silva', data: '30/09/2025 14:00', statusHub: 'Expedir', avisos: '', total: 'R$ 75,00', transportadora: 'Correios' },
        // Pedido FULL Mercado Livre (Normalmente não aparece nesta tela, mas vamos deixá-lo para testes)
        { id: '40123456', idMp: 'MLB19827364', loja: 'Mercado Livre - Antiga OK', tipo: 'FULL', status: 'delivered', cliente: 'Maria da Silva', data: '01/03/2024 10:00', statusHub: 'Completo', avisos: '2', total: 'R$ 150,00', transportadora: 'Mercado Envios' },
    ];
    return JSON.parse(localStorage.getItem('pedidos')) || defaultPedidos;
}

function savePedidos(pedidos) {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function addMockPedidos(lojaDescricao) {
    const pedidos = getPedidos();
    const newId = String(Math.floor(Math.random() * 90000) + 57000000);
    const newPedido = {
        id: newId,
        idMp: 'MP-' + newId,
        loja: lojaDescricao,
        tipo: 'Padrão',
        status: 'READY_TO_SHIP',
        cliente: 'Cliente Novo Integrado',
        data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        statusHub: 'Expedir',
        avisos: 'Pedido da nova integração!',
        total: 'R$ 150,00',
        transportadora: 'Não Definida'
    };
    pedidos.push(newPedido);
    savePedidos(pedidos);
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
/* FUNÇÕES DE RENDERIZAÇÃO DE PÁGINAS */
/* ========================================================= */

// Ícones de Aviso (Simulação baseada na imagem)
function getAvisosIcons(avisos) {
    if (avisos.includes('1')) {
        return `
            <span class="material-icons-outlined info-icon" title="Nota Fiscal Emitida">receipt_long</span>
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

// 1. Renderiza a Tabela de Pedidos (Layout refatorado para o padrão da imagem)
function renderPedidosTable(pedidos, isFullPage = false) {
    const content = document.getElementById('content');
    
    // Filtros de Loja e Marketplace para o Select
    const integracoes = getIntegracoes().filter(i => i.tokenStatus === 'OK');
    const lojasOptions = integracoes.map(i => `<option value="${i.descricao}">${i.descricao}</option>`).join('');
    const mpOptions = [...new Set(integracoes.map(i => i.marketplace))]
                        .map(mp => `<option value="${mp}">${mp}</option>`).join('');

    let tableHtml = `
        <div class="header">
            <h2><span class="material-icons-outlined">shopping_cart</span> Pedidos ${isFullPage ? 'FULL - Mercado Livre' : 'Padrão'}</h2>
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
            <div class="filtro-item">
                <label for="filtro-status">Status MP</label>
                <select id="filtro-status">
                    <option value="">Todos</option>
                    <option value="PROCESSED">Processado</option>
                    <option value="PENDING">Pendente</option>
                    <option value="delivered">Entregue</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-status-hub">Status Hub</label>
                <select id="filtro-status-hub">
                    <option value="">Todos</option>
                    <option value="Expedir">Expedir</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Completo">Completo</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-transportadora">Transportadora</label>
                <select id="filtro-transportadora">
                    <option value="">Todos</option>
                    <option value="Shopee Xpress">Shopee Xpress</option>
                    <option value="Mercado Envios">Mercado Envios</option>
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
            <div class="filtro-item filtro-periodo">
                <label for="filtro-data-inicial">Período</label>
                <div class="input-periodo">
                    <input type="date" id="filtro-data-inicial" placeholder="Alterado a partir de">
                    <span>até</span>
                    <input type="date" id="filtro-data-final">
                </div>
            </div>
            <div class="filtro-item filtro-erro-toggle">
                <div class="toggle-container">
                    <span>Filtrar Pedidos com Erro:</span>
                    <label class="switch">
                        <input type="checkbox" id="filtro-com-erro">
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        </div>
        
        <div class="botoes-filtro">
            <button class="botao-principal" id="aplicar-filtros">Filtrar</button>
            <button class="botao-secundario" id="limpar-filtros">Limpar</button>
        </div>

        <div class="abas-tipo-pedido">
            <a href="#" class="tipo-tab ${!isFullPage ? 'active' : ''}" data-page="pedidos"><span class="status-badge-padrao">Padrão</span></a>
            <a href="#" class="tipo-tab"><span class="status-badge-flex">FLEX</span></a>
            <a href="#" class="tipo-tab ${isFullPage ? 'active' : ''}" data-page="pedidos-full-ml"><span class="status-badge-full">FULL</span></a>
        </div>

        <div class="tabela-acoes">
            <div class="acoes-esquerda">
                <button class="botao-principal"><span class="material-icons-outlined">receipt_long</span> Emitir nota</button>
                <button class="botao-secundario">Preparar etiqueta</button>
                <button class="botao-secundario">Imprimir Etiquetas</button>
                <button class="botao-secundario">Gerar Etiqueta Expedy</button>
                <button class="botao-secundario">Atualizar pedido mercado livre</button>
            </div>
            <div class="acoes-direita">
                <button class="botao-secundario">Mais opções</button>
            </div>
        </div>

        <div class="tabela-pedidos-container">
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
                        <th>Status</th>
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
            const statusHubClass = `status-hub-${p.statusHub.toLowerCase().replace(/ /g, '-')}`;
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
            <div class="tabela-rodape">
                <div class="paginacao">
                    <button class="botao-secundario">&lt;</button>
                    <button class="botao-secundario active">1</button>
                    <button class="botao-secundario">2</button>
                    <button class="botao-secundario">3</button>
                    <span>...</span>
                    <button class="botao-secundario">43</button>
                    <button class="botao-secundario">&gt;</button>
                </div>
                <select class="select-pagina">
                    <option>50 / Página</option>
                    <option>100 / Página</option>
                </select>
            </div>
        </div>
    `;

    content.innerHTML = tableHtml;
}

// 4. Renderiza a Tabela de Pedidos FULL (separada)
function renderPedidosFullML() {
     // Apenas pedidos FULL do Mercado Livre
    const pedidosFull = getPedidos().filter(p => p.tipo === 'FULL' && p.loja.includes('Mercado Livre'));
    renderPedidosTable(pedidosFull, true);
}


// ... [Restante das funções de renderização (Integracoes, Empresas, Maintenance) permanecem as mesmas] ...
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
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Loja</th>
                        <th>Marketplace</th>
                        <th>Status Token</th>
                        <th>Empresa Vinculada</th>
                        <th>Fluxo Padrão</th>
                        <th>Data Cadastro</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    const empresas = getEmpresas();

    if (integracoes.length === 0) {
        tableHtml += `<tr><td colspan="8" class="no-results">Nenhuma integração encontrada.</td></tr>`;
    } else {
        integracoes.forEach(i => {
            const statusClass = i.tokenStatus === 'OK' ? 'ok' : 'erro';
            const empresa = empresas.find(e => e.id === i.idEmpresa);
            const empresaNome = empresa ? empresa.razaoSocial : 'Não Vinculada';
            const mpClass = i.marketplace.toLowerCase().replace(/ /g, '-');
            
            tableHtml += `
                <tr>
                    <td>${i.id}</td>
                    <td>${i.descricao}</td>
                    <td><span class="marketplace-logo ${mpClass}">${i.marketplace}</span></td>
                    <td><span class="token-status ${statusClass}">${i.tokenStatus}</span></td>
                    <td>${empresaNome}</td>
                    <td>
                        <select class="fluxo-select">
                            <option value="nota-etiqueta" ${i.fluxo === 'Emitir Nota/Etiqueta' ? 'selected' : ''}>Emitir Nota/Etiqueta</option>
                            <option value="so-etiqueta" ${i.fluxo === 'Somente Etiqueta' ? 'selected' : ''}>Somente Etiqueta</option>
                        </select>
                    </td>
                    <td>${i.creationDate}</td>
                    <td>
                        <button class="botao-secundario botao-mais-opcoes">
                            <span class="material-icons-outlined">more_vert</span>
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
    content.insertAdjacentHTML('beforeend', getModalCadastroHtml()); 
    setupCadastroIntegracao(); 
}

function renderEmpresasTable(empresas) {
    const content = document.getElementById('content');
    
    let tableHtml = `
        <div class="header config-header">
            <h2>Empresas (Emitentes de NF)</h2>
            <button class="botao-principal" id="abrir-modal-cadastro-empresa">
                <span class="material-icons-outlined">add</span>
                Nova Empresa
            </button>
        </div>

        <div class="tabela-empresas-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Razão Social</th>
                        <th>CNPJ</th>
                        <th>Certificado (Vencimento)</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (empresas.length === 0) {
        tableHtml += `<tr><td colspan="5" class="no-results">Nenhuma empresa cadastrada.</td></tr>`;
    } else {
        empresas.forEach(e => {
            tableHtml += `
                <tr>
                    <td>${e.id}</td>
                    <td><span class="descricao-link">${e.razaoSocial}</span></td>
                    <td>${e.cnpj}</td>
                    <td>
                        ${e.vencimentoCertificado}
                        <div class="time-detail">Válido até ${e.horaVencimento}</div>
                    </td>
                    <td>
                        <button class="botao-secundario botao-mais-opcoes">
                            <span class="material-icons-outlined">edit</span>
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
    content.insertAdjacentHTML('beforeend', getModalCadastroEmpresaHtml());
    setupCadastroEmpresa();
}

function renderMaintenancePage(title) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="header">
            <h2>${title}</h2>
        </div>
        <div class="maintenance-message">
            <span class="material-symbols-outlined" style="font-size: 48px; color: var(--primary-color);">construction</span>
            <p>Página em Desenvolvimento</p>
            <p style="font-size: 0.8em; margin-top: 10px;">A funcionalidade para **${title}** será implementada em breve.</p>
        </div>
    `;
}
// ... [Fim das funções de renderização] ...


// ... [Funções de Modal (getModalCadastroHtml, setupCadastroIntegracao, getModalCadastroEmpresaHtml, setupCadastroEmpresa) permanecem as mesmas] ...

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
                    <div class="marketplace-card coming-soon">
                        <img src="https://logospng.org/download/amazon/logo-amazon-icone-256.png" alt="Amazon Logo">
                        Amazon
                        <span class="soon-tag">Em breve</span>
                    </div>
                </div>

                <div id="shopee-form" style="display:none; margin-top: 30px;">
                    <div class="modal-header" style="margin-bottom: 15px;">
                        <h4>Configuração Shopee</h4>
                    </div>
                    <div class="input-grid form-full-width">
                        <div class="input-item required">
                            <label for="shopee-descricao">Descrição da Loja (Nome de Referência)</label>
                            <input type="text" id="shopee-descricao" placeholder="Ex: Shopee - Loja Principal">
                        </div>
                        <div class="input-item required">
                            <label for="shopee-partner-id">Partner ID</label>
                            <input type="text" id="shopee-partner-id" placeholder="ID fornecido pela Shopee">
                        </div>
                        <div class="input-item required">
                            <label for="shopee-partner-key">Partner Key</label>
                            <input type="text" id="shopee-partner-key" placeholder="Key fornecida pela Shopee">
                        </div>
                        <div class="input-item required">
                            <label for="shopee-empresa-vinculo">Empresa para Vínculo Fiscal</label>
                            <select id="shopee-empresa-vinculo">
                                </select>
                        </div>
                    </div>
                    <div style="margin-top: 30px; text-align: right;">
                        <button class="botao-secundario" id="cancelar-shopee">Cancelar</button>
                        <button class="botao-principal" id="salvar-shopee">Salvar Integração Shopee</button>
                    </div>
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
    const cancelarShopeeBtn = document.getElementById('cancelar-shopee');
    let salvarShopeeBtn = document.getElementById('salvar-shopee'); 

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            const selectEmpresa = document.getElementById('shopee-empresa-vinculo');
            selectEmpresa.innerHTML = '<option value="">Selecione uma Empresa</option>';
            getEmpresas().forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.razaoSocial;
                selectEmpresa.appendChild(option);
            });
            shopeeForm.style.display = 'none'; 
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
                alert('Simulando o redirecionamento para o login do Mercado Livre...');
                setTimeout(() => {
                    addIntegracao('Mercado Livre - Nova Loja', 'Mercado Livre', '1933');
                    modal.style.display = 'none';
                    authorizationSuccessMessage = 'Integração com Mercado Livre concluída com sucesso!';
                    loadPage('integracoes');
                }, 1000);
            }
        });
    });
    
    if (cancelarShopeeBtn) {
        cancelarShopeeBtn.addEventListener('click', () => {
            shopeeForm.style.display = 'none';
        });
    }

    if (salvarShopeeBtn) {
        const newSalvarShopeeBtn = salvarShopeeBtn.cloneNode(true);
        salvarShopeeBtn.parentNode.replaceChild(newSalvarShopeeBtn, salvarShopeeBtn);
        salvarShopeeBtn = newSalvarShopeeBtn; 
        
        salvarShopeeBtn.addEventListener('click', () => {
            
            const descricao = document.getElementById('shopee-descricao').value.trim();
            const partnerId = document.getElementById('shopee-partner-id').value.trim();
            const partnerKey = document.getElementById('shopee-partner-key').value.trim(); 
            const empresaId = document.getElementById('shopee-empresa-vinculo').value;
            
            if (descricao === '' || partnerId === '' || partnerKey === '' || empresaId === '') {
                alert('Por favor, preencha todos os campos obrigatórios para a integração Shopee.');
                return;
            }

            addIntegracao(descricao, 'Shopee', empresaId);
            
            document.getElementById('shopee-form').style.display = 'none';
            modal.style.display = 'none';
            authorizationSuccessMessage = `Integração com Shopee ("${descricao}") salva com sucesso. Parceiro ID: ${partnerId}`;
            
            loadPage('integracoes'); 
        });
    }
}


function getModalCadastroEmpresaHtml() {
    return `
        <div id="cadastro-empresa-modal" class="cadastro-modal">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3>Cadastro de Nova Empresa (Emitente)</h3>
                    <button class="close-button" id="close-modal-empresa">&times;</button>
                </div>
                
                <form id="form-cadastro-empresa">
                    
                    <div class="config-section">
                        <h3>Dados Cadastrais</h3>
                        <div class="input-grid form-full-width">
                            <div class="input-item required" style="grid-column: span 2;">
                                <label for="empresa-razao">Razão Social</label>
                                <input type="text" id="empresa-razao" required>
                            </div>
                            <div class="input-item required">
                                <label for="empresa-cnpj">CNPJ</label>
                                <input type="text" id="empresa-cnpj" required>
                            </div>
                            <div class="input-item">
                                <label for="empresa-ie">Inscrição Estadual (IE)</label>
                                <input type="text" id="empresa-ie">
                            </div>
                        </div>
                    </div>
                    
                    <div class="config-section">
                        <h3>Endereço</h3>
                        <div class="input-grid form-full-width">
                            <div class="input-item required">
                                <label for="empresa-cep">CEP</label>
                                <input type="text" id="empresa-cep" required>
                            </div>
                            <div class="input-item required" style="grid-column: span 2;">
                                <label for="empresa-rua">Rua/Avenida</label>
                                <input type="text" id="empresa-rua" required>
                            </div>
                            <div class="input-item required">
                                <label for="empresa-numero">Número</label>
                                <input type="text" id="empresa-numero" required>
                            </div>
                            <div class="input-item">
                                <label for="empresa-bairro">Bairro</label>
                                <input type="text" id="empresa-bairro">
                            </div>
                            <div class="input-item required">
                                <label for="empresa-cidade">Cidade</label>
                                <input type="text" id="empresa-cidade" required>
                            </div>
                            <div class="input-item required">
                                <label for="empresa-uf">UF</label>
                                <select id="empresa-uf">
                                    <option value="">Selecione</option>
                                    <option value="SP">SP</option>
                                    <option value="MG">MG</option>
                                    <option value="RJ">RJ</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="config-section">
                        <h3>Certificado Digital</h3>
                        <div class="input-grid form-full-width">
                            <div class="input-item required" style="grid-column: span 2;">
                                <label for="empresa-certificado">Upload Certificado (.PFX/.P12)</label>
                                <input type="file" id="empresa-certificado" accept=".pfx,.p12" required>
                            </div>
                            <div class="input-item required">
                                <label for="empresa-senha-certificado">Senha do Certificado</label>
                                <input type="password" id="empresa-senha-certificado" required>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 30px; text-align: right;">
                        <button type="button" class="botao-secundario" id="cancelar-empresa">Cancelar</button>
                        <button type="submit" class="botao-principal" id="salvar-empresa">Salvar Empresa</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function setupCadastroEmpresa() {
    const modal = document.getElementById('cadastro-empresa-modal');
    const openModalBtn = document.getElementById('abrir-modal-cadastro-empresa');
    const closeModalBtn = document.getElementById('close-modal-empresa');
    const form = document.getElementById('form-cadastro-empresa');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            form.reset();
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            form.reset();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const razaoSocial = document.getElementById('empresa-razao').value.trim();
        const cnpj = document.getElementById('empresa-cnpj').value.trim();
        const cep = document.getElementById('empresa-cep').value.trim();
        const rua = document.getElementById('empresa-rua').value.trim();
        const numero = document.getElementById('empresa-numero').value.trim();
        const certificado = document.getElementById('empresa-certificado').files.length > 0;
        const senhaCertificado = document.getElementById('empresa-senha-certificado').value.trim();

        if (razaoSocial === '' || cnpj === '' || cep === '' || rua === '' || numero === '' || !certificado || senhaCertificado === '') {
            alert('Por favor, preencha todos os campos obrigatórios (incluindo o upload do Certificado Digital).');
            return;
        }

        addEmpresa(razaoSocial, cnpj);
        
        alert(`Empresa "${razaoSocial}" cadastrada com sucesso!`);
        modal.style.display = 'none';
        form.reset();
        loadPage('empresas');
    });
}

/* ========================================================= */
/* LÓGICA DE NAVEGAÇÃO E CARREGAMENTO DE PÁGINA */
/* ========================================================= */

// Função Principal de Carregamento de Página
function loadPage(pageName) {
    currentPage = pageName;
    const menuItems = document.querySelectorAll('#menu li');
    menuItems.forEach(item => item.classList.remove('active'));
    
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
        const integracoesAtivas = getIntegracoes().filter(i => i.tokenStatus === 'OK');
        const lojasAtivas = integracoesAtivas.map(i => i.descricao);
        // Filtra pedidos Padrão e FLEX para a tela principal (exclui FULL)
        const pedidosAtivos = getPedidos().filter(p => lojasAtivas.includes(p.loja) && p.tipo !== 'FULL');
        renderPedidosTable(pedidosAtivos, false);

    } else if (pageName === 'pedidos-full-ml') {
        renderPedidosFullML(); // Nova função para pedidos FULL

    } else if (pageName === 'integracoes') {
        const allIntegrations = getIntegracoes();
        renderIntegracoesTable(allIntegrations); 

    } else if (pageName === 'empresas') {
        const allEmpresas = getEmpresas();
        renderEmpresasTable(allEmpresas);

    } else if (pageName === 'inicio' || pageName === 'produtos' || pageName === 'anuncios' || pageName === 'notas-fiscais' || pageName === 'mensagens' || pageName === 'relatorios' || pageName === 'expedicao' || pageName === 'coleta' || pageName === 'plp' || pageName === 'configuracoes' || pageName === 'operador-logistico' || pageName === 'transportadoras') {
        
        const title = targetLink ? targetLink.textContent.trim() : pageName.charAt(0).toUpperCase() + pageName.slice(1);
        renderMaintenancePage(title);
        
    }
    
    // Configura a navegação interna das abas de tipo de pedido (Padrão, FLEX, FULL)
    document.querySelectorAll('.abas-tipo-pedido a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.currentTarget.getAttribute('data-page');
            if (targetPage) {
                // Remove o active de todos e adiciona no clicado
                document.querySelectorAll('.abas-tipo-pedido a').forEach(a => a.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Força o carregamento da página interna sem mudar o menu lateral
                if (targetPage === 'pedidos') {
                    const integracoesAtivas = getIntegracoes().filter(i => i.tokenStatus === 'OK');
                    const lojasAtivas = integracoesAtivas.map(i => i.descricao);
                    const pedidosAtivos = getPedidos().filter(p => lojasAtivas.includes(p.loja) && p.tipo !== 'FULL');
                    renderPedidosTable(pedidosAtivos, false);
                } else if (targetPage === 'pedidos-full-ml') {
                    renderPedidosFullML();
                } else {
                    // Simular carregamento de FLEX ou outras abas
                    const title = e.currentTarget.textContent.trim();
                    renderMaintenancePage(`Pedidos - ${title}`);
                }
            }
        });
    });
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
                // Garante que o menu lateral seja atualizado
                if (pageName === 'pedidos' || pageName === 'pedidos-full-ml') {
                     // Mantém 'pedidos' ativo na sidebar para ambas sub-páginas
                    const pedidosLink = document.querySelector('[data-page="pedidos"]');
                    if(pedidosLink) {
                        document.querySelectorAll('#menu li').forEach(li => li.classList.remove('active'));
                        pedidosLink.closest('li').classList.add('active');
                    }
                    if(parentMenu) parentMenu.classList.add('open');
                    
                    if(pageName === 'pedidos-full-ml') {
                        renderPedidosFullML();
                    } else {
                        loadPage(pageName);
                    }
                } else {
                    loadPage(pageName);
                }
            } else if (parentMenu) {
                parentMenu.classList.toggle('open');
            }
        }
    });

    // 2. Carrega a página inicial
    loadPage('pedidos'); 
});
