package com.seusistema.integracoes.model;

import java.time.LocalDateTime;

public class Empresa {

    // --- Dados da Empresa ---
    private Long id;
    private String cnpj;
    private String email;
    private String razaoSocial;
    private String nomeFantasia;
    private String telefone;
    private String inscricaoEstadual;
    private String tipoEmpresa; // Ex: "Varejo", "Atacado"
    private String crtEmpresa;  // Ex: "1 - Simples Nacional"
    private LocalDateTime vencimentoCertificado;
    
    // --- Nota Fiscal ---
    private Integer numeroNota;
    private String serieNota;
    private String modeloNota; // Padrão 55
    private String autorizados;
    private boolean contingenciaAtiva;

    // --- Endereço ---
    private String rua;
    private String bairro;
    private String cep;
    private String numero;
    private String complemento;
    private String cidade;
    private String estado;

    // --- Responsável Técnico (Opcional) ---
    private String cnpjTecnico;
    private String nomeTecnico;
    private String emailTecnico;
    private String telefoneTecnico;


    // Construtor Básico (Pode ser adaptado com campos obrigatórios)
    public Empresa() {
    }

    // Getters e Setters (Implementação omitida por brevidade, mas devem ser incluídos)
    // Exemplo:
    /*
    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }
    
    public String getRazaoSocial() {
        return razaoSocial;
    }
    
    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }
    
    // ... todos os outros Getters e Setters
    */
}
