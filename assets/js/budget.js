document.addEventListener("DOMContentLoaded", function () {
  const minimumBudget = 25000;
  const maximumSelf = 2000;
  const minimumFood = 4500;
  const minimumMubbi = 100;
  const minimumBackup = 15000;
  const idaIncomeInput = document.getElementById("idaIncome");
  const jeppeIncomeInput = document.getElementById("jeppeIncome");
  const currentBackupInput = document.getElementById("currentBackup");
  const calcButton = document.getElementById("calcButton");

  function checkInputs() {
    const idaIncomeValue = idaIncomeInput.value.trim();
    const jeppeIncomeValue = jeppeIncomeInput.value.trim();
    const currentBackupValue = currentBackupInput.value.trim();

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

  idaIncomeInput.addEventListener("input", checkInputs);
  jeppeIncomeInput.addEventListener("input", checkInputs);
  currentBackupInput.addEventListener("input", checkInputs);
  calcButton.addEventListener("click", calculateTransfers);

  function calculateTransfers() {
    const idaContainer = document.getElementById("idaContainer");
    const idaIncome = parseFloat(document.getElementById("idaIncome").value);
    const jeppeIncome = parseFloat(document.getElementById("jeppeIncome").value);
    const totalBudget = parseFloat(idaIncome) + parseFloat(jeppeIncome);
    const currentBackup = parseFloat(currentBackupInput.value.trim());
    const backupNeeded = Math.max(0, minimumBackup - currentBackup);
    const totalIncome = idaIncome + jeppeIncome;

    // Calculate Ida's portions
    let idaBudget = Math.round((idaIncome / totalBudget) * minimumBudget);
    let idaFood = Math.round((idaIncome / totalBudget) * minimumFood);
    let idaMubbi = Math.round((idaIncome / totalBudget) * minimumMubbi);
    let idaLeft = Math.round(idaIncome - idaBudget - idaFood - idaMubbi);

    // Priority 1: Self amount (up to maximum)
    let idaSelf = Math.min(idaLeft, maximumSelf);
    idaLeft -= idaSelf;

    // Priority 2: Calculate portion of backup needed
    let idaBackup = 0;
    let idaHouse = 0;

    if (idaLeft > 0) {
      let idaBackupPortion = Math.round((idaIncome / totalIncome) * backupNeeded);
      idaBackup = Math.min(idaLeft, idaBackupPortion);
      idaHouse = idaLeft - idaBackup;
    }

    const idaBudgetHtml = createHtmlElement("Budget", idaBudget);
    const idaBackupHtml = createHtmlElement("Opsparing", idaBackup);
    const idaFoodHtml = createHtmlElement("Mad", idaFood);
    const idaMubbiHtml = createHtmlElement("Mubbi", idaMubbi);
    const idaHouseHtml = createHtmlElement("Hus", idaHouse);
    const idaLeftHtml = createHtmlElement("Selv", idaSelf);

    document.getElementById("idaContainer").innerHTML = `
            <h3><b>👸</b></h3>
            ${idaBudgetHtml}
            ${idaBackupHtml}
            ${idaFoodHtml}
            ${idaMubbiHtml}
            ${idaHouseHtml}
            ${idaLeftHtml}
        `;

    // Calculate Jeppe's portions
    let jeppeBudget = Math.round((jeppeIncome / totalBudget) * minimumBudget);
    let jeppeFood = Math.round((jeppeIncome / totalBudget) * minimumFood);
    let jeppeMubbi = Math.round((jeppeIncome / totalBudget) * minimumMubbi);
    let jeppeLeft = Math.round(jeppeIncome - jeppeBudget - jeppeFood - jeppeMubbi);

    // Priority 1: Self amount (up to maximum)
    let jeppeSelf = Math.min(jeppeLeft, maximumSelf);
    jeppeLeft -= jeppeSelf;

    // Priority 2: Calculate portion of backup needed
    let jeppeBackup = 0;
    let jeppeHouse = 0;

    if (jeppeLeft > 0) {
      let jeppeBackupPortion = Math.round((jeppeIncome / totalIncome) * backupNeeded);
      jeppeBackup = Math.min(jeppeLeft, jeppeBackupPortion);
      jeppeHouse = jeppeLeft - jeppeBackup;
    }

    const jeppeBudgetHtml = createHtmlElement("Budget", jeppeBudget);
    const jeppeBackupHtml = createHtmlElement("Opsparing", jeppeBackup);
    const jeppeFoodHtml = createHtmlElement("Mad", jeppeFood);
    const jeppeMubbiHtml = createHtmlElement("Mubbi", jeppeMubbi);
    const jeppeHouseHtml = createHtmlElement("Hus", jeppeHouse);
    const jeppeLeftHtml = createHtmlElement("Selv", jeppeSelf);

    document.getElementById("jeppeContainer").innerHTML = `
            <h3><b>🤴</b></h3>
            ${jeppeBudgetHtml}
            ${jeppeBackupHtml}
            ${jeppeFoodHtml}
            ${jeppeMubbiHtml}
            ${jeppeHouseHtml}
            ${jeppeLeftHtml}
        `;

    let totalHouse = idaHouse + jeppeHouse;
    const totalHouseHtml = createHtmlElement("Hus", totalHouse);

    document.getElementById("totalContainer").innerHTML = `
            <h3><b>Samlet</b></h3>
            ${totalHouseHtml}
        `;
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
