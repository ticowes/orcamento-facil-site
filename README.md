# orcamento-facil-site
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Orçamento Fácil</title>
<style>
body {
    user-select: none;
    background-color: #b3a28f; /* sua cor base */
    font-family: Arial, sans-serif;
    margin: 0;
}

/* BLOCO PRINCIPAL PADRÃO */
.blocoPrincipal {
    padding: 25px;
    margin: 0;
}
.previewTextoMenor {
    font-size: 12px;
}
/* Alternância automática */
.blocoPrincipal:nth-child(odd) {
    background-color: #f3ede8; /* tom mais claro */
}

.blocoPrincipal:nth-child(even) {
    background-color: #e4d7c9; /* tom mais escuro */
}

/* blocos internos (área e itens continuam iguais) */
.blocoArea,
.blocoItem {
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 10px;
    border: 1px solid #a5a4a4;
}
.minimizado {
    padding: 12px 15px;
    cursor: pointer;
}

.tituloMinimizado {
    font-weight: bold;
}
.arrastavel {
    cursor: grab;
}

.arrastando {
    opacity: 0.6;
    cursor: grabbing;
}
/* ===== BOTÕES ARREDONDAR ===== */

.btnArredCima,
.btnArredBaixo {
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: 0.2s;
}

/* Cor padrão */
.btnArredCima {
    background-color: #4e9bf3;   /* AZUL normal */
    color: white;
}

.btnArredBaixo {
    background-color: #4e9bf3;   /* CINZA normal */
    color: white;
}

/* Hover */
.btnArredCima:hover {
    background-color: #9ebad8;
}

.btnArredBaixo:hover {
    background-color: #9ebad8;
}

/* ===== ESTADO ATIVO ===== */

.btnArredCima.ativo {
    background-color: #0851a3;   /* VERDE quando ativo */
}

.btnArredBaixo.ativo {
    background-color: #0851a3;   /* VERMELHO quando ativo */
}
#btnNovoOrcamento{
    background-color: #c62828;   /* 👈 MUDE AQUI A COR */
    color: rgb(255, 255, 255);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: 0.2s;
}

#btnNovoOrcamento:hover{
    opacity: 0.8;
}
</style>
</head>
<script>

</script>
<body>

<div id="orcamentoCompleto">

    <!-- BLOCO 1 -->
<div class="blocoPrincipal">
    <div style="display:flex; justify-content:space-between; align-items:center;">
        <h1 style="margin:0;">Orçamento Fácil</h1>

        <button id="btnNovoOrcamento" onclick="novoOrcamento()">
            Novo Orçamento
        </button>
    </div>

    <br>

    <div class="secao">
        <label><strong>Título do Orçamento</strong></label>
        <input type="text" id="tituloOrcamento" placeholder="Ex: Restauração de Piso de Madeira">
    </div>
</div>


    <!-- BLOCO 2 -->
    <div class="blocoPrincipal">
        <h2>Dados da Empresa</h2>

        Nome:
        <input type="text" id="empresa_nome"><br><br>

       CPF ou CNPJ:
<input type="text" id="empresa_doc" oninput="mascaraDocumento(this)"><br><br>

        Telefone:
        <input type="text" id="empresa_tel" oninput="mascaraTelefone(this)"><br><br>
    </div>


    <!-- BLOCO 3 -->
    <div class="blocoPrincipal">
        <h2>Dados do Cliente</h2>

        Nome:
        <input type="text" id="cliente_nome" oninput="atualizarPreview()"><br><br>

        CPF ou CNPJ:
<input type="text" id="cliente_doc" oninput="mascaraDocumento(this)"><br><br>

        Telefone:
        <input type="text" id="cliente_tel" oninput="mascaraTelefone(this)"><br><br>

        Endereço:
        <input type="text" id="cliente_endereco"><br><br>
    </div>


    <!-- BLOCO 4 -->
    <div class="blocoPrincipal">
        <h2>Informações do Orçamento</h2>

        Número:
        <input type="text" id="numero_orcamento" oninput="atualizarPreview()"><br><br>

        Data:
        <input type="text" id="data_orcamento"><br><br>

        Validade (dias):
        <input type="number" id="validade_dias" value="30">

        <p>Vencimento: <span id="data_vencimento">--/--/----</span></p>
    </div>


    <!-- BLOCO 5 -->
    <div class="blocoPrincipal">
        <h2>Calculadora de Área</h2>

        <div id="linhasArea"></div>
        <br>
        <button onclick="adicionarLinhaArea()">Adicionar Ambiente</button>
        
        <br><br>

        <div style="display:flex; align-items:center; width:84%; margin-top:15px;">

    <h2 style="margin-bottom:10px;">
    Área Total: <span id="totalArea">0,00</span>m²
</h2>

<div style="width:100%; text-align:center; margin-top:35px;">
    <button onclick="reiniciarCalculadora()" 
        style="background:#c62828; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">
        Reiniciar Calculadora
    </button>
</div>

</div>
    </div>


    <!-- BLOCO 6 -->
    <div class="blocoPrincipal">
        <h2>Orçamento</h2>

        Imposto (%):
        <input type="number" id="imposto" value="0" step="any" oninput="calcularTotal(); atualizarPreview();"><br><br>

        RT (%):
        <input type="number" id="rt" value="0" step="any" oninput="calcularTotal(); atualizarPreview();"><br><br>

        <div id="itens"></div>
        <br>
        <button onclick="adicionarItem()">Adicionar Item</button>

       
    <h2 style="margin-bottom:10px;">
        Total Geral: R$ <span id="total">0,00</span>
    </h2>
    
    <div style="width:100%; text-align:center; margin-top:-35px;">
    <button onclick="reiniciarOrcamento()" 
        style="background:#c62828; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">
        Reiniciar Orçamento
    </button>
