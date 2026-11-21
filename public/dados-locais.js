let bancoDadosLocais;

function abrirBancoDadosLocais(){
    if(!bancoDadosLocais){
        bancoDadosLocais = new Promise((resolve, reject) => {
            const pedido = indexedDB.open("orcamento-facil", 1);
            pedido.onupgradeneeded = () => pedido.result.createObjectStore("dados");
            pedido.onsuccess = () => resolve(pedido.result);
            pedido.onerror = () => reject(pedido.error);
            pedido.onblocked = () => reject(new Error("Armazenamento ocupado por outra aba."));
        }).catch(erro => {
            bancoDadosLocais = undefined;
            throw erro;
        });
    }
    return bancoDadosLocais;
}

async function operarDadosLocais(modo, iniciar){
    const banco = await abrirBancoDadosLocais();
    return new Promise((resolve, reject) => {
        const transacao = banco.transaction("dados", modo);
        const pedido = iniciar(transacao.objectStore("dados"));
        transacao.oncomplete = () => resolve(pedido.result);
        transacao.onabort = () => reject(transacao.error);
    });
}

function lerDadoLocal(chave){
    return operarDadosLocais("readonly", dados => dados.get(chave));
}

function gravarDadoLocal(chave, valor){
    return operarDadosLocais("readwrite", dados => dados.put(valor, chave));
}
