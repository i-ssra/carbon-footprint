console.log("✅ Script chargé");

let chartCO2 = null;

// Lecture sécurisée des champs
function val(id) {
  const el = document.getElementById(id);
  if(!el) return 0;
  return Number(el.value) || 0;
}

// Calcul bilan carbone
function calculate() {
  const company = document.getElementById("companyName")?.value || "Entreprise";
  const employees = val("employees");

  // Scope 1
  const fuel = val("fuel");
  const companyCarsKm = val("companyCarsKm");
  const gaz = val("gaz");

  // Scope 2
  const electricity = val("electricity");
  const heating = val("heating");

  // Scope 3
  const commuteKm = val("commuteKm");
  const commuteType = document.getElementById("commuteType")?.value || "car";

  const FE = {
    fuel: 2.68,
    gaz: 1300,
    carKm: 0.192,
    electricity: 0.056,
    heating: 0.20,
    commute: {car:0.192, public:0.05, bike:0}
  };

  const scope1 = fuel*FE.fuel + gaz*FE.gaz + companyCarsKm*FE.carKm;
  const scope2 = electricity*FE.electricity + heating*FE.heating;
  const scope3 = commuteKm*FE.commute[commuteType]*employees*220;
  const total = scope1 + scope2 + scope3;

  let score = "E – Critique";
  let comment = "⚠️ Attention : émissions très élevées !";
  if(total < 5000) { score="A – Excellent"; comment="Bilan carbone excellent.";}
  else if(total<15000) { score="B – Faible"; comment="Bilan carbone faible, très bien.";}
  else if(total<30000) { score="C – Moyen"; comment="Bilan carbone moyen, possibilités d’amélioration.";}
  else if(total<60000) { score="D – Élevé"; comment="Bilan carbone élevé, actions nécessaires.";}

  const reportDiv = document.getElementById("result");
  reportDiv.innerHTML = `
    <h3>Rapport récapitulatif – ${company}</h3>
    <ul>
      <li><strong>Scope 1 :</strong> ${scope1.toFixed(2)} kg CO₂e</li>
      <li><strong>Scope 2 :</strong> ${scope2.toFixed(2)} kg CO₂e</li>
      <li><strong>Scope 3 :</strong> ${scope3.toFixed(2)} kg CO₂e</li>
    </ul>
    <p><strong>Total CO₂ :</strong> ${total.toFixed(2)} kg CO₂e</p>
    <p><strong>Score carbone :</strong> ${score}</p>
    <p><strong>Commentaire :</strong> ${comment}</p>
  `;

  // Graphique
  const ctx = document.getElementById("graphCO2").getContext("2d");
  if(chartCO2) chartCO2.destroy();
  chartCO2 = new Chart(ctx, {
    type:"pie",
    data:{
      labels:["Scope 1","Scope 2","Scope 3"],
      datasets:[{
        data:[scope1, scope2, scope3],
        backgroundColor:["#e74c3c","#3498db","#f1c40f"]
      }]
    },
    options:{responsive:true}
  });
}

// PWA install
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";

  installBtn.addEventListener("click", ()=>{
    installBtn.style.display = "none";
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(()=>{deferredPrompt=null;});
  });
});

// Service Worker
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker
      .register("service-worker.js")
      .then(()=>console.log("✅ Service Worker registered"))
      .catch(err=>console.error("❌ SW error:",err));
  });
}
