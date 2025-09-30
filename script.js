// =========================================================
// NOVO CÓDIGO para a função de inicialização no script.js
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    let pageToLoad = 'pedidos'; // Página padrão

    // 1. LÓGICA CRÍTICA: Verifica se o Mercado Livre nos enviou o 'code'
    if (urlParams.has('code')) {
        const authorizationCode = urlParams.get('code');
        
        // Exibe o código no console (para fins de depuração)
        console.log("SUCESSO: Código de Autorização Recebido:", authorizationCode); 
        
        // MENSAGEM VISUAL DE SUCESSO
        alert(`Integração com Mercado Livre concluída com sucesso (fase 1)! \n\nCódigo de Autorização recebido: ${authorizationCode}\n\nO próximo passo (troca de token) requer um servidor backend seguro.`);
        
        pageToLoad = 'integracoes'; // Volta para a página de integrações
        
        // Limpa o URL no navegador para remover o parâmetro 'code'
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: newUrl}, '', newUrl);

    } else if (urlParams.has('error')) {
        // Se houver algum erro de autorização do Mercado Livre
        console.error("Erro de Autorização do Mercado Livre:", urlParams.get('error_description'));
        alert("Erro na integração com o Mercado Livre. Veja o console para detalhes.");
        pageToLoad = 'integracoes';
    }


    // 2. Carrega a página inicial ou a página de integrações após o retorno do ML
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
