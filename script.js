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
        // --- LÓGICA DE CARREGAMENTO CORRIGIDA PARA INTEGRAÇÕES ---
        const allIntegrations = getIntegracoes();
        
        // Mock: filtra para mostrar apenas Shopee e a nova ML do dia, mais as em ERRO
        const filteredIntegrations = allIntegrations.filter(i => 
            (i.marketplace === 'Mercado Livre' && i.tokenStatus === 'OK' && i.creationDate === TODAY_DATE) ||
            (i.marketplace === 'Shopee') || 
            (i.marketplace === 'Mercado Livre' && i.tokenStatus === 'ERRO') ||
            (i.marketplace === 'Mercado Livre' && i.tokenStatus === 'OK' && i.creationDate !== TODAY_DATE) // Adiciona a Antiga OK
        );
        
        renderIntegracoesTable(filteredIntegrations); 
        setupCadastroIntegracao();
    } else if (pageName === 'empresas') {
        renderEmpresasTable(empresasMock);
    } else if (pageName === 'cadastrar-empresas') {
        setupCadastroEmpresasPage();
    }
}
