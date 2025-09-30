// =========================================================
// CONFIGURAÇÕES GLOBAIS
// =========================================================
const OAUTH_URL = 'https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=2535848994116239&redirect_uri=https://jovanemartins-sis.github.io/sis/';
let authorizationSuccessMessage = null;

// Data de hoje (Hardcoded para simular a data atual no ambiente de teste)
const TODAY_DATE = '2025-09-30'; 
const YESTERDAY_DATE = '2025-09-29'; 

// Lista de pedidos ativos
let activePedidosData = [];


// =========================================================
// MOCK DE DADOS DO SISTEMA
// =========================================================

// MOCK DE EMPRESAS (Variável global para adicionar novas empresas)
const empresasMock = [
    { 
        id: '1933', 
        razaoSocial: 'L LOPES DE SOUZA', 
        cnpj: '20.748.410/0001-86', 
        vencimento: '26/03/2026',
        horaVencimento: '13:12'
    }
    // Novas empresas salvas serão adicionadas aqui
];


// MOCK DE INTEGRAÇÕES (DADOS PERSISTENTES)
const INITIAL_INTEGRATIONS_MOCK = [
    // 1. Loja Ativa
    { id: '62305', descricao: 'Shopee - Principal', marketplace: 'Shopee', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta', creationDate: YESTERDAY_DATE },
    // 2. Loja Inativa (Token ERRO)
    { id: '62306', descricao: 'Mercado Livre - Secundário', marketplace: 'Mercado Livre', idEmpresa: '1933', tokenStatus: 'ERRO', fluxo: 'Emitir Nota/Etiqueta', creationDate: TODAY_DATE },
    // 3. Loja Ativa
    { id: '62307', descricao: 'Mercado Livre - Antiga OK', marketplace: 'Mercado Livre', idEmpresa: '1933', tokenStatus: 'OK', fluxo: 'Emitir Nota/Etiqueta', creationDate: YESTERDAY_DATE }
];

// Funções de Gerenciamento de Integrações (usa localStorage para persistência simulada)
function getIntegracoes() {
    const saved = localStorage.getItem('sis_integracoes');
    if (saved) {
        return JSON.parse(saved);
    }
    saveIntegracoes(INITIAL_INTEGRATIONS_MOCK);
    return INITIAL_INTEGRATIONS_MOCK;
}

function saveIntegracoes(integracoes) {
    localStorage.setItem('sis_integracoes', JSON.stringify(integracoes));
}


// MOCK DE PEDIDOS (TODOS OS PEDIDOS POSSÍVEIS)
const pedidosMock = [
    { id: '56556090', idMp: '250927JGM6BK0R6', loja: 'Shopee - Principal', tipo: 'Padrão', status: 'PROCESSED', cliente: 'Viviane de L.A. Rosa', data: '26/09/2025', statusHub: 'Expedir', avisos: '', total: 'R$ 35,00' },
    { id: '56556100', idMp: '250927JGSVEGD', loja: 'Shopee - Principal', tipo: 'Padrão', status: 'PROCESSED', cliente: 'Pedro Santos', data: '26/09/2025', statusHub: 'Pendente', avisos: 'Caractere especial', total: 'R$ 55,00' },
    { id: '40123456', idMp: 'MLB19827364', loja: 'Mercado Livre - Antiga OK', tipo: 'FULL', status: 'delivered', cliente: 'Maria da Silva', data: '01/03/2024', statusHub: 'Completo', avisos: 'Nota emitida', total: 'R$ 150,00' },
    { id: '40123457', idMp: 'MLB19827365', loja: 'Mercado Livre - Secundário', tipo: 'Padrão', status: 'shipped', cliente: 'João Pereira', data: '15/05/2024', statusHub: 'Em separação', avisos: 'Produto esgotado', total: 'R$ 99,90' },
    { id: '56556018', idMp: '250927JGSVEGC', loja: 'SHEIN - Não Integrada', tipo: 'Padrão', status: 'to be collected by SHEIN', cliente: 'Josefa Madalena', data: '26/09/2025', statusHub: 'Expedir', avisos: '', total: 'R$ 22,48' },
    { id: '40123458', idMp: 'MLB19827366', loja: 'Shopee - Principal', tipo: 'Padrão', status: 'CANCELLED', cliente: 'Ana Santos', data: '20/08/2024', statusHub: 'Cancelado', avisos: 'Fraude detectada', total: 'R$ 75,00' },
    { id: '40123459', idMp: 'MLB19827367', loja: 'Mercado Livre - Antiga OK', tipo: 'Padrão', status: 'pending', cliente: 'Carlos Alberto', data: '10/09/2025', statusHub: 'Pendente', avisos: 'Aguardando pagamento', total: 'R$ 300,00' }
];

// Lógica de Filtragem (MOCK)
function getPedidosFromActiveIntegrations() {
    const allIntegrations = getIntegracoes();
    
    const activeStores = allIntegrations
        .filter(i => i.tokenStatus === 'OK')
        .map(i => i.descricao);

    const filteredPedidos = pedidosMock.filter(pedido => {
        return activeStores.includes(pedido.loja);
    });
    
    activePedidosData = filteredPedidos; 
    
    return filteredPedidos;
}

// =========================================================
// Conteúdo das Páginas (HTML em Strings)
// =========================================================

const pageContent = {
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
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-status">Status</label>
                <select id="filtro-status">
                    <option value="todos">Todos</option>
                    <option value="mlb-cancelado">MLB - Cancelado</option>
                    <option value="mlb-confirmado">MLB - Confirmado</option>
                    <option value="mlb-pago">MLB - Pago</option>
                </select>
            </div>
            <div class="filtro-item">
                <label for="filtro-status-hub">Status Hub</label>
                <select id="filtro-status-hub">
                    <option value="todos">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="expedir">Expedir</option>
                    <option value="em separação">Em separação</option>
                    <option value="completo">Completo</option>
                    <option value="cancelado">Cancelado</option>
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
    'integracoes': `
        <div class="header">
            <h2><span class="icon-asterisk"></span> Integrações</h2>
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
    'empresas': `
        <div class="header">
            <h2>Empresas</h2>
            <button class="botao-principal cadastrar-empresa">+ Cadastrar Empresa</button>
        </div>
        <div class="empresas-container">
            <div class="pagination-controls">
                <div class="pagination-nav">
                    <button class="page-arrow" disabled>&lt;</button>
                    <button class="page-number active">1</button>
                    <button class="page-arrow" disabled>&gt;</button>
                </div>
            </div>
            <div class="tabela-empresas-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Razão Social</th>
                            <th>CNPJ</th>
                            <th>Vencimento do Certificado</th>
                            <th>Mais Opções</th>
                        </tr>
                    </thead>
                    <tbody id="empresas-table-body">
                        </tbody>
                </table>
            </div>
        </div>
    `,
    'cadastrar-empresas': `
        <div class="header config-header">
            <h2>Cadastrar Empresas</h2>
            <button class="botao-principal salvar-cadastro-empresa">Salvar</button>
        </div>
        <div class="cadastro-empresas-form">
            
            <div class="config-section">
                <h3>Dados da Empresa</h3>
                <div class="input-grid form-full-width">
                    <div class="input-item required">
                        <label>CNPJ</label>
                        <input type="text" placeholder="" value="20748410000186">
                    </div>
                    <div class="input-item required">
                        <label>Email</label>
                        <input type="email" placeholder="" maxlength="30" value="compras@llopessouza.com">
                        <span class="char-count">0/30</span>
                    </div>
                    <div class="input-item required">
                        <label>Razão Social</label>
                        <input type="text" placeholder="" value="L LOPES DE SOUZA">
                    </div>
                    <div class="input-item">
                        <label>Nome Fantasia</label>
                        <input type="text" placeholder="" maxlength="25">
                        <span class="char-count">0/25</span>
                    </div>
                    <div class="input-item">
                        <label>Telefone</label>
                        <input type="tel" placeholder="">
                    </div>
                    <div class="input-item required">
                        <label>Inscrição Estadual</label>
                        <input type="text" placeholder="" value="0123456789">
                    </div>
                    <div class="input-item required">
                        <label>Tipo de Empresa</label>
                        <select><option>Selecione o tipo da empresa</option><option>Varejo</option><option selected>Atacado</option></select>
                    </div>
                    <div class="input-item required">
                        <label>CRT da Empresa</label>
                        <select><option>1 - Simples Nacional</option></select>
                    </div>
                </div>
            </div>

            <div class="config-section">
                <h3>Nota Fiscal</h3>
                <div class="input-grid form-full-width">
                    <div class="input-item required">
                        <label>Número da Nota</label>
                        <input type="text" placeholder="">
                    </div>
                    <div class="input-item required">
                        <label>Série</label>
                        <input type="text" placeholder="">
                    </div>
                    <div class="input-item required">
                        <label>Modelo</label>
                        <input type="text" placeholder="" value="55" readonly>
                    </div>
                    <div class="input-item">
                        <label>Autorizados</label>
                        <input type="text" placeholder="">
                    </div>
                    <div class="input-item toggle-item-no-label">
                        <label class="toggle-label-inline">Contingência</label>
                        <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                    </div>
                </div>
            </div>

            <div class="config-section">
                <h3>Endereço</h3>
                <div class="input-grid form-full-width">
                    <div class="input-item required">
                        <label>Rua</label>
                        <input type="text" placeholder="" maxlength="20">
                        <span class="char-count">0/20</span>
                    </div>
                    <div class="input-item required">
                        <label>Bairro</label>
                        <input type="text" placeholder="" maxlength="20">
                        <span class="char-count">0/20</span>
                    </div>
                    <div class="input-item required">
                        <label>CEP</label>
                        <input type="text" placeholder="">
                    </div>
                    <div class="input-item required">
                        <label>Número</label>
                        <input type="text" placeholder="">
                    </div>
                    <div class="input-item">
                        <label>Complemento</label>
                        <input type="text" placeholder="">
                    </div>
                     <div class="input-item required">
                        <label>Cidade</label>
                        <input type="text" placeholder="">
                    </div>
                    <div class="input-item required">
                        <label>Estado</label>
                        <select><option>Escolha o seu estado</option><option>SP</option><option>MG</option><option>RJ</option></select>
                    </div>
                </div>
            </div>

            <div class="config-section">
                <h3>Responsável Técnico</h3>
                <div class="input-grid form-full-width">
                    <div class="input-item">
                        <label>CNPJ</label>
                        <input type="text" placeholder="">
                    </div>
                    <div class="input-item">
                        <label>Nome</label>
                        <input type="text" placeholder="">
                    </div>
                    <div class="input-item">
                        <label>E-mail</label>
                        <input type="email" placeholder="">
                    </div>
                    <div class="input-item">
                        <label>Telefone</label>
                        <input type="tel" placeholder="">
                    </div>
                </div>
            </div>
            
        </div>
    `,
    'configuracao-integracao': (integracao) => `
        <div class="header config-header">
            <h2>${integracao.marketplace} - ${integracao.descricao}</h2>
            <button class="botao-principal salvar-config">Salvar</button>
        </div>
        
        <div class="config-section">
            <h3>Ativação</h3>
            <div class="toggle-group">
                <div class="toggle-item">
                    <label>Ativar Atribuição Padrão <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                </div>
                <div class="toggle-item">
                    <label>Considerar Volumes <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                </div>
                <div class="toggle-item">
                    <label>Cancelamento Automático <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                </div>
                <div class="toggle-item">
                    <label>Pedidos com Mensagem <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                </div>
                <div class="toggle-item">
                    <label>Pedidos Agendados <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                </div>
            </div>
            <div class="toggle-group second-row">
                 <div class="toggle-item">
                    <label>Importar Pedidos Flex <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                </div>
                <div class="toggle-item">
                    <label>Faturamento Flex <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                </div>
                 <div class="toggle-item">
                    <label>Importar Pedidos Full <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                </div>
                <div class="toggle-item">
                    <label>NFe CNPJ <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                </div>
                <div class="toggle-item">
                    <label>Realizar vínculo automático <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                </div>
            </div>
        </div>

        <div class="config-section">
            <h3>Geral</h3>
            <div class="input-grid">
                <div class="input-item">
                    <label>Fluxo de Pedidos</label>
                    <select><option>Emitir Nota/Etiqueta</option></select>
                </div>
                <div class="input-item">
                    <label>Vínculo de Empresas</label>
                    <select><option>L LOPES DE SOUZA</option></select>
                </div>
                <div class="input-item">
                    <label>Faturador Padrão</label>
                    <select><option>Expedy</option></select>
                </div>
                <div class="input-item">
                    <label>Descrição da Nota</label>
                    <select><option>Marketplace</option></select>
                </div>
                <div class="input-item">
                    <label>Código ERP</label>
                    <input type="text" placeholder="Código da empresa no ERP">
                </div>
            </div>
        </div>
        
        <div class="config-section">
            <h3>Logística (Etiquetas)</h3>
            <div class="input-grid">
                <div class="input-item">
                    <label>Operador Logístico</label>
                    <select><option>Selecione uma Transportadora</option></select>
                </div>
                <div class="input-item">
                    <label>Id Loja Bling</label>
                    <input type="text" placeholder="Id Loja Bling">
                </div>
            </div>
            
            <div class="input-grid etiquetas-details">
                <div class="input-item">
                    <label>Tipo de Etiqueta</label>
                    <select><option>Marketplace</option></select>
                </div>
                <div class="input-item">
                    <label>Layout de Etiqueta</label>
                    <select><option>Agregado</option></select>
                </div>
                 <div class="input-item">
                    <label>Descrição de etiqueta agregado</label>
                    <select><option>Completo</option></select>
                </div>
                <div class="input-item">
                    <label>Quantidade de linhas</label>
                    <select><option>2</option></select>
                </div>
                <div class="input-item">
                    <label>Tipo da Loja</label>
                    <select><option>CNPJ</option></select>
                </div>
            </div>
            <div class="toggle-group">
                <div class="toggle-item">
                    <label>Imprimir NFe ou Declaração <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
                </div>
                <div class="toggle-item">
                    <label>Usar declaração de conteúdo <span class="info-icon">?</span></label>
                    <label class="switch"><input type="checkbox"><span class="slider round"></span></label>
                </div>
            </div>
        </div>
    `,
    // Páginas com 'maintenance-message'
    'produtos': `<div class="header"><h2>Produtos</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'anuncios': `<div class="header"><h2>Anúncios</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'expedicao': `<div class="header"><h2>Expedição</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'coleta': `<div class="header"><h2>Conferência de Coleta</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'relatorios': `<div class="header"><h2>Relatórios</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'configuracoes': `<div class="header"><h2>Configurações</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'notas-fiscais': `<div class="header"><h2>Notas Fiscais</h2></div><div class="maintenance-message">Página em Manutenção</div>`,
    'mensagens': `<div class="header"><h2>Mensagens</div><div class="maintenance-message">Página em Manutenção</div>`,
    'plp': `<div class="header"><h2>PLP</div><div class="maintenance-message">Página em Manutenção</div>`,
    'operador-logistico': `<div class="header"><h2>Operador Logístico</div><div class="maintenance-message">Página em Manutenção</div>`,
    'transportadoras': `<div class="header"><h2>Transportadoras</div><div class="maintenance-message">Página em Manutenção</div>`,
    'inicio': `<div class="header"><h2>Início</h2></div><div class="maintenance-message">Página em Manutenção</div>`
};


// =========================================================
// Funções de Renderização e Lógica
// =========================================================

function renderEmpresasTable(empresas) {
    const tableBody = document.getElementById('empresas-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (empresas.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="no-results">Nenhuma empresa cadastrada.</td></tr>`;
        return;
    }

    empresas.forEach(empresa => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${empresa.id}</td>
            <td class="link-like">${empresa.razaoSocial}</td>
            <td>${empresa.cnpj}</td>
            <td>${empresa.vencimento}<br><span class="time-detail">${empresa.horaVencimento}</span></td>
            <td><button class="link-like">Configurar Certificado</button></td>
        `;
        tableBody.appendChild(row);
    });
    
    // Adiciona o listener para abrir a página de cadastro
    const cadastrarBtn = document.querySelector('.cadastrar-empresa');
    if (cadastrarBtn) {
        cadastrarBtn.addEventListener('click', () => {
            loadPage('cadastrar-empresas');
        });
    }
}

function renderIntegracoesTable(integracoes) {
    const tableBody = document.getElementById('integracoes-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (integracoes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="no-results">Nenhuma integração encontrada.</td></tr>`;
        return;
    }

    integracoes.forEach(integracao => {
        const marketplaceClass = integracao.marketplace.toLowerCase().replace(/ /g, '-');
        const tokenClass = integracao.tokenStatus.toLowerCase();

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="id-link" data-id="${integracao.id}">${integracao.id}</td>
            <td class="descricao-link" data-id="${integracao.id}">${integracao.descricao}</td>
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
    
    // Adiciona o listener para a página de configuração
    document.querySelectorAll('.id-link, .descricao-link').forEach(element => {
        element.addEventListener('click', (e) => {
            const integrationId = e.target.getAttribute('data-id');
            const integracao = getIntegracoes().find(i => i.id === integrationId);
            
            if (integracao) {
                loadConfigPage(integracao);
            }
        });
    });
}

function loadConfigPage(integracao) {
    const contentArea = document.getElementById('content');
    
    // Remove o destaque do menu lateral antes de carregar uma sub-página
    document.querySelectorAll('#sidebar li').forEach(li => li.classList.remove('active'));
    
    contentArea.innerHTML = pageContent['configuracao-integracao'](integracao);
    
    document.querySelector('.salvar-config').addEventListener('click', () => {
        alert(`Configurações para "${integracao.descricao}" salvas com sucesso (simulação)!`);
    });
    
    setupSidebarMenu();
}

function renderTable(pedidos) {
    const tableBody = document.getElementById('pedidos-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    if (pedidos.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="12" class="no-results">Nenhum pedido encontrado. Verifique se as integrações estão ativas.</td></tr>`;
        return;
    }

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
        btn.addEventListener('click', () => modal.style.display = 'flex');
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === modal) modal.style.display = 'none';
        });

        document.querySelectorAll('.marketplace-card').forEach(card => {
            if (!card.classList.contains('disabled') && !card.classList.contains('coming-soon')) {
                card.addEventListener('click', () => {
                    const name = card.getAttribute('data-marketplace'); 
                    if (name === 'Mercado Livre') {
                        modal.style.display = 'none'; 
                        // Redirecionamento simulado para o fluxo OAuth
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
    // Lógica simples de filtro mockada
    const lojaFilterValue = document.getElementById('filtro-loja').value.toLowerCase().replace('-principal', '').trim();
    const statusHubFilterValue = document.getElementById('filtro-status-hub').value.toLowerCase().trim();
    const idHubFilterValue = document.getElementById('filtro-id-hub').value.trim().toLowerCase();
    const clienteFilterValue = document.getElementById('filtro-cliente').value.trim().toLowerCase();
    

    const filteredPedidos = activePedidosData.filter(pedido => {
        
        if (lojaFilterValue !== 'todos' && !pedido.loja.toLowerCase().includes(lojaFilterValue)) return false;
        
        if (statusHubFilterValue !== 'todos' && pedido.statusHub.toLowerCase() !== statusHubFilterValue) return false;

        if (idHubFilterValue && pedido.id.toLowerCase().includes(idHubFilterValue) === false) return false;

        if (clienteFilterValue && pedido.cliente.toLowerCase().includes(clienteFilterValue) === false) return false;

        return true;
    });

    renderTable(filteredPedidos);
}

function setupFilterButtons() {
    const limparFiltroBtn = document.getElementById('limpar-filtro');
    const aplicarFiltroBtn = document.getElementById('aplicar-filtro');

    if (limparFiltroBtn) {
        limparFiltroBtn.addEventListener('click', () => {
            document.querySelectorAll('.filtros-container select, .filtros-container input').forEach(element => {
                if (element.type === 'checkbox') element.checked = false;
                else if (element.tagName === 'SELECT') element.value = 'todos'; 
                else element.value = ''; 
            });
            // Volta a renderizar todos os pedidos ativos
            renderTable(activePedidosData); 
        });
    }

    if (aplicarFiltroBtn) {
        aplicarFiltroBtn.addEventListener('click', filterPedidos);
    }
}

// =========================================================
// LÓGICA DE CADASTRO DE EMPRESAS (COM VALIDAÇÃO)
// =========================================================
function setupCadastroEmpresasPage() {
    const salvarBtn = document.querySelector('.salvar-cadastro-empresa');
    const formContainer = document.querySelector('.cadastro-empresas-form');

    if (salvarBtn && formContainer) {
        salvarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            let allValid = true;
            // Seleciona todos os campos de input e select que estão dentro de um item obrigatório
            const requiredFields = formContainer.querySelectorAll('.input-item.required input, .input-item.required select');
            
            // 1. Lógica de Validação
            requiredFields.forEach(field => {
                // Remove estilos de erro anteriores
                field.classList.remove('error');
                
                // Validação de preenchimento
                const isSelectDefault = field.tagName === 'SELECT' && (field.value.includes('Selecione') || field.value.includes('Escolha'));
                
                if (field.value.trim() === '' || isSelectDefault) {
                    field.classList.add('error'); // Adiciona a classe CSS de erro
                    allValid = false;
                }
            });

            if (!allValid) {
                alert("Por favor, preencha todos os campos obrigatórios (marcados em vermelho) antes de salvar.");
                return;
            }

            // 2. Simulação de Salvamento (se for válido)
            
            // Coleta de dados (Usando os seletores simples dos campos mockados como referência)
            const novaRazaoSocial = formContainer.querySelector('input[value="L LOPES DE SOUZA"]').value || "Nova Empresa Mock";
            const novoCnpj = formContainer.querySelector('input[value="20748410000186"]').value || "99.999.999/9999-99";

            // Simula a criação de um novo objeto de empresa
            const newEmpresa = {
                id: (Math.floor(Math.random() * 9000) + 2000).toString(), // Novo ID mock
                razaoSocial: novaRazaoSocial,
                cnpj: novoCnpj,
                vencimento: '30/09/2026',
                horaVencimento: '10:00'
            };

            // Adiciona a nova empresa ao mock de dados GLOBAL
            empresasMock.push(newEmpresa);

            alert(`Empresa "${newEmpresa.razaoSocial}" cadastrada e salva com sucesso (ID: ${newEmpresa.id})!`);
            
            // Volta para a página de listagem de empresas, que agora terá o novo registro
            loadPage('empresas');
        });
    }
}


function loadPage(pageName) {
    const contentArea = document.getElementById('content');
    let pageHtml = pageContent[pageName];

    // Lógica para marcar o item do menu como ativo e abrir o menu pai (Integrações)
    document.querySelectorAll('#sidebar li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.parent-menu').forEach(p => p.classList.remove('open'));
    
    const activeLink = document.querySelector(`a[data-page="${pageName}"]`);
    if (activeLink) {
        // Marca o <li> que contém o link como ativo
        activeLink.closest('li').classList.add('active');
        
        // Abre o menu pai, se existir (aplica a classe 'open' ao .parent-menu)
        const parentMenu = activeLink.closest('.parent-menu');
        if (parentMenu) {
            parentMenu.classList.add('open');
            // Remove a classe 'active' do link pai se for apenas um header de submenu
            parentMenu.querySelector('a').closest('li').classList.remove('active');
        }
    }


    if (pageName === 'integracoes' && authorizationSuccessMessage) {
        // Exibe o banner de sucesso após o retorno do OAuth
        const successHtml = `<div class="success-banner"><span class="icon-check">✓</span> ${authorizationSuccessMessage}</div>`;
        pageHtml = successHtml + pageContent[pageName]; // Concatena o banner com o conteúdo da página
        authorizationSuccessMessage = null; 
    }

    if (typeof pageHtml === 'function') {
        contentArea.innerHTML = `<div class="maintenance-message">Erro: A página de configuração deve ser carregada via link.</div>`;
        return;
    }
    
    contentArea.innerHTML = pageHtml;
    
    // Chamadas de funções específicas para a página carregada
    if (pageName === 'pedidos') {
        renderTable(getPedidosFromActiveIntegrations()); 
        setupFilterButtons();
    } else if (pageName === 'integracoes') {
        const allIntegrations = getIntegracoes();
        
        // Mock: filtra para mostrar apenas Shopee, a nova ML do dia, a antiga OK e as em ERRO
        const filteredIntegrations = allIntegrations.filter(i => 
            (i.marketplace === 'Mercado Livre' && i.tokenStatus === 'OK' && i.creationDate === TODAY_DATE) ||
            (i.marketplace === 'Shopee') || 
            (i.marketplace === 'Mercado Livre' && i.tokenStatus === 'ERRO') ||
            (i.marketplace === 'Mercado Livre' && i.tokenStatus === 'OK' && i.creationDate !== TODAY_DATE)
        );
        
        renderIntegracoesTable(filteredIntegrations); 
        setupCadastroIntegracao();
    } else if (pageName === 'empresas') {
        renderEmpresasTable(empresasMock);
    } else if (pageName === 'cadastrar-empresas') {
        setupCadastroEmpresasPage();
    }
}

function setupSidebarMenu() {
    // Adiciona o comportamento de clique para o menu pai (Parent Menu)
    document.querySelectorAll('.parent-menu > a').forEach(link => {
        link.addEventListener('click', (e) => {
            const parentLi = link.closest('.parent-menu');
            const wasOpen = parentLi.classList.contains('open');
            
            // Fecha todos os menus pais
            document.querySelectorAll('.parent-menu').forEach(p => {
                if (p !== parentLi) {
                    p.classList.remove('open');
                }
            });
            
            // Abre/fecha o menu clicado
            if (!wasOpen) {
                parentLi.classList.add('open');
            } else {
                parentLi.classList.remove('open');
            }
            
            e.preventDefault();
        });
    });

    // Adiciona o comportamento de clique para todos os links do menu lateral
    document.querySelectorAll('#sidebar a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.getAttribute('data-page');
            
            if (pageName !== 'configuracao-integracao') {
               loadPage(pageName);
            }
        });
    });
}


