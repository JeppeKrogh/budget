document.addEventListener("DOMContentLoaded", function () {
  const minimumBudget = 22500;
  const maximumSelf = 2000;
  const minimumFood = 4500;
  const minimumMubbi = 100;
  const minimumBackup = 15000;
  const idaIncomeInput = document.getElementById("idaIncome");
  const jeppeIncomeInput = document.getElementById("jeppeIncome");
  const currentBackupInput = document.getElementById("currentBackup");
  const calcButton = document.getElementById("calcButton");

  // Function to check if both input fields have values
  function checkInputs() {
    const idaIncomeValue = idaIncomeInput.value.trim();
    const jeppeIncomeValue = jeppeIncomeInput.value.trim();
    const currentBackupValue = currentBackupInput.value.trim();

    // Enable the button if both input fields have values, otherwise disable it
    calcButton.disabled = !(
      idaIncomeValue &&
      jeppeIncomeValue &&
      currentBackupValue
    );
  }

  setPredefinedValues(
    minimumBudget,
    minimumFood,
    minimumMubbi,
    maximumSelf,
    minimumBackup,
  );

  // Add event listeners to the input fields
  idaIncomeInput.addEventListener("input", checkInputs);
  jeppeIncomeInput.addEventListener("input", checkInputs);
  currentBackupInput.addEventListener("input", checkInputs);
  calcButton.addEventListener("click", calculateTransfers);

  function calculateTransfers() {
    const idaContainer = document.getElementById("idaContainer");
    const idaIncome = parseFloat(document.getElementById("idaIncome").value);
    const jeppeIncome = parseFloat(
      document.getElementById("jeppeIncome").value,
    );
    const totalBudget = parseFloat(idaIncome) + parseFloat(jeppeIncome);
    const backupDiff =
      parseFloat(minimumBackup) - parseFloat(currentBackupInput.value.trim());

    let idaBudget = Math.round((idaIncome / totalBudget) * minimumBudget);
    let idaFood = Math.round((idaIncome / totalBudget) * minimumFood);
    let idaMubbi = Math.round((idaIncome / totalBudget) * minimumMubbi);
    let idaBackup = Math.round((idaIncome / totalBudget) * backupDiff);
    let idaLeft = Math.round(
      idaIncome - idaBudget - idaFood - idaMubbi - idaBackup,
    );

    let idaAmountAbove = idaLeft - maximumSelf;
    idaLeft = idaLeft - idaAmountAbove;
    idaHouse = idaAmountAbove;

    idaContainer.innerHTML = "";

    const idaBudgetHtml = createHtmlElement("Budget", idaBudget);
    const idaBackupHtml = createHtmlElement("Opsparing", idaBackup);
    const idaFoodHtml = createHtmlElement("Mad", idaFood);
    const idaMubbiHtml = createHtmlElement("Mubbi", idaMubbi);
    const idaHouseHtml = createHtmlElement("Hus", idaHouse);
    const idaLeftHtml = createHtmlElement("Selv", idaLeft);

    const idaHtml = `
    <h3><b>👸</b></h3>
    ${idaBudgetHtml}
    ${idaBackupHtml}
    ${idaFoodHtml}
    ${idaMubbiHtml}
    ${idaHouseHtml}
    ${idaLeftHtml}
  `;

    document.getElementById("idaContainer").innerHTML = idaHtml;

    let jeppeBudget = Math.round((jeppeIncome / totalBudget) * minimumBudget);
    let jeppeSaving = Math.round(jeppeIncome / totalBudget);
    let jeppeFood = Math.round((jeppeIncome / totalBudget) * minimumFood);
    let jeppeMubbi = Math.round((jeppeIncome / totalBudget) * minimumMubbi);
    let jeppeBackup = Math.round((jeppeIncome / totalBudget) * backupDiff);
    let jeppeLeft = Math.round(
      jeppeIncome - jeppeBudget - jeppeSaving - jeppeFood - jeppeMubbi,
    );

    let jeppeAmountAbove = jeppeLeft - maximumSelf;
    jeppeLeft = jeppeLeft - jeppeAmountAbove;
    jeppeHouse = jeppeAmountAbove;

    const jeppeBudgetHtml = createHtmlElement("Budget", jeppeBudget);
    const jeppeBackupHtml = createHtmlElement("Opsparing", jeppeBackup);
    const jeppeFoodHtml = createHtmlElement("Mad", jeppeFood);
    const jeppeMubbiHtml = createHtmlElement("Mubbi", jeppeMubbi);
    const jeppeHouseHtml = createHtmlElement("Hus", jeppeHouse);
    const jeppeLeftHtml = createHtmlElement("Selv", jeppeLeft);

    const jeppeHtml = `
    <h3><b>🤴</b></h3>
    ${jeppeBudgetHtml}
    ${jeppeBackupHtml}
    ${jeppeFoodHtml}
    ${jeppeMubbiHtml}
    ${jeppeHouseHtml}
    ${jeppeLeftHtml}
  `;

    document.getElementById("jeppeContainer").innerHTML = jeppeHtml;

    let totalHouse = idaHouse + jeppeHouse;
    const totalHouseHtml = createHtmlElement("Hus", totalHouse);

    const totalHtml = `
    <h3><b>Samlet</b></h3>
    ${totalHouseHtml}
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
/*
CHANGELOG:
1/11 2023:
- Changed food from 3000 to 3500.
- Added 100kr combined to børneopsparing.

25/9 2024:
- Changed food from 4000 to 4500.
*/
