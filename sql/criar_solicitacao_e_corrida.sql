-- Função para criar uma solicitação e corrida num único procedimento
CREATE OR REPLACE FUNCTION criar_solicitacao_e_corrida(
    p_cliente_nome TEXT,
    p_cliente_contato TEXT,
    p_endereco_origem TEXT,
    p_endereco_destino TEXT,
    p_descricao TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_solicitacao_id UUID;
    v_corrida_id UUID;
    v_result JSONB;
BEGIN
    -- Inserir a solicitação
    INSERT INTO solicitacoes (
        cliente_nome,
        cliente_contato,
        endereco_origem,
        endereco_destino,
        descricao,
        status
    ) VALUES (
        p_cliente_nome,
        p_cliente_contato,
        p_endereco_origem,
        p_endereco_destino,
        p_descricao,
        'pendente'
    )
    RETURNING id INTO v_solicitacao_id;
    
    -- Inserir a corrida relacionada
    INSERT INTO corridas (
        solicitacao_id,
        status
    ) VALUES (
        v_solicitacao_id,
        'pendente'
    )
    RETURNING id INTO v_corrida_id;
    
    -- Montar o resultado
    SELECT jsonb_build_object(
        'id', c.id,
        'solicitacao_id', c.solicitacao_id,
        'status', c.status,
        'created_at', c.created_at,
        'solicitacao', jsonb_build_object(
            'id', s.id,
            'cliente_nome', s.cliente_nome,
            'cliente_contato', s.cliente_contato,
            'endereco_origem', s.endereco_origem,
            'endereco_destino', s.endereco_destino,
            'descricao', s.descricao,
            'status', s.status
        )
    )
    INTO v_result
    FROM corridas c
    JOIN solicitacoes s ON c.solicitacao_id = s.id
    WHERE c.id = v_corrida_id;
    
    RETURN v_result;
END;
$$;
