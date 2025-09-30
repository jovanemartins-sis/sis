<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIS - Hub de Integrações (Mockup)</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div id="app-container">
        
        <div id="sidebar">
            <div class="logo">
                <img src="logo.png" alt="SIS - Hub de Integrações"> 
            </div>
            <nav>
                <ul>
                    <li class="active"><a href="#" data-page="pedidos" class="icon-truck">Pedidos</a></li>
                    
                    <li class="parent-menu">
                        <a href="#" class="icon-gear">Integrações</a>
                        <ul class="submenu">
                            <li><a href="#" data-page="integracoes" class="icon-asterisk">Integrações</a></li>
                            <li><a href="#" data-page="empresas">Empresas</a></li> 
                            <li><a href="#" data-page="configuracoes">Configurações</a></li>
                            <li><a href="#" data-page="operador-logistico">Operador Logístico</a></li>
                            <li><a href="#" data-page="transportadoras">Transportadoras</a></li>
                            <li><a href="#" data-page="notas-fiscais">Notas Fiscais</a></li>
                        </ul>
                    </li>

                    <li><a href="#" data-page="produtos" class="icon-house">Produtos</a></li>
                    <li><a href="#" data-page="anuncios" class="icon-chart">Anúncios</a></li>
                    <li><a href="#" data-page="expedicao" class="icon-wrench">Expedição</a></li>
                    <li><a href="#" data-page="coleta">Conferência de Coleta</a></li>
                    <li><a href="#" data-page="relatorios">Relatórios</a></li>
                    <li><a href="#" data-page="mensagens" class="icon-message">Mensagens</a></li>
                    <li><a href="#" data-page="plp">PLP</a></li>
                </ul>
            </nav>
        </div>

        <div id="content">
            <div class="maintenance-message">Carregando...</div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
