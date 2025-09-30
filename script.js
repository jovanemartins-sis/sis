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
    // Garante que o item adicionado hoje permaneça mesmo se "ERRO" ou "OK"
    const today = new Date().toISOString().slice(0, 10);
    integracoes = integracoes.map(i => {
        if (i.creationDate === today && i.tokenStatus !== 'ERRO') {
            i.tokenStatus = 'OK'; // Mantém o status "OK" para itens novos salvos hoje
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
        tokenStatus: 'OK', // Simula que o token foi gerado com sucesso
        fluxo: 'Emitir Nota/Etiqueta',
        creationDate: today
    };

    integracoes.push(newIntegracao);
    saveIntegracoes(integracoes);
    addMockPedidos(descricao); // Adiciona um pedido para a nova integração
    return newIntegracao;
}

function getPedidos() {
    const defaultPedidos = [
        { id: '56556090', idMp: '250927JGM6BK0R6', loja: 'Shopee - Principal', tipo: 'Padrão', status: 'PROCESSED', cliente: 'Viviane de L.A. Rosa', data: '26/09/2025', statusHub: 'Expedir', avisos: '', total: 'R$ 35,00' },
        { id: '56556100', idMp: '250927JGSVEGD', loja: 'Shopee - Principal', tipo: 'Padrão', status: 'PROCESSED', cliente: 'Pedro Santos', data: '26/09/2025', statusHub: 'Pendente', avisos: 'Caractere especial', total: 'R$ 55,00' },
        { id: '40123456', idMp: 'MLB19827364', loja: 'Mercado Livre - Antiga OK', tipo: 'FULL', status: 'delivered', cliente: 'Maria da Silva', data: '01/03/2024', statusHub: 'Completo', avisos: 'Nota emitida', total: 'R$ 150,00' },
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
        data: new Date().toLocaleDateString('pt-BR'),
        statusHub: 'Expedir',
        avisos: 'Pedido da nova integração!',
        total: 'R$ 150,00'
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
        // Mock de dados para os novos campos
        vencimentoCertificado: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('pt-BR'),
        horaVencimento: '12:00'
    };
    empresas.push(novaEmpresa);
    saveEmpresas(empresas);
}


/* ========================================================= */
/* FUNÇÕES DE RENDERIZAÇÃO DE PÁGINAS */
/* ========================================================= */

// 1. Renderiza a Tabela de Pedidos
function renderPedidosTable(pedidos) {
    const content = document.getElementById('content');
    let tableHtml = `
        <div class="header">
            <h2>Pedidos</h2>
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

        <div class="filtros-container">
            <div class="filtro-item">
                <label for="filtro-id">ID Externo</label>
                <input type="text" id="filtro-id" placeholder="Ex: MLB12345678">
            </div>
            <div class="filtro-item">
                <label for="filtro-loja">Loja</label>
                <select id="filtro-loja">
                    <option value="">Todas</option>
                    <option value="Shopee - Principal">Shopee - Principal</option>
                    <option value="Mercado Livre - Antiga OK">Mercado Livre - Antiga OK</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-status">Status HUB</label>
                <select id="filtro-status">
                    <option value="">Todos</option>
                    <option value="Expedir">Expedir</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Em separação">Em Separação</option>
                    <option value="Completo">Completo</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-tipo">Tipo</label>
                <select id="filtro-tipo">
                    <option value="">Todos</option>
                    <option value="Padrão">Padrão</option>
                    <option value="FULL">FULL (Fulfillment)</option>
                    <option value="FLEX">FLEX</option>
                </select>
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
                <label class="toggle-label-inline">
                    Exibir Pedidos com Erro 
                    <span class="material-symbols-outlined info-icon" title="Exibe pedidos que possuem erros ou avisos na importação.">info</span>
                </label>
                <label class="switch">
                    <input type="checkbox" id="filtro-com-erro">
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
        <div class="botoes-filtro">
            <button class="botao-principal" id="aplicar-filtros">Aplicar Filtros</button>
            <button class="botao-secundario" id="limpar-filtros">Limpar Filtros</button>
        </div>

        <div class="abas-container">
            <button class="tab-button active">Abertos</button>
            <button class="tab-button">Completos</button>
            <button class="tab-button">Cancelados</button>
        </div>
        
        <div class="tabela-pedidos-container">
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox" id="select-all-pedidos"></th>
                        <th>ID Pedido</th>
                        <th>Loja</th>
                        <th>Status MP</th>
                        <th>Cliente</th>
                        <th>Data Venda</th>
                        <th>Status HUB</th>
                        <th>Avisos</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (pedidos.length === 0) {
        tableHtml += `<tr><td colspan="9" class="no-results">Nenhum pedido encontrado com os filtros aplicados.</td></tr>`;
    } else {
        pedidos.forEach(p => {
            const statusHubClass = `status-hub-${p.statusHub.toLowerCase().replace(/ /g, '-')}`;
            tableHtml += `
                <tr>
                    <td><input type="checkbox" class="select-pedido"></td>
                    <td class="id-link">${p.idMp}</td>
                    <td>${p.loja}</td>
                    <td>${p.status}</td>
                    <td>${p.cliente}</td>
                    <td>${p.data}</td>
                    <td><span class="${statusHubClass}">${p.statusHub}</span></td>
                    <td>${p.avisos}</td>
                    <td>${p.total}</td>
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
}

// 2. Renderiza a Tabela de Integrações
function renderIntegracoesTable(integracoes) {
    const content = document.getElementById('content');
    
    let successBanner = '';
    if (authorizationSuccessMessage) {
        successBanner = `<div class="success-banner"><span class="material-icons-outlined icon-check">check_circle</span>${authorizationSuccessMessage}</div>`;
        authorizationSuccessMessage = ''; // Limpa a mensagem após exibir
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
    content.insertAdjacentHTML('beforeend', getModalCadastroHtml()); // Adiciona o modal no final do conteúdo
    setupCadastroIntegracao(); // Configura a lógica de abertura/fechamento e salvamento
}

// 3. Renderiza a Tabela de Empresas
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


// 4. Renderiza a página de Manutenção (Outras)
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

/* ========================================================= */
/* MODAL E LÓGICA DE CADASTRO DE INTEGRAÇÃO */
/* ========================================================= */

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
    // Captura o botão dentro do modal.
    let salvarShopeeBtn = document.getElementById('salvar-shopee'); 

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            // Preenche as opções de empresa no select
            const selectEmpresa = document.getElementById('shopee-empresa-vinculo');
            selectEmpresa.innerHTML = '<option value="">Selecione uma Empresa</option>';
            getEmpresas().forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.razaoSocial;
                selectEmpresa.appendChild(option);
            });
            shopeeForm.style.display = 'none'; // Esconde o form da Shopee ao abrir
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Lógica para mostrar o formulário específico
    marketplaces.forEach(card => {
        card.addEventListener('click', (e) => {
            if (card.classList.contains('coming-soon')) return;

            const mp = card.getAttribute('data-mp');
            if (mp === 'shopee') {
                shopeeForm.style.display = 'block';
            } else if (mp === 'mercado-livre') {
                // Simulação de autorização via pop-up
                alert('Simulando o redirecionamento para o login do Mercado Livre...');
                // Simula sucesso após 1 segundo
                setTimeout(() => {
                    addIntegracao('Mercado Livre - Nova Loja', 'Mercado Livre', '1933');
                    modal.style.display = 'none';
                    authorizationSuccessMessage = 'Integração com Mercado Livre concluída com sucesso!';
                    loadPage('integracoes');
                }, 1000);
            }
        });
    });
    
    // Lógica para cancelar o form da Shopee
    if (cancelarShopeeBtn) {
        cancelarShopeeBtn.addEventListener('click', () => {
            shopeeForm.style.display = 'none';
        });
    }

    // =======================================================
    // LÓGICA DE SALVAMENTO DA SHOPEE
    // =======================================================
    if (salvarShopeeBtn) {
        // Remove qualquer listener anterior para evitar duplicidade
        const newSalvarShopeeBtn = salvarShopeeBtn.cloneNode(true);
        salvarShopeeBtn.parentNode.replaceChild(newSalvarShopeeBtn, salvarShopeeBtn);
        salvarShopeeBtn = newSalvarShopeeBtn; 
        
        salvarShopeeBtn.addEventListener('click', () => {
            
            // 1. Coleta de Dados
            const descricao = document.getElementById('shopee-descricao').value.trim();
            const partnerId = document.getElementById('shopee-partner-id').value.trim();
            const partnerKey = document.getElementById('shopee-partner-key').value.trim(); 
            const empresaId = document.getElementById('shopee-empresa-vinculo').value;
            
            // 2. Validação
            if (descricao === '' || partnerId === '' || partnerKey === '' || empresaId === '') {
                alert('Por favor, preencha todos os campos obrigatórios para a integração Shopee.');
                return;
            }

            // 3. Simula o Salvamento
            addIntegracao(descricao, 'Shopee', empresaId);
            
            // 4. Feedback e Recarregamento
            document.getElementById('shopee-form').style.display = 'none';
            modal.style.display = 'none';
            authorizationSuccessMessage = `Integração com Shopee ("${descricao}") salva com sucesso. Parceiro ID: ${partnerId}`;
            
            loadPage('integracoes'); 
        });
    }
}

