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
