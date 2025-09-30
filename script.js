function setupCadastroEmpresasPage() {
    // Simula a lógica de salvar o cadastro da empresa
    const salvarBtn = document.querySelector('.salvar-cadastro-empresa');
    const formContainer = document.querySelector('.cadastro-empresas-form');

    if (salvarBtn && formContainer) {
        salvarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            let allValid = true;
            const requiredFields = formContainer.querySelectorAll('.input-item.required input, .input-item.required select');
            
            // 1. Lógica de Validação
            requiredFields.forEach(field => {
                // Remove estilos de erro anteriores
                field.style.border = '1px solid #ccc'; 
                
                // Validação de preenchimento
                if (field.value.trim() === '' || field.value.includes('Selecione') || field.value.includes('Escolha')) {
                    field.style.border = '2px solid #e74c3c'; // Destaca o campo com erro
                    allValid = false;
                }
            });

            if (!allValid) {
                alert("Por favor, preencha todos os campos obrigatórios (marcados em vermelho) antes de salvar.");
                return;
            }

            // 2. Simulação de Salvamento (se for válido)
            
            // Simulação de coleta de dados
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

            // Adiciona a nova empresa ao mock de dados
            empresasMock.push(newEmpresa);

            alert(`Empresa "${newEmpresa.razaoSocial}" cadastrada e salva com sucesso (ID: ${newEmpresa.id})!`);
            
            // Volta para a página de listagem de empresas
            loadPage('empresas');
        });
    }
}
