let logoBase64 = localStorage.getItem("logoBase64") || "";

const inputLogo = document.getElementById("empresa_logo");

inputLogo.addEventListener("change", function(){

  const file = inputLogo.files[0];

  if(!file) return;

  if(file.size > 500000){
    alert("Logo muito grande (máx 500KB)");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e){
    logoBase64 = e.target.result;

    localStorage.setItem("logoBase64", logoBase64);

    if(typeof atualizarPreview === "function"){
    atualizarPreview();
}

alert("Logo carregado com sucesso!");

  reader.readAsDataURL(file);
});

// 🔴 BOTÃO REMOVER LOGO (COM CONFIRMAÇÃO)
const btnRemoverLogo = document.getElementById("removerLogoBtn");

if(btnRemoverLogo){
  btnRemoverLogo.addEventListener("click", function(){

    const confirmar = confirm("Tem certeza que deseja remover a logomarca?");

    if(!confirmar){
      return;
    }

    // limpa variável
    logoBase64 = "";

    // limpa storage
    localStorage.removeItem("logoBase64");

    // limpa input
    inputLogo.value = "";

    // atualiza preview
    if(typeof atualizarPreview === "function"){
      atualizarPreview();
    }

    alert("Logo removido com sucesso!");

  });
}