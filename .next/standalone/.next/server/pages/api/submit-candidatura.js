"use strict";(()=>{var e={};e.id=572,e.ids=[572],e.modules={3480:(e,a,t)=>{e.exports=t(5600)},4237:(e,a,t)=>{t.r(a),t.d(a,{config:()=>u,default:()=>d,routeModule:()=>c});var s={};t.r(s),t.d(s,{default:()=>i});var o=t(3480),r=t(8667),n=t(6435);async function i(e,a){if("POST"!==e.method)return a.status(405).json({success:!1,message:"M\xe9todo n\xe3o permitido"});try{let{nome:t,telefone:s,email:o,idade:r,cidade:n,estado:i,vagaId:d,vagaTitulo:u,vagaEmpresa:c,vagaLocalizacao:m,trabalhouAntes:p,ultimoEmprego:l,tempoUltimoEmprego:A,motivoDemissao:P,salarioAnterior:f,experienciaAnos:E,disponibilidade:g,pretensaoSalarial:$,observacoes:S,fonte:x,utm_source:b,utm_medium:I,utm_campaign:v}=e.body;if(!t||!s||!o)return a.status(400).json({success:!1,message:"Nome, telefone e email s\xe3o obrigat\xf3rios"});let M={nome:t,telefone:s,email:o,empresa:c,mensagem:`CANDIDATURA - ${u}
Vaga: ${u}
Empresa: ${c}
Localiza\xe7\xe3o: ${m}
ID da Vaga: ${d}

DADOS PESSOAIS:
Idade: ${r}
Cidade: ${n}
Estado: ${i}

EXPERI\xcaNCIA PROFISSIONAL:
Trabalhou antes: ${p}
\xdaltimo emprego: ${l}
Tempo no \xfaltimo emprego: ${A}
Motivo da demiss\xe3o: ${P}
Sal\xe1rio anterior: ${f}
Anos de experi\xeancia: ${E}

PREFER\xcaNCIAS:
Disponibilidade: ${g}
Pretens\xe3o salarial: ${$}

OBSERVA\xc7\xd5ES:
${S}

TRACKING:
Fonte: ${x}
UTM Source: ${b}
UTM Medium: ${I}
UTM Campaign: ${v}`},h=await fetch("https://worker-job-board-backend-leonardosilvas2.replit.app/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(M)}),j=await h.json();if(!h.ok)return a.status(h.status).json({success:!1,message:j.message||"Erro ao salvar candidatura"});a.status(200).json({success:!0,message:"Candidatura enviada com sucesso!"})}catch(e){console.error("Erro ao processar candidatura:",e),a.status(500).json({success:!1,message:"Erro interno do servidor"})}}let d=(0,n.M)(s,"default"),u=(0,n.M)(s,"config"),c=new o.PagesAPIRouteModule({definition:{kind:r.A.PAGES_API,page:"/api/submit-candidatura",pathname:"/api/submit-candidatura",bundlePath:"",filename:""},userland:s})},5600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6435:(e,a)=>{Object.defineProperty(a,"M",{enumerable:!0,get:function(){return function e(a,t){return t in a?a[t]:"then"in a&&"function"==typeof a.then?a.then(a=>e(a,t)):"function"==typeof a&&"default"===t?a:void 0}}})},8667:(e,a)=>{Object.defineProperty(a,"A",{enumerable:!0,get:function(){return t}});var t=function(e){return e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE",e.IMAGE="IMAGE",e}({})}};var a=require("../../webpack-api-runtime.js");a.C(e);var t=a(a.s=4237);module.exports=t})();