</div>
    </div>


    <!-- BLOCO 7 -->
    <div class="blocoPrincipal">
        <h3>Uso interno (não enviado ao cliente)</h3>
        <textarea id="descricao_interna" rows="4" style="width:100%;"></textarea>
    </div>


    <!-- BLOCO 8 -->
    <div class="blocoPrincipal">
        <h3>Descrição para o cliente</h3>
        <textarea id="descricao_cliente" rows="4" style="width:100%;" oninput="atualizarPreview()"></textarea>
    </div>


    <!-- BLOCO 9 -->
    <div class="blocoPrincipal">
        <h2>Preview do Cliente</h2>

        <div id="previewCliente" style="
            position:relative;
            padding:150px;
            border:2px solid #000;
            background:#ffffff;
            user-select:none;
            pointer-events:none;
            overflow:hidden;
        ">

            <div id="watermarkPreview" style="
                position:absolute;
                top:50%;
                left:50%;
                transform:translate(-50%,-50%) rotate(-35deg);
                font-size:120px;
                color:#e93434d9;
                font-weight:bold;
                white-space:nowrap;
                width:300%;
                text-align:center;
                z-index:10;
                pointer-events:none;
            ">
                ORÇAMENTO FÁCIL<br>DOCUMENTO NÃO VÁLIDO
            </div>

            <div id="previewConteudo"></div>
        </div>

        <br>
        <button onclick="gerarPDFs()">Gerar PDFs</button>
    </div>

</div>

</body>
<script>
let contadorArea = 0;
let contadorItens = 0;


window.onload = function(){

    const dadosSalvos = localStorage.getItem("orcamentoFacil");

    if(dadosSalvos){

        const dados = JSON.parse(dadosSalvos);

        contadorArea = dados.contadorArea || 0;
        contadorItens = 0;

        // ---------- RESTAURAR CAMPOS FIXOS ----------
        Object.entries(dados.camposFixos || {}).forEach(([id, valor])=>{
            if(document.getElementById(id)){
                document.getElementById(id).value = valor;
            }
        });

        // ---------- RESTAURAR AMBIENTES ----------
        dados.ambientes?.forEach(amb => {

            adicionarLinhaArea();

            const ultimo = document.querySelectorAll(".blocoArea");
            const ambienteCriado = ultimo[ultimo.length - 1];

            ambienteCriado.querySelector("input[type='text']").value = amb.descricao;

            const container = ambienteCriado.querySelector(".medidasContainer");
            container.innerHTML = "";

            amb.medidas.forEach(m => {
                adicionarMedida(contadorArea);

                const medidas = container.querySelectorAll("div");
                const ultima = medidas[medidas.length - 1];

                const inputs = ultima.querySelectorAll("input");
                inputs[0].value = m.comprimento;
                inputs[1].value = m.largura;
            });

        });

        // ---------- RESTAURAR ITENS ----------
        dados.itens?.forEach(item => {

            adicionarItem();

            const i = contadorItens;

            document.getElementById(`desc_${i}`).value = item.desc;
            document.getElementById(`quant_${i}`).value = item.quant;
            document.getElementById(`perc_${i}`).value = item.perc;
            document.getElementById(`unidade_${i}`).value = item.unidade;
            document.getElementById(`valor_${i}`).value = item.valor;
            document.getElementById(`imp_${i}`).checked = item.imp;
            document.getElementById(`rt_${i}`).checked = item.rt;

            if(item.quantFinal){
                document.getElementById(`quant_${i}`).dataset.final = item.quantFinal;
                document.getElementById(`quant_final_${i}`).value =
                    parseFloat(item.quantFinal).toFixed(2);
            }

        });

    }

    // ---------- DATA (NÃO SOBRESCREVE SE EXISTIR) ----------
    if(!data_orcamento.value){
        atualizarData();
    }

    atualizarVencimento();
    calcularAreas();
    calcularTotal();
    atualizarPreview();

    validade_dias.addEventListener("input", atualizarVencimento);
};

function atualizarData(){
    let hoje = new Date();
    let dia = String(hoje.getDate()).padStart(2,'0');
    let mes = String(hoje.getMonth()+1).padStart(2,'0');
    let ano = hoje.getFullYear();
    document.getElementById("data_orcamento").value = `${dia}/${mes}/${ano}`;
}

function atualizarVencimento(){
    let dias = parseInt(document.getElementById("validade_dias").value) || 0;
    let hoje = new Date();
    hoje.setDate(hoje.getDate()+dias);
    let dia = String(hoje.getDate()).padStart(2,'0');
    let mes = String(hoje.getMonth()+1).padStart(2,'0');
    let ano = hoje.getFullYear();
    document.getElementById("data_vencimento").innerText = `${dia}/${mes}/${ano}`;
    atualizarPreview();
}

function formatar(valor){
    return valor.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
}

