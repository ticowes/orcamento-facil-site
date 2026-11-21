const perfisEmpresa = [null, null, null];
const seletorPerfil = document.getElementById("perfilEmpresa");
const botaoPerfil = document.getElementById("alternarPerfil");
const botaoSalvarPerfil = document.getElementById("salvarPerfil");
const estadoPerfil = document.getElementById("estadoPerfil");
const botaoAbrirRascunho = document.getElementById("abrirRascunho");
const botaoSalvarRascunho = document.getElementById("salvarRascunho");
const estadoRascunho = document.getElementById("estadoRascunho");
const camposEmpresa = ["empresa_nome", "empresa_doc", "empresa_tel"];

function dadosDaEmpresa(){
    return {
        campos: Object.fromEntries(camposEmpresa.map(id => [id, document.getElementById(id).value])),
        logoBase64,
        usarLogo: logomarcaEmUso(),
        posicaoLogo,
        nomeLogo: document.getElementById("nomeArquivoLogo").textContent
    };
}

function preencherPerfilEmpresa(perfil){
    for(const id of camposEmpresa) document.getElementById(id).value = perfil.campos?.[id] || "";
    restaurarLogo(perfil);
}

function mostrarPerfis(indice = Number(seletorPerfil.value)){
    const opcoes = perfisEmpresa.map((perfil, i) => {
        const nome = perfil?.campos?.empresa_nome?.trim();
        return new Option(`Perfil ${i + 1}${nome ? " — " + nome : perfil ? " — salvo" : " — vazio"}`, i);
    });
    seletorPerfil.replaceChildren(...opcoes);
    seletorPerfil.value = Number.isInteger(indice) && indice >= 0 && indice < opcoes.length ? indice : 0;
    const escolhido = Number(seletorPerfil.value);
    botaoPerfil.disabled = !perfisEmpresa[escolhido] && !perfilAplicado;
    botaoPerfil.textContent = perfilAplicado ? "Desativar perfil" : "Usar perfil";
    botaoPerfil.setAttribute("aria-pressed", String(!!perfilAplicado));
    estadoPerfil.textContent = perfilAplicado ? `Perfil ${perfilAplicado.indice + 1} em uso neste orçamento.` : "";
}

function aplicarPerfil(indice){
    const perfil = perfisEmpresa[indice];
    if(!perfil) return;
    perfilAplicado = { indice, anterior:perfilAplicado?.anterior || dadosDaEmpresa() };
    preencherPerfilEmpresa(perfil);
    mostrarPerfis(indice);
    atualizarPreview();
}

function mostrarRascunho(registro){
    botaoAbrirRascunho.disabled = !registro;
    estadoRascunho.textContent = registro
        ? "Rascunho salvo neste navegador em " + new Date(registro.salvoEm).toLocaleString("pt-BR", { dateStyle:"short", timeStyle:"short" }) + "."
        : "";
}

async function prepararDadosLocais(){
    try {
        const [registro, ...perfis] = await Promise.all([
            lerDadoLocal("rascunho"),
            ...perfisEmpresa.map((_, i) => lerDadoLocal("empresa-" + i))
        ]);
        perfis.forEach((perfil, i) => { perfisEmpresa[i] = perfil || null; });
        mostrarPerfis(perfilAplicado?.indice);
        mostrarRascunho(registro);
        seletorPerfil.disabled = false;
        botaoSalvarPerfil.disabled = false;
        botaoSalvarRascunho.disabled = false;
    } catch {
        estadoRascunho.textContent = "Este navegador não disponibilizou o armazenamento de rascunhos.";
        estadoPerfil.textContent = "Este navegador não disponibilizou o armazenamento de perfis.";
    }
}

seletorPerfil.addEventListener("change", () => {
    const indice = Number(seletorPerfil.value);
    if(perfilAplicado && perfisEmpresa[indice]) aplicarPerfil(indice);
    else mostrarPerfis(indice);
});

botaoPerfil.addEventListener("click", () => {
    if(!perfilAplicado){
        aplicarPerfil(Number(seletorPerfil.value));
        return;
    }
    const anterior = perfilAplicado.anterior;
    perfilAplicado = null;
    preencherPerfilEmpresa(anterior);
    mostrarPerfis();
    atualizarPreview();
});

botaoSalvarPerfil.addEventListener("click", async () => {
    const indice = Number(seletorPerfil.value);
    const perfil = { ...dadosDaEmpresa(), usarLogo:true };
    if(!perfil.logoBase64 && !Object.values(perfil.campos).some(valor => valor.trim())){
        estadoPerfil.textContent = "Preencha os dados da empresa ou escolha uma logomarca para salvar.";
        return;
    }
    botaoSalvarPerfil.disabled = true;
    try {
        if(await lerDadoLocal("empresa-" + indice) && !confirm(`Substituir os dados do Perfil ${indice + 1}?`)) return;
        await gravarDadoLocal("empresa-" + indice, perfil);
        perfisEmpresa[indice] = perfil;
        mostrarPerfis();
        estadoPerfil.textContent = `Perfil ${indice + 1} salvo neste navegador.`;
    } catch {
        estadoPerfil.textContent = "Não foi possível salvar o perfil neste navegador.";
    } finally {
        botaoSalvarPerfil.disabled = false;
    }
});

botaoSalvarRascunho.addEventListener("click", async () => {
    botaoSalvarRascunho.disabled = true;
    try {
        if(await lerDadoLocal("rascunho") && !confirm("Substituir o rascunho salvo pelo orçamento atual?")) return;
        const registro = { salvoEm:Date.now(), dados:capturarOrcamento() };
        await gravarDadoLocal("rascunho", registro);
        mostrarRascunho(registro);
    } catch {
        estadoRascunho.textContent = "Não foi possível salvar o rascunho neste navegador.";
    } finally {
        botaoSalvarRascunho.disabled = false;
    }
});

botaoAbrirRascunho.addEventListener("click", async () => {
    botaoAbrirRascunho.disabled = true;
    try {
        const registro = await lerDadoLocal("rascunho");
        if(!registro){
            estadoRascunho.textContent = "Nenhum rascunho salvo neste navegador.";
            return;
        }
        if(!confirm("Abrir o rascunho salvo e substituir o preenchimento atual?")) return;
        campoCupom.value = "";
        limparCupom();
        restaurarOrcamento(registro.dados);
        mostrarPerfis(perfilAplicado?.indice);
        estadoRascunho.textContent = "Rascunho aberto para edição.";
    } catch {
        estadoRascunho.textContent = "Não foi possível abrir o rascunho salvo.";
    } finally {
        botaoAbrirRascunho.disabled = false;
    }
});
