document.addEventListener("DOMContentLoaded", function () {
  const minimumBudget = 25000;
  const maximumSelf = 2000;
  const minimumFood = 4500;
  const minimumMubbi = 100;
  const minimumHouse = 5000;
  const idaIncomeInput = document.getElementById("idaIncome");
  const jeppeIncomeInput = document.getElementById("jeppeIncome");
  const calcButton = document.getElementById("calcButton");

  function checkInputs() {
    calcButton.disabled = !(
      idaIncomeInput.value.trim() && jeppeIncomeInput.value.trim()
    );
  }

  setPredefinedValues(
    minimumBudget,
    minimumFood,
    minimumMubbi,
    maximumSelf,
    minimumHouse,
  );

  idaIncomeInput.addEventListener("input", checkInputs);
  jeppeIncomeInput.addEventListener("input", checkInputs);
  calcButton.addEventListener("click", calculateTransfers);

  function calculateTransfers() {
    const idaIncome = parseFloat(idaIncomeInput.value);
    const jeppeIncome = parseFloat(jeppeIncomeInput.value);
    const totalBudget = idaIncome + jeppeIncome;

    // ========== IDA ==========
    let idaBudget = Math.round((idaIncome / totalBudget) * minimumBudget);
    let idaFood = Math.round((idaIncome / totalBudget) * minimumFood);
    let idaMubbi = Math.round((idaIncome / totalBudget) * minimumMubbi);
    let idaHus = Math.round((idaIncome / totalBudget) * minimumHouse);

    let idaLeft = Math.round(
      idaIncome - idaBudget - idaFood - idaMubbi - idaHus,
    );

    let idaAmountAbove = idaLeft - maximumSelf;
    idaLeft = idaLeft - idaAmountAbove;
    let idaRest = Math.max(idaAmountAbove, 0);

    const idaHtml = `
      <h3><b>👸</b></h3>
      ${createHtmlElement("Budget", idaBudget)}
      ${createHtmlElement("Hus", idaHus)}
      ${createHtmlElement("Mad", idaFood)}
      ${createHtmlElement("Mubbi", idaMubbi)}
      ${createHtmlElement("Selv", idaLeft)}
    `;
    document.getElementById("idaContainer").innerHTML = idaHtml;

    // ========== JEPPE ==========
    let jeppeBudget = Math.round((jeppeIncome / totalBudget) * minimumBudget);
    let jeppeFood = Math.round((jeppeIncome / totalBudget) * minimumFood);
    let jeppeMubbi = Math.round((jeppeIncome / totalBudget) * minimumMubbi);
    let jeppeHus = Math.round((jeppeIncome / totalBudget) * minimumHouse);

    let jeppeLeft = Math.round(
      jeppeIncome - jeppeBudget - jeppeFood - jeppeMubbi - jeppeHus,
    );

    let jeppeAmountAbove = jeppeLeft - maximumSelf;
    jeppeLeft = jeppeLeft - jeppeAmountAbove;
    let jeppeRest = Math.max(jeppeAmountAbove, 0);

    const jeppeHtml = `
      <h3><b>🤴</b></h3>
      ${createHtmlElement("Budget", jeppeBudget)}
      ${createHtmlElement("Hus", jeppeHus)}
      ${createHtmlElement("Mad", jeppeFood)}
      ${createHtmlElement("Mubbi", jeppeMubbi)}
      ${createHtmlElement("Selv", jeppeLeft)}
    `;
    document.getElementById("jeppeContainer").innerHTML = jeppeHtml;

    // ========== TOTAL ==========
    let totalHus = idaHus + jeppeHus;
    let totalRest = idaRest + jeppeRest;

    const totalHtml = `
      <h3><b>Samlet</b></h3>
      ${createHtmlElement("Rest", totalRest)}
    `;
    document.getElementById("totalContainer").innerHTML = totalHtml;
  }

  function createHtmlElement(title, value) {
    return `<div><span>${title}</span><span>${value}</span></div>`;
  }

  function setPredefinedValues(
    minimumBudget,
    minimumFood,
    minimumMubbi,
    maximumSelf,
    minimumBackup,
  ) {
    document.getElementById("minimumBudget").innerText = minimumBudget;
    document.getElementById("minimumFood").innerText = minimumFood;
    document.getElementById("minimumMubbi").innerText = minimumMubbi;
    document.getElementById("maximumSelf").innerText = maximumSelf;
    document.getElementById("minimumBackup").innerText = minimumBackup;
  }
});
