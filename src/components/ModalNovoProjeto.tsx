import { useState } from 'react';
import Modal from './ModalInsert';

    export default function ModalNovoProjeto({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [projetoNome, setProjetoNome] = useState('');
    const [projetoDescricao, setProjetoDescricao] = useState('');
    const [projetoDataInicio, setProjetoDataInicio] = useState('');
    const [projetoDataFim, setProjetoDataFim] = useState('');
    const [modalMessage, setModalMessage] = useState<string | any>(null);

    const handleSubmit = async () => {
        if (!projetoNome || !projetoDataInicio || !projetoDataFim) {
        setModalMessage('Preencha todos os campos obrigatórios: "Nome", "Data de Início" e "Data de Fim".');
        return;
        }

        try {
        const table = 'tarefas_projetos';
        const columns = ['projeto_nome', 'projeto_descricao', 'projeto_data_inicio', 'projeto_data_fim'];
        const values = [projetoNome, projetoDescricao, projetoDataInicio, projetoDataFim];

        const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });

        if (result.success) {
            setModalMessage('Projeto criado com sucesso!');
            setProjetoNome('');
            setProjetoDescricao('');
            setProjetoDataInicio('');
            setProjetoDataFim('');
        } else {
            setModalMessage(`Erro ao adicionar projeto: ${result.message}`);
        }
        } catch (error) {
        console.error('Erro ao adicionar projeto:', error);
        setModalMessage('Erro ao adicionar projeto.');
        }
    };
    null
    const fields = [
        { label: 'Nome do Projeto', type: 'text', value: projetoNome, setValue: setProjetoNome },
        { label: 'Descrição', type: 'textarea', value: projetoDescricao, setValue: setProjetoDescricao },
        { label: 'Data de Início', type: 'date', value: projetoDataInicio, setValue: setProjetoDataInicio },
        { label: 'Data de Fim', type: 'date', value: projetoDataFim, setValue: setProjetoDataFim },
    ];

    return <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Projeto" fields={fields} onSubmit={handleSubmit} submitText="Criar Projeto" modalMessage={modalMessage} />;
}