function mascaraTelefone(campo){
    let v = campo.value.replace(/\D/g,'');
    v = v.replace(/^(\d{2})(\d)/g,"($1) $2");
    v = v.replace(/(\d{5})(\d)/,"$1-$2");
    campo.value = v;
}
function mascaraCPF(campo){
    let v = campo.value.replace(/\D/g,'');
    v = v.replace(/(\d{3})(\d)/,"$1.$2");
    v = v.replace(/(\d{3})(\d)/,"$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
    campo.value = v;
}
function mascaraCNPJ(campo){
    let v = campo.value.replace(/\D/g,'');
    v = v.replace(/^(\d{2})(\d)/,"$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/,".$1/$2");
    v = v.replace(/(\d{4})(\d)/,"$1-$2");
    campo.value = v;
}
function mascaraDocumento(campo){
    let v = campo.value.replace(/\D/g,'');

    if(v.length <= 11){
        // CPF
        v = v.replace(/(\d{3})(\d)/,"$1.$2");
        v = v.replace(/(\d{3})(\d)/,"$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
    } else {
        // CNPJ
        v = v.replace(/^(\d{2})(\d)/,"$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/,".$1/$2");
        v = v.replace(/(\d{4})(\d)/,"$1-$2");
    }

    campo.value = v;
}
function reordenarNumeracao() {

    const blocos = document.querySelectorAll(".blocoArea");

    blocos.forEach((bloco, index) => {

        const strong = bloco.querySelector("strong");

        if (strong) {
            strong.innerText = "Ambiente " + (index + 1);
        }

    });

    contadorArea = blocos.length;
}
function mascaraDecimal(campo){

    let valor = campo.value.replace(/\D/g,'');

    if(valor.length === 0){
        campo.value = "";
        return;
    }

    // sempre mantém 2 casas decimais
    valor = (parseInt(valor) / 100).toFixed(2);

    // converte para padrão brasileiro
    valor = valor.replace(".", ",");

    campo.value = valor;
}
function adicionarLinhaArea(){

    contadorArea++;

    let div = document.createElement("div");
    div.style.backgroundColor = (contadorArea % 2 === 0) ? "#f1f1f1" : "#ffffff";
    div.classList.add("blocoArea");

    div.innerHTML = `
        <hr>
        <strong>Ambiente ${contadorArea}</strong><br><br>

        Descrição:
        <input type="text"><br><br>

        <div class="medidasContainer" data-ambiente="${contadorArea}">
        </div>

        <div style="margin-top:10px;">
            <strong>Área: <span id="totalAmb_${contadorArea}">0,00</span>m²</strong>
        </div>

        <br>

        <button onclick="adicionarMedida(${contadorArea})">
            Continuar
        </button>

        <div style="text-align:right; margin-top:10px;">
            <button onclick="removerAmbiente(this)" 
                style="background:#c62828; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">
                Remover Ambiente
            </button>
        </div>
        <br>
    `;

    document.getElementById("linhasArea").appendChild(div);
    ativarDuploCliqueMinimizar(div, "area");

    adicionarMedida(contadorArea); // cria a primeira medida automaticamente
    salvarNoStorage();
}
function adicionarMedida(ambiente){

    const container = document.querySelector(
        `.medidasContainer[data-ambiente="${ambiente}"]`
    );

    const index = container.children.length + 1;

    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    div.innerHTML = `
        Comprimento:
        <input type="text"
            oninput="mascaraDecimal(this); calcularAreas();">

        Largura:
        <input type="text"
            oninput="mascaraDecimal(this); calcularAreas();">

        = <span class="resultadoParcial">0,00</span>

        <button onclick="removerMedida(this)">
            X
        </button>
    `;

    container.appendChild(div);
}
function removerMedida(botao){
    botao.parentElement.remove();
    calcularAreas();
}
function calcularAreas(){

    let totalGeral = 0;

    const ambientes = document.querySelectorAll(".blocoArea");

    ambientes.forEach((ambiente, index) => {

        let totalAmbiente = 0;

        const medidas = ambiente.querySelectorAll(".medidasContainer > div");

        medidas.forEach(div => {

            const inputs = div.querySelectorAll("input");

            let comp = parseFloat(inputs[0]?.value.replace(",", ".")) || 0;
            let larg = parseFloat(inputs[1]?.value.replace(",", ".")) || 0;

            let area = comp * larg;

            const span = div.querySelector(".resultadoParcial");
            if(span){
                span.innerText = formatar(area);
            }

            totalAmbiente += area;
        });

        const totalSpan = ambiente.querySelector(
            `span[id^="totalAmb_"]`
        );

        if(totalSpan){
            totalSpan.innerText = formatar(totalAmbiente);
        }

        totalGeral += totalAmbiente;
    });

    document.getElementById("totalArea").innerText = formatar(totalGeral);
    salvarNoStorage();
}
function removerAmbiente(botao){

    if(!confirm("Tem certeza que deseja remover este ambiente? Isso o removerá permanentemente do relatório inerno.")){
        return;
    }

    const divAmbiente = botao.closest(".blocoArea");
    if(divAmbiente){
        divAmbiente.remove();
    }

    calcularAreas();
    reordenarNumeracao();
    salvarNoStorage();
}
function reiniciarCalculadora(){

    if(!confirm("Reiniciar a calculadora?\n\nTodos os ambientes serão removidos e a área total será zerada.")){
        return;
    }

    const container = document.getElementById("linhasArea");

    if(container){
        container.innerHTML = "";
    }

    contadorArea = 0;

    document.getElementById("totalArea").innerText = "0,00";

    reordenarNumeracao();
    salvarNoStorage();
}
function reiniciarOrcamento(){

    if(!confirm("Reiniciar o orçamento?\n\nTodos os itens serão removidos e o total será zerado.")){
        return;
    }

    const container = document.getElementById("itens");

    if(container){
        container.innerHTML = "";
    }

    contadorItens = 0;

    document.getElementById("total").innerText = "0,00";

    atualizarPreview();
    salvarNoStorage();
}
function adicionarItem(){
    contadorItens++;

    let totalArea = parseFloat(
        document.getElementById("totalArea").innerText
            .replace(/\./g,"")
            .replace(",",".")
    ) || 0;

    let div = document.createElement("div");
    div.style.backgroundColor = (contadorItens % 2 === 0) ? "#f1f1f1" : "#ffffff";
    div.classList.add("blocoItem");
    div.innerHTML = `
        <hr>
        <h4>Item ${contadorItens}</h4>

        <div style="margin-bottom:12px;">
    Descrição:
    <input type="text" id="desc_${contadorItens}" 
        oninput="atualizarPreview()">
</div>

<div style="margin-bottom:12px;">
    Quantidade:
    <input 
        type="number" 
        id="quant_${contadorItens}" 
        value="${totalArea}" 
        step="0.01"
        oninput="calcularQuantidadeFinal(${contadorItens}); calcularTotal(); atualizarPreview();"
    >
</div>

<div style="margin-bottom:12px;">
    % de margem:
    <input 
        type="number" 
        id="perc_${contadorItens}" 
        value="0" 
        step="0.01"
        style="width:70px"
        oninput="calcularQuantidadeFinal(${contadorItens}); calcularTotal(); atualizarPreview();"
    >
</div>

<div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
    <div>
        Total com margem:
        <input 
            type="number" 
            id="quant_final_${contadorItens}" 
            step="0.01"
            readonly
            style="background:#eee; width:100px"
        >
    </div>

    <button type="button" 
    class="btnArredCima" 
    data-item="${contadorItens}">
    Arred ↑
</button>

<button type="button" 
    class="btnArredBaixo" 
    data-item="${contadorItens}">
    Arred ↓
</button>
</div>
    


        Unidade de medida:
        <input 
            type="text" 
            id="unidade_${contadorItens}" 
            placeholder="m², m³, hora, un..."
            value="m²"
            onfocus="if(this.value==='m²') this.value='';"
            onblur="if(this.value.trim()==='') this.value='m²';"
            oninput="atualizarPreview()"
        ><br><br>

        Valor unitário:
        <input 
            type="number" 
            id="valor_${contadorItens}" 
            step="0.01"
            oninput="calcularTotal(); atualizarPreview();"
        ><br><br>

        <label>
            <input type="checkbox" id="imp_${contadorItens}" checked onchange="calcularTotal(); atualizarPreview();">
            Aplicar Imposto
        </label>

        <label>
            <input type="checkbox" id="rt_${contadorItens}" checked onchange="calcularTotal(); atualizarPreview();">
            Aplicar RT
        </label>

        <br><br>
        Subtotal: <span id="subtotal_${contadorItens}">0,00</span><br><br>
        <div style="text-align:right;">
    <button onclick="removerItem(this)" 
        style="background:#c62828; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">
        Remover Item
    </button>
</div>
<br>
    `;

    document.getElementById("itens").appendChild(div);
    ativarDuploCliqueMinimizar(div, "item");
    ativarDragItem(div);

    // cálculo inicial
    calcularQuantidadeFinal(contadorItens);
    calcularTotal();
    const btnCima = div.querySelector(".btnArredCima");
const btnBaixo = div.querySelector(".btnArredBaixo");

btnCima.addEventListener("click", function(){
    aplicarArredondamento(contadorItens, "cima");
});

btnBaixo.addEventListener("click", function(){
    aplicarArredondamento(contadorItens, "baixo");
});
salvarNoStorage();
}
function aplicarArredondamento(i, tipo){

    const quantInput = document.getElementById(`quant_${i}`);
    const campoFinal = document.getElementById(`quant_final_${i}`);

    const btnCima = document.querySelector(`.btnArredCima[data-item="${i}"]`);
    const btnBaixo = document.querySelector(`.btnArredBaixo[data-item="${i}"]`);

    let valor = parseFloat(quantInput.dataset.final || quantInput.value) || 0;

    // Se já estiver ativo → reverter
    if(tipo === "cima" && btnCima.classList.contains("ativo")){
        restaurarOriginal(i);
        return;
    }

    if(tipo === "baixo" && btnBaixo.classList.contains("ativo")){
        restaurarOriginal(i);
        return;
    }

    // Salva valor original se ainda não salvo
    if(!quantInput.dataset.original){
        quantInput.dataset.original = valor;
    }

    // Desativa o outro botão
    btnCima.classList.remove("ativo");
    btnBaixo.classList.remove("ativo");
    btnCima.innerText = "Arred ↑";
    btnBaixo.innerText = "Arred ↓";

    // Aplica arredondamento
    if(tipo === "cima"){
        valor = Math.ceil(valor);
        btnCima.classList.add("ativo");
        btnCima.innerText = "Reverter";
    } else {
        valor = Math.floor(valor);
        btnBaixo.classList.add("ativo");
        btnBaixo.innerText = "Reverter";
    }

    campoFinal.value = valor.toFixed(2);
    quantInput.dataset.final = valor;

    calcularTotal();
    atualizarPreview();
}
function restaurarOriginal(i){

    const quantInput = document.getElementById(`quant_${i}`);
    const campoFinal = document.getElementById(`quant_final_${i}`);

    const btnCima = document.querySelector(`.btnArredCima[data-item="${i}"]`);
    const btnBaixo = document.querySelector(`.btnArredBaixo[data-item="${i}"]`);

    let original = parseFloat(quantInput.dataset.original) || 0;

    campoFinal.value = original.toFixed(2);
    quantInput.dataset.final = original;

    btnCima.classList.remove("ativo");
    btnBaixo.classList.remove("ativo");
    btnCima.innerText = "Arred ↑";
    btnBaixo.innerText = "Arred ↓";

    delete quantInput.dataset.original;

    calcularTotal();
    atualizarPreview();
}
function removerItem(botao){

    if(!confirm("Tem certeza que deseja remover este item?\n\nSe for excluído, não aparecerá no relatório interno.")){
        return;
    }

    const divItem = botao.closest(".blocoItem");

    if(divItem){
        divItem.remove();
    }

    reordenarItens();
    calcularTotal();
    atualizarPreview();
    salvarNoStorage();
}
function reordenarItens(){

    const itens = document.querySelectorAll(".blocoItem");

    itens.forEach((item, index) => {

        const titulo = item.querySelector("h4");

        if(titulo){
            titulo.innerText = "Item " + (index + 1);
        }

    });

    contadorItens = itens.length;
}
function ativarDragItem(container){

    let timer;
    let segurando = false;

    container.addEventListener("mousedown", function(e){

        if(e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;

        timer = setTimeout(() => {
            segurando = true;
            container.draggable = true;
            container.classList.add("arrastavel");
        }, 200); // meio segundo

    });

    container.addEventListener("mouseup", function(){
        clearTimeout(timer);
    });

    container.addEventListener("dragstart", function(){
        if(!segurando) return;
        container.classList.add("arrastando");
    });

    container.addEventListener("dragend", function(){
        container.classList.remove("arrastando");
        container.draggable = false;
        segurando = false;
        reordenarItens();
        calcularTotal();
        atualizarPreview();
    });

    container.addEventListener("dragover", function(e){
        e.preventDefault();
    });

    container.addEventListener("drop", function(e){
        e.preventDefault();

        const dragging = document.querySelector(".arrastando");
        if(!dragging || dragging === container) return;

        const containerPai = document.getElementById("itens");
        containerPai.insertBefore(dragging, container);
    });
}
function calcularQuantidadeFinal(i){
    const base = parseFloat(document.getElementById(`quant_${i}`)?.value) || 0;
    const perc = parseFloat(document.getElementById(`perc_${i}`)?.value) || 0;

    const resultado = base + (base * perc / 100);

    const campoFinal = document.getElementById(`quant_final_${i}`);
    if(campoFinal){
        campoFinal.value = resultado.toFixed(2);
    }

    // força o cálculo usar a quantidade final
    document.getElementById(`quant_${i}`).dataset.final = resultado;
    // limpa qualquer arredondamento anterior
delete document.getElementById(`quant_${i}`).dataset.original;

const btnCima = document.querySelector(`.btnArredCima[data-item="${i}"]`);
const btnBaixo = document.querySelector(`.btnArredBaixo[data-item="${i}"]`);

if(btnCima){
    btnCima.innerText = "Arred ↑";
    delete btnCima.dataset.ativo;
}

if(btnBaixo){
    btnBaixo.innerText = "Arred ↓";
    delete btnBaixo.dataset.ativo;
}
}
function calcularTotal(){
    let imposto = parseFloat(document.getElementById("imposto").value) || 0;
    let rt = parseFloat(document.getElementById("rt").value) || 0;
    let totalGeral = 0;

    for(let i = 1; i <= contadorItens; i++){

        const quantInput = document.getElementById("quant_" + i);

        // 👉 prioridade: quantidade com porcentagem aplicada
        let q = 0;
        if (quantInput?.dataset?.final) {
            q = parseFloat(quantInput.dataset.final) || 0;
        } else {
            q = parseFloat(quantInput?.value) || 0;
        }

        let v = parseFloat(document.getElementById("valor_" + i)?.value) || 0;

        let subtotal = q * v;

        if(document.getElementById("imp_" + i)?.checked){
            subtotal += subtotal * (imposto / 100);
        }

        if(document.getElementById("rt_" + i)?.checked){
            subtotal += subtotal * (rt / 100);
        }

        if(document.getElementById("subtotal_" + i)){
            document.getElementById("subtotal_" + i).innerText = formatar(subtotal);
        }

        totalGeral += subtotal;
    }

    document.getElementById("total").innerText = formatar(totalGeral);
    salvarNoStorage();
}
function ativarDuploCliqueMinimizar(container, tipo){

    let ultimoClique = 0;
    const intervaloMaximo = 300; // 300ms (menos de meio segundo)

    container.addEventListener("click", function(e){

        if(e.target.tagName === "BUTTON") return;

        const agora = Date.now();
        const diferenca = agora - ultimoClique;

        if(diferenca < intervaloMaximo){
            executarMinimizacao(container, tipo);
        }

        ultimoClique = agora;
    });
}
function executarMinimizacao(container, tipo){

    let wrapper = container.querySelector(".conteudoInterno");

    if(!wrapper){
        wrapper = document.createElement("div");
        wrapper.className = "conteudoInterno";

        while(container.firstChild){
            wrapper.appendChild(container.firstChild);
        }

        container.appendChild(wrapper);
    }

    // RESTAURAR
    if(container.classList.contains("minimizado")){
        wrapper.style.display = "block";
        container.querySelector(".tituloMinimizado")?.remove();
        container.classList.remove("minimizado");
        return;
    }

    let descricao = "";
    let areaTexto = "";

    if(tipo === "area"){

        descricao = wrapper.querySelector("input[type='text']")?.value || "";

        const areaSpan = wrapper.querySelector("span[id^='totalAmb_']");
        let area = areaSpan ? areaSpan.innerText : "0,00";

        areaTexto = `Área: ${area}m²`;
    }

    if(tipo === "item"){

        const descInput = wrapper.querySelector("input[id^='desc_']");
        const quantInput = wrapper.querySelector("input[id^='quant_']");
        const valorInput = wrapper.querySelector("input[id^='valor_']");
        const impCheck = wrapper.querySelector("input[id^='imp_']");
        const rtCheck = wrapper.querySelector("input[id^='rt_']");

        descricao = descInput?.value || "";

        let q = 0;
        if (quantInput?.dataset?.final) {
            q = parseFloat(quantInput.dataset.final) || 0;
        } else {
            q = parseFloat(quantInput?.value) || 0;
        }

        let v = parseFloat(valorInput?.value) || 0;
        let subtotal = q * v;

        const impostoPercent = parseFloat(document.getElementById("imposto").value) || 0;
        const rtPercent = parseFloat(document.getElementById("rt").value) || 0;

        if(impCheck?.checked){
            subtotal += subtotal * (impostoPercent / 100);
        }

        if(rtCheck?.checked){
            subtotal += subtotal * (rtPercent / 100);
        }

        descricao = `${descricao} - ${formatar(subtotal)}`;
    }

    if(descricao.trim() === ""){
        descricao = tipo === "area" ? "Ambiente" : "Item";
    }

    wrapper.style.display = "none";

    const titulo = document.createElement("div");
    titulo.className = "tituloMinimizado";

    if(tipo === "area"){
        titulo.innerText = `${descricao} — ${areaTexto}`;
    } else {
        titulo.innerText = descricao;
    }

    container.prepend(titulo);
    container.classList.add("minimizado");
}
function atualizarPreview(){

    let clienteNome = document.getElementById("cliente_nome").value.trim();
    let empresaNome = document.getElementById("empresa_nome").value.trim();
    let empresaDoc = document.getElementById("empresa_doc").value.trim();
    let clienteDoc = document.getElementById("cliente_doc").value.trim();
    let empresaTel = document.getElementById("empresa_tel").value.trim();

    
    let clienteTel = document.getElementById("cliente_tel").value.trim();
    let clienteEnd = document.getElementById("cliente_endereco").value.trim();

    let numero = document.getElementById("numero_orcamento").value;
    let data = document.getElementById("data_orcamento").value;
    let venc = document.getElementById("data_vencimento").innerText;

    let imposto = parseFloat(document.getElementById("imposto").value) || 0;
    let rt = parseFloat(document.getElementById("rt").value) || 0;

    let html = "";

    const tituloOrcamento = document.getElementById("tituloOrcamento").value;

    html += `
<h2 style="text-align:center; margin-bottom:5px;">ORÇAMENTO</h2>
${tituloOrcamento ? `<h2 style="text-align:center; margin-top:0;">${tituloOrcamento}</h2>` : ""}
`;

    /* DADOS DA EMPRESA */
    if(empresaNome || empresaDoc || empresaTel){

        html += `<div style="margin-top:20px;">`;

        if(empresaNome) 
            html += `<div style="font-size:22px; font-weight:bold;">${empresaNome}</div>`;

        /* 👇 INÍCIO DO TEXTO MENOR */
        html += `<div class="previewTextoMenor">`;

        if(empresaDoc){
    let numeros = empresaDoc.replace(/\D/g,'');
    let tipo = numeros.length <= 11 ? "CPF" : "CNPJ";
    html += `${tipo}: ${empresaDoc}<br>`;
}
        if(empresaTel) html += `Telefone: ${empresaTel}<br>`;

        html += `</div>`;
        /* 👆 FIM DO TEXTO MENOR */

        html += `</div><br>`;
    }

    /* DADOS DO CLIENTE */
    if(clienteNome || clienteDoc || clienteTel || clienteEnd){

        html += `<div class="previewTextoMenor">`;

        html += `<strong>Dados do Cliente</strong><br>`;

        if(clienteNome) html += `Nome: ${clienteNome}<br>`;
        if(clienteDoc){
    let numeros = clienteDoc.replace(/\D/g,'');
    let tipo = numeros.length <= 11 ? "CPF" : "CNPJ";
    html += `${tipo}: ${clienteDoc}<br>`;
}
        if(clienteTel) html += `Telefone: ${clienteTel}<br>`;
        if(clienteEnd) html += `Endereço: ${clienteEnd}<br>`;

        html += `<br></div>`;
    }

    /* INFORMAÇÕES ORÇAMENTO */
    html += `
    <div class="previewTextoMenor" style="
        display:flex;
        gap:30px;
        flex-wrap:wrap;
        margin-bottom:15px;
    ">
        <div><strong>Número:</strong> ${numero}</div>
        <div><strong>Data:</strong> ${data}</div>
        <div><strong>Vencimento:</strong> ${venc}</div>
    </div>
`;

    /* TABELA (já está 14px — mantida igual) */
    html += `
<table style="
    width:100%;
    margin-top:20px;
    border-collapse:collapse;
    font-size:14px;
">
    <tr style="font-weight:bold; text-align:center;">
        <td style="padding:8px;">Descrição</td>
        <td style="padding:8px;">Quantidade</td>
        <td style="padding:8px;">Unidade</td>
        <td style="padding:8px;">Valor Unitário</td>
        <td style="padding:8px;">Subtotal</td>
    </tr>
`;

    let totalGeral = 0;

    const itensDOM = document.querySelectorAll("#itens .blocoItem");

itensDOM.forEach(item => {

    const descInput = item.querySelector("input[id^='desc_']");
    const quantInput = item.querySelector("input[id^='quant_']");
    const unidadeInput = item.querySelector("input[id^='unidade_']");
    const valorInput = item.querySelector("input[id^='valor_']");
    const impCheck = item.querySelector("input[id^='imp_']");
    const rtCheck = item.querySelector("input[id^='rt_']");

    let desc = descInput?.value || "";

    let q = 0;
    if (quantInput?.dataset?.final) {
        q = parseFloat(quantInput.dataset.final) || 0;
    } else {
        q = parseFloat(quantInput?.value) || 0;
    }

    let unidade = unidadeInput?.value || "";
    let v = parseFloat(valorInput?.value) || 0;

    if(!desc && q===0 && v===0) return;

    let subtotal = q * v;

    if(impCheck?.checked)
        subtotal += subtotal * (imposto/100);

    if(rtCheck?.checked)
        subtotal += subtotal * (rt/100);

    let valorUnitFinal = q > 0 ? subtotal / q : 0;

    totalGeral += subtotal;

    html += `
<tr style="text-align:center;">
    <td style="padding:8px;">${desc}</td>
    <td style="padding:8px;">${formatar(q)}</td>
    <td style="padding:8px;">${unidade}</td>
    <td style="padding:8px;">R$ ${formatar(valorUnitFinal)}</td>
    <td style="padding:8px;">R$ ${formatar(subtotal)}</td>
</tr>
    `;
});

    html += `</table>`;

    let descCliente = document.getElementById("descricao_cliente").value.trim();
    

    html += `
        <div style="
            text-align:right;
            font-size:20px;
            font-weight:bold;
            margin-top:20px;
        ">
            Total Geral: R$ ${formatar(totalGeral)}
        </div>
    `;
if(descCliente){
    html += `
        <div style="
            margin-top:20px;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: break-word;
            text-align: justify;
        ">
            ${descCliente}
        </div>
    `;
}
    document.getElementById("previewConteudo").innerHTML = html;
    salvarNoStorage();
}

function coletarDadosSistema() {
    return {
        empresa: {
    nome: empresa_nome.value,
    documento: empresa_doc.value,
    telefone: empresa_tel.value
},
cliente: {
    nome: cliente_nome.value,
    documento: cliente_doc.value,
    telefone: cliente_tel.value,
        },
        orcamento: {
            numero: numero_orcamento.value,
            data: data_orcamento.value,
            vencimento: data_vencimento.innerText,
            imposto: imposto.value,
            rt: rt.value,
            total: total.innerText
        },
        descricaoInterna: descricao_interna.value
    };
}

// ---------- FUNÇÃO PARA FORMATAR NÚMEROS ----------
function formatar(valor){
    return Number(valor).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
}


// ---------- PREPARAR PDF CLIENTE SEM MARCA D'ÁGUA ----------
function prepararPDFCliente() {
    const preview = document.getElementById("previewCliente");
    if(!preview) throw new Error("Preview do cliente não encontrado");

    // Clona o conteúdo do preview
    const clone = preview.cloneNode(true);

    // Remove a marca d'água do clone
    const watermark = clone.querySelector("#watermarkPreview");
    if (watermark) watermark.remove();

    // Cria HTML completo do PDF incluindo estilos simples
    const htmlCliente = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
body { font-family: Arial, sans-serif; font-size: 14px; margin: 40px; }
h2 { text-align: center; }
table { 
    width: 100%; 
    margin-top: 15px; 
    border-collapse: collapse;
    table-layout: fixed;
}
td { 
    padding: 4px 0; 
    word-break: break-word;
    overflow-wrap: break-word;
}
</style>
</head>
<body>
${clone.innerHTML}
</body>
</html>
    `;
    return htmlCliente;
}

// ---------- PREPARAR PDF DE CONTROLE ----------
function prepararPDFControle() {

    const dados = coletarDadosSistema();

    // ===============================
    // CAPTURA DOS AMBIENTES (NOVO MODELO)
    // ===============================

    let linhas = [];

    const ambientes = document.querySelectorAll(".blocoArea");

    ambientes.forEach((ambiente, index) => {

        const descricao = ambiente.querySelector("input[type='text']")?.value || "";

        const medidas = ambiente.querySelectorAll(".medidasContainer > div");

        let totalAmbiente = 0;
        let partes = [];

        medidas.forEach(div => {

            const inputs = div.querySelectorAll("input");

            let comp = parseFloat(
    inputs[0]?.value.replace(",", ".")
) || 0;

            let larg = parseFloat(
    inputs[1]?.value.replace(",", ".")
) || 0;
            if (comp === 0 && larg === 0) return;

            let area = comp * larg;

            totalAmbiente += area;

            partes.push({
                comprimento: comp,
                largura: larg,
                area
            });

        });

        if (descricao || totalAmbiente > 0) {

            linhas.push({
                ambiente: `Ambiente ${index + 1}`,
                descricao,
                partes,
                totalAmbiente
            });

        }

    });

    // ===============================
    // CAPTURA DOS ITENS
    // ===============================

    let itens = [];
    let totalGeral = 0;
    let totalImpostos = 0;
    let totalRT = 0;

    const itensDOM = document.querySelectorAll("#itens .blocoItem");

    itensDOM.forEach(item => {

        const descInput = item.querySelector("input[id^='desc_']");
        const quantInput = item.querySelector("input[id^='quant_']");
        const unidadeInput = item.querySelector("input[id^='unidade_']");
        const valorInput = item.querySelector("input[id^='valor_']");
        const impCheck = item.querySelector("input[id^='imp_']");
        const rtCheck = item.querySelector("input[id^='rt_']");

        const desc = descInput?.value || "";

        let quant = 0;
        if (quantInput?.dataset?.final) {
            quant = parseFloat(quantInput.dataset.final) || 0;
        } else {
            quant = parseFloat(quantInput?.value) || 0;
        }

        const unidade = unidadeInput?.value || "";
        const valor = parseFloat(valorInput?.value) || 0;

        const impostoPercent = parseFloat(imposto.value) || 0;
        const rtPercent = parseFloat(rt.value) || 0;

        const impostoAtivo = impCheck?.checked || false;
        const rtAtivo = rtCheck?.checked || false;

        if (!desc && quant === 0 && valor === 0) return;

        let base = quant * valor;

        let valorRT = rtAtivo ? base * (rtPercent / 100) : 0;

        let baseComRT = base + valorRT;
        let valorImposto = impostoAtivo ? baseComRT * (impostoPercent / 100) : 0;

        totalRT += valorRT;
        totalImpostos += valorImposto;

        let subtotal = base + valorRT + valorImposto;

        totalGeral += subtotal;

        itens.push({
            desc,
            quant,
            unidade,
            base,
            valorImposto,
            valorRT,
            subtotal,
            impostoPercent,
            rtPercent,
            impostoAtivo,
            rtAtivo
        });

    });

    // ===============================
    // MONTAGEM DO HTML
    // ===============================

    let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Controle Interno</title>
<style>
body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
h1 { text-align: center; }
.secao { margin-bottom: 15px; border: 1px solid #ccc; padding: 10px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
th, td { border: 1px solid #aaa; padding: 4px; text-align: left; }
th { background-color: #eee; }
</style>
</head>
<body>

<h1>CONTROLE INTERNO DE ORÇAMENTO</h1>

<div class="secao">
<strong>Empresa</strong><br>
${dados.empresa.nome}<br>
Documento: ${dados.empresa.documento}<br>
Telefone: ${dados.empresa.telefone}
</div>

<div class="secao">
<strong>Cliente</strong><br>
${dados.cliente.nome}<br>
Documento: ${dados.cliente.documento}<br>
Telefone: ${dados.cliente.telefone}<br>
Endereço: ${dados.cliente.endereco}
</div>

<div class="secao">
<strong>Orçamento</strong><br>
Número: ${dados.orcamento.numero}<br>
Data: ${dados.orcamento.data}<br>
Vencimento: ${dados.orcamento.vencimento}<br>
Imposto geral: ${dados.orcamento.imposto}%<br>
RT geral: ${dados.orcamento.rt}%<br>
Total Geral: R$ ${formatar(totalGeral)}
</div>
`;

    // ===============================
    // AMBIENTES (NOVO FORMATO)
    // ===============================

    // ===============================
// CALCULADORA DE ÁREA (TABELA)
// ===============================

html += `<div class="secao"><strong>Calculadora de Área</strong>
<table>
<tr>
<th>Descrição</th>
<th>Comprimento</th>
<th>Largura</th>
<th>Área (m²)</th>
</tr>
`;

let totalAreaGeral = 0;

linhas.forEach(linha => {

    linha.partes.forEach(p => {

        html += `
<tr>
<td>${linha.descricao || "-"}</td>
<td>${formatar(p.comprimento)}</td>
<td>${formatar(p.largura)}</td>
<td>${formatar(p.area)}</td>
</tr>
        `;

    });

    totalAreaGeral += linha.totalAmbiente;

});

html += `
<tr style="font-weight:bold; background:#f0f0f0;">
<td colspan="3" align="right">ÁREA TOTAL</td>
<td>${formatar(totalAreaGeral)}</td>
</tr>
</table>
</div>
`;

    // ===============================
    // TABELA DE ITENS
    // ===============================

    html += `<div class="secao"><strong>Itens do Orçamento</strong>
<table>
<tr>
<th>Descrição</th>
<th>Qtd</th>
<th>Unid</th>
<th>Valor Base</th>
<th>Imposto</th>
<th>RT</th>
<th>Subtotal Final</th>
</tr>
`;

    itens.forEach(item => {

        html += `<tr>
<td>${item.desc}</td>
<td>${formatar(item.quant)}</td>
<td>${item.unidade}</td>
<td>R$ ${formatar(item.base)}</td>
<td>${item.impostoAtivo ? `R$ ${formatar(item.valorImposto)} (${item.impostoPercent}%)` : "Desativado"}</td>
<td>${item.rtAtivo ? `R$ ${formatar(item.valorRT)} (${item.rtPercent}%)` : "Desativado"}</td>
<td><strong>R$ ${formatar(item.subtotal)}</strong></td>
</tr>`;

    });

    html += `
<tr>
<td colspan="6" align="right"><strong>Total de Impostos</strong></td>
<td>R$ ${formatar(totalImpostos)}</td>
</tr>

<tr>
<td colspan="6" align="right"><strong>Total de RT</strong></td>
<td>R$ ${formatar(totalRT)}</td>
</tr>

<tr style="font-weight:bold;">
<td colspan="6" align="right">TOTAL GERAL DO ORÇAMENTO</td>
<td>R$ ${formatar(totalGeral)}</td>
</tr>
</table></div>
`;

    html += `
<div class="secao">
<strong>Observações Internas</strong><br>
${dados.descricaoInterna || "-"}
</div>

</body>
</html>
`;

    return html;
}

// ---------- FUNÇÃO PRINCIPAL PARA GERAR PDFs ----------
async function gerarPDFs() {
    try {

        const cliente = cliente_nome.value.trim() || "SemNome";

        // ---------- PDF CLIENTE ----------
        const htmlCliente = prepararPDFCliente();
        await gerarPDFBackend(htmlCliente, `PDF Orçamento ${cliente}.pdf`);

        // Pequeno delay para evitar conflito de download
        await new Promise(resolve => setTimeout(resolve, 800));

        // ---------- PDF CONTROLE ----------
        const htmlControle = prepararPDFControle();
        await gerarPDFBackend(htmlControle, `PDF Controle ${cliente}.pdf`);

    } catch (err) {
        console.error("Erro real:", err);
        alert("Erro ao gerar PDFs.");
    }
}

// ---------- FUNÇÃO DE ENVIO AO BACKEND ----------
async function gerarPDFBackend(html, filename) {
    try {
        const response = await fetch("http://localhost:3000/gerar-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html, filename })
        });
        if (!response.ok) throw new Error("Erro no backend ao gerar PDF");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Erro ao baixar PDF:", err);
        throw err;
    }
}

// ---------- ATUALIZAÇÃO AUTOMÁTICA DO PREVIEW ----------
document.querySelectorAll("input, textarea, select").forEach(campo => {
    campo.addEventListener("input", atualizarPreview);
});

document.querySelectorAll("input, textarea, select").forEach(campo => {
    campo.addEventListener("input", atualizarPreview);
});
// ---------- ARREDONDAMENTO ----------
document.addEventListener("click", function(e){

    if(!e.target.classList.contains("btnArredCima") &&
       !e.target.classList.contains("btnArredBaixo")) return;

    const item = e.target.dataset.item;
    const campoFinal = document.getElementById(`quant_final_${item}`);
    const quantInput = document.getElementById(`quant_${item}`);

    if(!campoFinal) return;

    let valorOriginal = parseFloat(quantInput.dataset.original);

    // Se ainda não existe valor original salvo
    if(!valorOriginal){
        valorOriginal = parseFloat(quantInput.dataset.final) || 0;
        quantInput.dataset.original = valorOriginal;
    }

    const btnCima = document.querySelector(`.btnArredCima[data-item="${item}"]`);
    const btnBaixo = document.querySelector(`.btnArredBaixo[data-item="${item}"]`);

    // -------- ARREDONDAR PARA CIMA --------
    if(e.target.classList.contains("btnArredCima")){

        if(btnCima.dataset.ativo){
            // Reverter
            campoFinal.value = valorOriginal.toFixed(2);
            quantInput.dataset.final = valorOriginal;
            btnCima.innerText = "Arred ↑";
            delete btnCima.dataset.ativo;
        } else {
            let novo = Math.ceil(valorOriginal);
            campoFinal.value = novo.toFixed(2);
            quantInput.dataset.final = novo;

            btnCima.innerText = "Reverter";
            btnCima.dataset.ativo = true;

            btnBaixo.innerText = "Arred ↓";
            delete btnBaixo.dataset.ativo;
        }
    }

    // -------- ARREDONDAR PARA BAIXO --------
    if(e.target.classList.contains("btnArredBaixo")){

        if(btnBaixo.dataset.ativo){
            campoFinal.value = valorOriginal.toFixed(2);
            quantInput.dataset.final = valorOriginal;
            btnBaixo.innerText = "Arred ↓";
            delete btnBaixo.dataset.ativo;
        } else {
            let novo = Math.floor(valorOriginal);
            campoFinal.value = novo.toFixed(2);
            quantInput.dataset.final = novo;

            btnBaixo.innerText = "Reverter";
            btnBaixo.dataset.ativo = true;

            btnCima.innerText = "Arred ↑";
            delete btnCima.dataset.ativo;
        }
    }

    calcularTotal();
    atualizarPreview();
});

function salvarNoStorage(){

    const dados = {

        contadorArea,
        contadorItens,

        camposFixos: {
            tituloOrcamento: tituloOrcamento.value,
            empresa_nome: empresa_nome.value,
            empresa_doc: empresa_doc.value,
            empresa_tel: empresa_tel.value,
            cliente_nome: cliente_nome.value,
            cliente_doc: cliente_doc.value,
            cliente_tel: cliente_tel.value,
            cliente_endereco: cliente_endereco.value,
            numero_orcamento: numero_orcamento.value,
            data_orcamento: data_orcamento.value,
            validade_dias: validade_dias.value,
            imposto: imposto.value,
            rt: rt.value,
            descricao_interna: descricao_interna.value,
            descricao_cliente: descricao_cliente.value
        },

        ambientes: [],
        itens: []
    };

    // ---------- SALVAR AMBIENTES ----------
    document.querySelectorAll(".blocoArea").forEach(ambiente => {

        const descricao = ambiente.querySelector("input[type='text']")?.value || "";
        const medidas = [];

        ambiente.querySelectorAll(".medidasContainer > div").forEach(div => {

            const inputs = div.querySelectorAll("input");

            medidas.push({
                comprimento: inputs[0]?.value || "",
                largura: inputs[1]?.value || ""
            });

        });

        dados.ambientes.push({ descricao, medidas });

    });

    // ---------- SALVAR ITENS ----------
    document.querySelectorAll(".blocoItem").forEach((item, index) => {

        const i = index + 1;

        dados.itens.push({

            desc: document.getElementById(`desc_${i}`)?.value || "",
            quant: document.getElementById(`quant_${i}`)?.value || "",
            perc: document.getElementById(`perc_${i}`)?.value || "",
            quantFinal: document.getElementById(`quant_${i}`)?.dataset.final || "",
            unidade: document.getElementById(`unidade_${i}`)?.value || "",
            valor: document.getElementById(`valor_${i}`)?.value || "",
            imp: document.getElementById(`imp_${i}`)?.checked || false,
            rt: document.getElementById(`rt_${i}`)?.checked || false
        });

    });

    localStorage.setItem("orcamentoFacil", JSON.stringify(dados));
}
function reativarEventos(){

    document.querySelectorAll(".blocoArea")
        .forEach(b => ativarDuploCliqueMinimizar(b, "area"));

    document.querySelectorAll(".blocoItem")
        .forEach(b => {
            ativarDuploCliqueMinimizar(b, "item");
            ativarDragItem(b);
        });
}

function novoOrcamento(){

    if(!confirm("O novo orçamento apagará todos os dados atuais")){
        return;
    }

    // Limpa localStorage
    localStorage.removeItem("orcamentoFacil");

    // Zera contadores
    contadorArea = 0;
    contadorItens = 0;

    // Limpa áreas dinâmicas
    document.getElementById("linhasArea").innerHTML = "";
    document.getElementById("itens").innerHTML = "";

    // Limpa todos inputs e textareas
    document.querySelectorAll("input, textarea").forEach(campo => {

        if(campo.type === "checkbox"){
            campo.checked = true; // mantém padrão marcado
        } else if(campo.type === "number"){
            campo.value = "";
        } else {
            campo.value = "";
        }

        delete campo.dataset.final;
        delete campo.dataset.original;
    });

    // Valores padrão importantes
    imposto.value = 0;
    rt.value = 0;
    validade_dias.value = 30;

    document.getElementById("total").innerText = "0,00";
    document.getElementById("totalArea").innerText = "0,00";

    atualizarData();
    atualizarVencimento();
    atualizarPreview();
}
</script>
</body>
</html>