// =========================================================
// FUNÇÃO DE INICIALIZAÇÃO (GARANTE O CARREGAMENTO)
// =========================================================

function startApp() {
    const urlParams = new URLSearchParams(window.location.search);
    let pageToLoad = 'pedidos'; 

    // Lógica para simular o retorno do OAuth (Integração de Marketplace)
    if (urlParams.has('code')) {
        let integracoesAtuais = getIntegracoes();
        
        // Simulação de criação de uma nova integração após o OAuth
        integracoesAtuais.push({
            id: (Math.floor(Math.random() * 90000) + 10000).toString(), 
            descricao: 'Mercado Livre - Nova Loja de Hoje', 
            marketplace: 'Mercado Livre',
            idEmpresa: empresasMock[0].id, 
            tokenStatus: 'OK', 
            fluxo: 'Emitir Nota/Etiqueta',
            creationDate: TODAY_DATE
        });

        // Adiciona um pedido mock para a loja recém-criada
        pedidosMock.push({
            id: (Math.floor(Math.random() * 90000) + 57000000).toString(),
            idMp: 'NEWLY-' + (Math.floor(Math.random() * 900000) + 100000),
            loja: 'Mercado Livre - Nova Loja de Hoje', 
            tipo: 'Padrão', 
            status: 'NEW', 
            cliente: 'Cliente Novo da Integração', 
            data: TODAY_DATE.split('-').reverse().join('/'), 
            statusHub: 'Expedir', 
            avisos: 'Novo da integração', 
            total: 'R$ 88,88' 
        });


        saveIntegracoes(integracoesAtuais);
        authorizationSuccessMessage = `Integração com Mercado Livre concluída! A nova loja foi salva e agora é exibida na tabela.`;
        pageToLoad = 'integracoes'; 

        // Limpa a URL para remover o parâmetro 'code'
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: newUrl}, '', newUrl);

    } else if (urlParams.has('error')) {
        authorizationSuccessMessage = "Erro na integração com o Mercado Livre. Por favor, tente novamente.";
        pageToLoad = 'integracoes';
        
        // Limpa a URL para remover o parâmetro 'error'
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: newUrl}, '', newUrl);
    }


    loadPage(pageToLoad);
    setupSidebarMenu();
}

// Inicialização principal - Garante que a função é chamada
if (document.readyState === 'loading') { 
    // Se ainda está carregando, espera pelo evento DOMContentLoaded
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    // Se já carregou ('interactive' ou 'complete'), executa a função imediatamente
    startApp();
}

// Fim do script.js
