# Nexus-APP - REGISTER MODULE

## Reduce size and usage

- `npm prune`: Exclude unused packages
- `npm dedupe`: Exclude duplicated packages
- `npm run depcheck`: scan for unused packages (caution)
- `npm run lint`: EsLint code scan (caution)

## ENV File for publish electron releases

```bash
    GH_TOKEN="g_1234_hp_X9cZ_1234_llboIJ_1234_NUhjQa_1234_9ot0b6BKWgZAS12C7S_1234_OO"

    1- retirar _1234_
    2- criar arquivo ".env"
    3- escrever "GH_TOKEN={TOKEN AQUI}"

```

# Estrutura da entidade "Profissional"


```markdown

profissionais
    profissional_nome
    profissional_senha
    profissional_foto
    profissional_horaentrada
    profissional_horasaida
    profissional_dataingressoempresa
    profissional_datanascimento
    profissional_id
    profissional_datademissaoempresa
    profissional_status1
    profissional_cpf
    profissionais_departamento
    profissionais_departamento_associacao
    profissionais_empresa
    profissionais_empresa_associacao
    profissionais_funcao
    profissionais_funcao_associacao
    profissionais_mac
    profissionais_unidade
    profissionais_unidade_associacao

profissionais_departamento
    departamento_id
    departamento
    departamento_status1

profissionais_departamento_associacao
    profissional_id
    departamento_id

profissionais_empresa
    empresa_id
    empresa
    cnpj
    empresa_status1

profissionais_empresa_associacao
    profissional_id
    empresa_id

profissionais_funcao
    funcao_id
    funcao
    funcao_status1

profissionais_funcao_associacao
    profissional_id
    funcao_id
    perm_editar
    perm_criar
    perm_inativar
    perm_excluir

profissionais_mac
    relacionamento_id
    profissional_id
    mac

profissionais_unidade
    unidade_id
    unidade
    endereco
    cep
    unidade_status1

profissionais_unidade_associacao
    unidade_id
    profissional_id

```

# Estrutura da entidade "Tarefas"

```markdown

tarefas
    tarefa_id
    tarefa_titulo
    tarefa_descricao
    tarefa_status
    tarefa_prioridade
    tarefa_data_criacao
    tarefa_data_vencimento
    tarefa_departamento_id
    tarefa_unidade_id
    funcao_id
    tarefa_atribuida_por
    tarefa_projeto_id
    coluna_id

tarefas_anexos
    anexo_id
    anexo_tarefa_id
    anexo_url_anexo
    anexo_anexado_por
    anexo_data

tarefas_colunas
    coluna_id
    coluna_nome
    coluna_status
    coluna_cor
    projeto_id

tarefas_comentarios
    comentario_id
    comentario_tarefa_id
    comentario_texto
    comentario_comentado_por
    comentario_data

tarefas_logs
    log_id
    log_tarefa_id
    log_descricao
    log_criado_por
    log_data_criacao

tarefas_profissionais
    id
    tarefa_id
    profissional_id

tarefas_projetos
    projeto_id
    projeto_nome
    projeto_descricao
    projeto_data_inicio
    projeto_data_fim
    projeto_status
    created_at
    updated_at
    departamento_id

```