/* ========================================================= */
/* MODAL E LÓGICA DE CADASTRO DE EMPRESAS */
/* ========================================================= */

// HTML do Modal de Cadastro de Empresa (COMPLETO)
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

// Lógica de abertura/fechamento e salvamento de empresa
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
    
    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            form.reset();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulação de coleta de dados de todos os campos
        const razaoSocial = document.getElementById('empresa-razao').value.trim();
        const cnpj = document.getElementById('empresa-cnpj').value.trim();
        const cep = document.getElementById('empresa-cep').value.trim();
        const rua = document.getElementById('empresa-rua').value.trim();
        const numero = document.getElementById('empresa-numero').value.trim();
        const certificado = document.getElementById('empresa-certificado').files.length > 0;
        const senhaCertificado = document.getElementById('empresa-senha-certificado').value.trim();

        // Validação básica (CNPJ, Razão Social, Rua e Número, Certificado/Senha)
        if (razaoSocial === '' || cnpj === '' || cep === '' || rua === '' || numero === '' || !certificado || senhaCertificado === '') {
            alert('Por favor, preencha todos os campos obrigatórios (incluindo o upload do Certificado Digital).');
            return;
        }

        // Lógica de Salvamento: Apenas salva o básico (Razão Social e CNPJ) na mock database
        addEmpresa(razaoSocial, cnpj);
        
        // Feedback e fechamento
        alert(`Empresa "${razaoSocial}" cadastrada com sucesso!`);
        modal.style.display = 'none';
        form.reset();
        loadPage('empresas'); // Recarrega a página de empresas para mostrar o novo item
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
        // Abre o submenu pai, se houver
        const parentMenu = targetLink.closest('.parent-menu');
        if (parentMenu) {
            parentMenu.classList.add('open');
        }
    }

    // Lógica de Carregamento
    if (pageName === 'pedidos') {
        // Apenas integrações com token OK
        const integracoesAtivas = getIntegracoes().filter(i => i.tokenStatus === 'OK');
        const lojasAtivas = integracoesAtivas.map(i => i.descricao);
        
        // Filtra pedidos para mostrar apenas os de lojas ativas
        const pedidosAtivos = getPedidos().filter(p => lojasAtivas.includes(p.loja));
        renderPedidosTable(pedidosAtivos);

    } else if (pageName === 'integracoes') {
        // Mostra todas as integrações cadastradas.
        const allIntegrations = getIntegracoes();
        renderIntegracoesTable(allIntegrations); 

    } else if (pageName === 'empresas') {
        const allEmpresas = getEmpresas();
        renderEmpresasTable(allEmpresas);

    } else if (pageName === 'inicio' || pageName === 'produtos' || pageName === 'anuncios' || pageName === 'notas-fiscais' || pageName === 'mensagens' || pageName === 'relatorios' || pageName === 'expedicao' || pageName === 'coleta' || pageName === 'plp' || pageName === 'configuracoes' || pageName === 'operador-logistico' || pageName === 'transportadoras') {
        
        // Converte para um título amigável (ex: 'notas-fiscais' -> 'Notas Fiscais')
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
                // Alterna o estado do submenu
                parentMenu.classList.toggle('open');
            }
        }
    });

    // 2. Carrega a página inicial
    loadPage('pedidos'); 
});
