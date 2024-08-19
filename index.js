import { View, Button, StyleSheet, TextInput, Alert, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { usarBD } from './hooks/usarBD';
import { Produto } from './components/produto';

export function Index() {
    const [id, setId] = useState(''); // ID do produto selecionado para edição
    const [nome, setNome] = useState(''); // Nome do produto
    const [quantidade, setQuantidade] = useState(''); // Quantidade do produto
    const [pesquisa, setPesquisa] = useState(''); // Termo de pesquisa
    const [produtos, setProdutos] = useState([]); // Lista de produtos
    const [focusedInput, setFocusedInput] = useState(null); // Input focado

    const produtosBD = usarBD();

    // Função para criar ou atualizar um produto
    async function createOrUpdate() {
        if (isNaN(quantidade)) {
            return Alert.alert('Quantidade', 'A quantidade precisa ser um número!');
        }

        try {
            if (id) {
                // Atualiza o produto existente
                await produtosBD.update({ id, nome, quantidade });
                Alert.alert('Produto atualizado com sucesso!');
                setId(''); // Limpa o ID após a atualização
            } else {
                // Cria um novo produto
                const item = await produtosBD.create({ nome, quantidade });
                Alert.alert('Produto cadastrado com o ID: ' + item.idProduto);
            }
            // Limpa os campos e a pesquisa
            setNome('');
            setQuantidade('');
            setPesquisa('');
            listar(); // Atualiza a lista de produtos
        } catch (error) {
            console.log('Erro ao salvar o produto:', error);
            Alert.alert('Erro', 'Não foi possível salvar o produto.');
        }
    }

    // Função para listar os produtos
    async function listar() {
        try {
            const captura = await produtosBD.read(pesquisa);
            setProdutos(captura);
        } catch (error) {
            console.log('Erro ao listar produtos:', error);
        }
    }

    // Função para remover um produto
    const remove = async (id) => {
        try {
            await produtosBD.remove(id);
            listar(); // Atualiza a lista após remover
        } catch (error) {
            console.log('Erro ao remover o produto:', error);
        }
    };

    // Função para selecionar um produto para edição
    function onSelect(produto) {
        setNome(produto.nome);
        setQuantidade(String(produto.quantidade));
        setId(produto.id); // Define o ID para edição
    }

    useEffect(() => {
        listar(); // Lista produtos ao carregar o componente
    }, [pesquisa]);

    return (
        <View style={styles.container}>
            <TextInput
                style={[styles.texto, focusedInput === 'nome' && styles.focusedInput]}
                placeholder="Nome"
                onChangeText={setNome}
                value={nome}
                onFocus={() => setFocusedInput('nome')}
                onBlur={() => setFocusedInput(null)}
            />
            <TextInput
                style={[styles.texto, focusedInput === 'quantidade' && styles.focusedInput]}
                placeholder="Quantidade"
                onChangeText={setQuantidade}
                value={quantidade}
                onFocus={() => setFocusedInput('quantidade')}
                onBlur={() => setFocusedInput(null)}
            />
            <Button title={id ? "Atualizar" : "Salvar"} onPress={createOrUpdate} />
            <TextInput
                style={styles.texto}
                placeholder="Pesquisar"
                onChangeText={setPesquisa}
                value={pesquisa}
            />

            <FlatList
                contentContainerStyle={styles.listContent}
                data={produtos}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <Produto
                        data={item}
                        onDelete={() => remove(item.id)}
                        onSelect={() => onSelect(item)}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 32,
        gap: 16,
    },
    texto: {
        height: 54,
        borderWidth: 1,
        borderRadius: 7,
        borderColor: "#999",
        paddingHorizontal: 16,
    },
    focusedInput: {
        borderColor: '#007BFF',
        borderWidth: 2,
    },
    listContent: {
        gap: 16,
    },
});
