


document.addEventListener('DOMContentLoaded', function () {
  const minimumBudget = 21104;
  const maximumSelf = 2500;
  const minimumFood = 4000;
  const minimumMubbi = 100;
  const idaIncomeInput = document.getElementById('idaIncome');
  const jeppeIncomeInput = document.getElementById('jeppeIncome');
  const calcButton = document.getElementById('calcButton');

  // Function to check if both input fields have values
  function checkInputs() {
    const idaIncomeValue = idaIncomeInput.value.trim();
    const jeppeIncomeValue = jeppeIncomeInput.value.trim();

    // Enable the button if both input fields have values, otherwise disable it
    calcButton.disabled = !(idaIncomeValue && jeppeIncomeValue);
  }

  setPredefinedValues(minimumBudget, minimumFood, minimumMubbi, maximumSelf);

  // Add event listeners to the input fields
  idaIncomeInput.addEventListener('input', checkInputs);
  jeppeIncomeInput.addEventListener('input', checkInputs);
  calcButton.addEventListener('click', calculateTransfers);


  function calculateTransfers() {
    const idaContainer = document.getElementById('idaContainer');
    const idaIncome = parseFloat(document.getElementById('idaIncome').value);
    const jeppeIncome = parseFloat(document.getElementById('jeppeIncome').value);
    const totalBudget = parseFloat(idaIncome) + parseFloat(jeppeIncome);

    let idaBudget = Math.round((idaIncome / totalBudget) * minimumBudget);
    let idaSaving = Math.round((idaIncome / totalBudget));
    let idaFood = Math.round((idaIncome / totalBudget) * minimumFood);
    let idaMubbi = Math.round((idaIncome / totalBudget) * minimumMubbi);
    let idaSelf = Math.round(idaIncome - idaBudget - idaSaving - idaFood - idaMubbi);

    if (idaSelf > maximumSelf) {
      let amountAbove = idaSelf - maximumSelf;
      idaSelf = idaSelf - amountAbove;
      idaSaving = idaSaving + amountAbove;
    }

    idaContainer.innerHTML = "";


    const idaBudgetHtml = createHtmlElement("Budget", idaBudget);
    const idaSavingHtml = createHtmlElement("Opsparing", idaSaving);
    const idaFoodHtml = createHtmlElement("Mad", idaFood);
    const idaMubbiHtml = createHtmlElement("Mubbi", idaMubbi);
    const idaSelfHtml = createHtmlElement("Selv", idaSelf);

    const idaHtml = `
    <h3><b>👩</b></h3>
    ${idaBudgetHtml}
    ${idaSavingHtml}
    ${idaFoodHtml}
    ${idaMubbiHtml}
    ${idaSelfHtml}
  `;

    console.log(idaHtml);

    document.getElementById('idaContainer').innerHTML = idaHtml;


    let jeppeBudget = Math.round((jeppeIncome / totalBudget) * minimumBudget);
    let jeppeSaving = Math.round((jeppeIncome / totalBudget));
    let jeppeFood = Math.round((jeppeIncome / totalBudget) * minimumFood);
    let jeppeMubbi = Math.round((jeppeIncome / totalBudget) * minimumMubbi);
    let jeppeSelf = Math.round(jeppeIncome - jeppeBudget - jeppeSaving - jeppeFood - jeppeMubbi);

    if (jeppeSelf > maximumSelf) {
      let amountAbove = jeppeSelf - maximumSelf;
      jeppeSelf = jeppeSelf - amountAbove;
      jeppeSaving = jeppeSaving + amountAbove;
    }

    const jeppeBudgetHtml = createHtmlElement("Budget", jeppeBudget);
    const jeppeSavingHtml = createHtmlElement("Opsparing", jeppeSaving);
    const jeppeFoodHtml = createHtmlElement("Mad", jeppeFood);
    const jeppeMubbiHtml = createHtmlElement("Mubbi", jeppeMubbi);
    const jeppeSelfHtml = createHtmlElement("Selv", jeppeSelf);

    const jeppeHtml = `
    <h3><b>👨</b></h3>
    ${jeppeBudgetHtml}
    ${jeppeSavingHtml}
    ${jeppeFoodHtml}
    ${jeppeMubbiHtml}
    ${jeppeSelfHtml}
  `;

    document.getElementById('jeppeContainer').innerHTML = jeppeHtml;

    let totalSaving = idaSaving+jeppeSaving;
    const totalSavingHtml = createHtmlElement("Opsparing", totalSaving);

    const totalHtml = `
    <h3><b>Samlet</b></h3>
    ${totalSavingHtml}
    `;
    document.getElementById('totalContainer').innerHTML = totalHtml;
  }
  function createHtmlElement(title, value) {
    return `<div><span>${title}</span><span>${value}</span></div>`;
  }
  function setPredefinedValues(minimumBudget, minimumFood, minimumMubbi, maximumSelf) {
    document.getElementById('minimumBudget').innerText = minimumBudget;
    document.getElementById('minimumFood').innerText = minimumFood;
    document.getElementById('minimumMubbi').innerText = minimumMubbi;
    document.getElementById('maximumSelf').innerText = maximumSelf;
  }
});
/*
CHANGELOG:
1/11 2023:
- Changed food from 3000 to 3500.
- Added 100kr combined to børneopsparing.
*/
