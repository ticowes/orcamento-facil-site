export const painel = `<!doctype html>
<html lang="pt-BR">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Painel de cupons · Orçamento Fácil</title>
<style nonce="NONCE_PAINEL">
:root{font:16px/1.45 system-ui,sans-serif;color:#212832;background:#f2efe9}
*{box-sizing:border-box} body{margin:0} main{max-width:820px;margin:auto;padding:24px 16px}
h1{font-size:clamp(1.6rem,5vw,2.2rem);margin:0 0 16px} h2{font-size:1.2rem;margin:0 0 12px}
section,form{display:grid;gap:12px} form{max-width:440px} [hidden]{display:none!important}
.bloco{background:white;border:1px solid #d8d1c8;border-radius:10px;padding:16px;margin-bottom:16px}
.linha{display:flex;align-items:center;flex-wrap:wrap;gap:8px} .colunas{display:grid;grid-template-columns:1fr 1fr;gap:10px}
input,button{font:inherit;border-radius:6px;border:1px solid #767f89;min-height:44px;padding:8px 10px}
input{width:100%;min-width:0} button{cursor:pointer;color:#203047;background:white} button.primary{color:white;background:#284f76;border-color:#284f76}
button:disabled{opacity:.65;cursor:wait} label{display:grid;gap:4px} p{margin:0} ul{padding:0;margin:0;list-style:none}
li{padding:10px 0;border-bottom:1px solid #ddd} li .linha{justify-content:space-between}
.codigo{overflow-wrap:anywhere;font:600 1rem ui-monospace,monospace}
#erro{color:#9d2019;margin:10px 0} #resultado{border-left:4px solid #284f76;padding:10px;background:#eef4fa}
</style>
<main>
  <h1>Painel de cupons</h1>
  <p id="erro" role="alert"></p>
  <section id="acesso" class="bloco" hidden>
    <h2 id="titulo-acesso">Entrar</h2>
    <form id="form-acesso" method="post">
      <label id="campo-nome">Nome deste aparelho <input name="nome" maxlength="60" placeholder="Celular pessoal"></label>
      <label id="campo-convite">Convite de cadastro <input name="convite" autocomplete="off" spellcheck="false"></label>
      <label>Senha administrativa <input name="senha" type="password" maxlength="200" required></label>
      <div><button class="primary" id="botao-acesso">Entrar</button></div>
    </form>
  </section>
  <section id="painel" hidden>
    <section class="bloco">
      <h2>Criar cupom de 100%</h2>
      <form id="novo-cupom" method="post">
        <label>Identificação interna <input name="nome" maxlength="120" placeholder="Nome ou campanha"></label>
        <div class="colunas">
          <label>Validade em dias <input name="dias" type="number" min="1" max="90" value="7" required></label>
          <label>Gerações por dia <input name="limite" type="number" min="1" max="100" value="3" required></label>
        </div>
        <div><button class="primary">Gerar código</button></div>
      </form>
      <div id="resultado" aria-live="polite" hidden>
        <p id="rotulo-codigo"></p>
        <p class="codigo" id="codigo"></p>
        <button type="button" id="copiar">Copiar código</button>
      </div>
    </section>
    <section class="bloco"><h2>Cupons emitidos</h2><ul id="cupons"></ul></section>
    <section class="bloco"><h2>Aparelhos autorizados</h2><ul id="aparelhos"></ul><div class="linha">
      <button type="button" id="convidar">Convidar aparelho</button>
      <button type="button" id="sair">Sair</button>
    </div></section>
  </section>
</main>
<script nonce="NONCE_PAINEL">
const porId = id => document.getElementById(id);
const erro = porId("erro");
const form = porId("form-acesso");
const formatarData = new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"});
let estado;
async function api(acao, dados = {}) {
  const resp = await fetch(location.pathname, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({acao,...dados})});
  if (!resp.ok) {
    const info = await resp.json().catch(() => ({}));
    if (resp.status === 401 && estado?.autenticado) mostrarAcesso({configurado:true,cadastrado:true});
    throw Error(info.error || "Não foi possível concluir a operação.");
  }
  return resp.json();
}
function mostrarAcesso(novoEstado) {
  estado=novoEstado;
  porId("acesso").hidden=false;
  porId("painel").hidden=true;
  const cadastrar=!estado.cadastrado;
  porId("campo-nome").hidden=!cadastrar;
  porId("campo-convite").hidden=!cadastrar;
  form.nome.required=cadastrar;
  form.convite.required=cadastrar;
  form.senha.autocomplete=estado.configurado?"current-password":"new-password";
  form.senha.minLength=estado.configurado?0:16;
  porId("titulo-acesso").textContent=cadastrar ? (estado.configurado?"Autorizar este aparelho":"Configurar o primeiro aparelho") : "Entrar";
  porId("botao-acesso").textContent=cadastrar?"Autorizar aparelho":"Entrar";
}
function tratar(elemento, evento, executar) {
  elemento.addEventListener(evento,async e=>{
    e.preventDefault();
    const botao=elemento instanceof HTMLFormElement ? elemento.querySelector("button") : elemento;
    if(botao.disabled) return;
    botao.disabled=true;
    erro.textContent="";
    try{await executar();}catch(e){erro.textContent=e.message;}finally{botao.disabled=false;}
  });
}
function mostrarCodigo(rotulo,codigo) {
  porId("rotulo-codigo").textContent=rotulo;
  porId("codigo").textContent=codigo;
  porId("copiar").textContent="Copiar código";
  porId("resultado").hidden=false;
  porId("resultado").scrollIntoView({block:"nearest"});
}
function preencherLista(elemento,itens,render) {
  elemento.replaceChildren();
  for(const item of itens){
    const li=document.createElement("li");
    const linha=document.createElement("div");
    linha.className="linha";
    render(linha,item);
    li.append(linha);
    elemento.append(li);
  }
  if(!itens.length){const li=document.createElement("li");li.textContent="Nenhum registro.";elemento.append(li);}
}
function linhaLista(linha,texto,acao){
  const info=document.createElement("span");
  info.textContent=texto;
  linha.append(info);
  if(acao){
    const botao=document.createElement("button");
    botao.type="button";botao.textContent="Revogar";
    tratar(botao,"click",async()=>{if(confirm("Revogar este acesso?")){await acao();await listar();}});
    linha.append(botao);
  }
}
async function listar() {
  const {cupons,aparelhos}=await api("listar");
  preencherLista(porId("cupons"),cupons,(linha,cupom)=>{
    const situacao=cupom.revogado?"Revogado":cupom.expira<=Date.now()?"Expirado":cupom.usadosHoje+"/"+cupom.limite+" usados hoje";
    linhaLista(linha,(cupom.nome||"Sem identificação")+" · "+situacao+" · "+formatarData.format(cupom.expira),cupom.revogado?null:()=>api("revogar-cupom",{id:cupom.id}));
  });
  preencherLista(porId("aparelhos"),aparelhos,(linha,aparelho)=>linhaLista(linha,aparelho.nome+(aparelho.atual?" · Este aparelho":""),aparelho.atual?null:()=>api("revogar-aparelho",{id:aparelho.id})));
}
async function mostrarPainel(){
  await listar();
  estado={configurado:true,cadastrado:true,autenticado:true};
  porId("acesso").hidden=true;porId("painel").hidden=false;
}
tratar(form,"submit",async()=>{
  const dados=Object.fromEntries(new FormData(form));
  try{
    if(!estado.cadastrado) await api("cadastrar",dados);
    await api("entrar",{senha:dados.senha});
    form.reset();
    await mostrarPainel();
  }finally{form.senha.value="";}
});
tratar(porId("novo-cupom"),"submit",async()=>{
  const dados=Object.fromEntries(new FormData(porId("novo-cupom")));
  const cupom=await api("criar",{nome:dados.nome,dias:Number(dados.dias),limite:Number(dados.limite)});
  mostrarCodigo("Cupom criado · expira em "+formatarData.format(cupom.expira),cupom.codigo);
  await listar();
});
tratar(porId("copiar"),"click",async()=>{await navigator.clipboard.writeText(porId("codigo").textContent);porId("copiar").textContent="Copiado";});
tratar(porId("convidar"),"click",async()=>{const {convite}=await api("convidar");mostrarCodigo("Convite de uso único · válido por 10 minutos",convite);});
tratar(porId("sair"),"click",async()=>{await api("sair");porId("resultado").hidden=true;porId("codigo").textContent="";mostrarAcesso(await api("estado"));});
api("estado").then(atual=>atual.autenticado?mostrarPainel():mostrarAcesso(atual)).catch(e=>{erro.textContent=e.message;});
</script>
</html>`;
