document.addEventListener("DOMContentLoaded", function () {
  const minimumBudget = 25000;
  const maximumSelf = 2000;
  const minimumFood = 5000;
  const minimumMubbiRo = 100;
  const minimumMubbiMy = 100;
  const minimumHouse = 7000;
  const idaIncomeInput = document.getElementById("idaIncome");
  const jeppeIncomeInput = document.getElementById("jeppeIncome");
  const calcButton = document.getElementById("calcButton");
  const downloadButton = document.getElementById("downloadButton");

  let lastResult = null;

  function checkInputs() {
    calcButton.disabled = !(
      idaIncomeInput.value.trim() && jeppeIncomeInput.value.trim()
    );
  }

  setPredefinedValues(
    minimumBudget,
    minimumFood,
    minimumMubbiRo,
    minimumMubbiMy,
    maximumSelf,
    minimumHouse,
  );

  idaIncomeInput.addEventListener("input", checkInputs);
  jeppeIncomeInput.addEventListener("input", checkInputs);
  calcButton.addEventListener("click", calculateTransfers);
  downloadButton.addEventListener("click", downloadImage);

  function calculateTransfers() {
    const idaIncome = parseFloat(idaIncomeInput.value);
    const jeppeIncome = parseFloat(jeppeIncomeInput.value);
    const totalBudget = idaIncome + jeppeIncome;

    // ========== IDA ==========
    let idaBudget = Math.round((idaIncome / totalBudget) * minimumBudget);
    let idaFood = Math.round((idaIncome / totalBudget) * minimumFood);
    let idaMubbiRo = Math.round((idaIncome / totalBudget) * minimumMubbiRo);
    let idaMubbiMy = Math.round((idaIncome / totalBudget) * minimumMubbiMy);
    let idaHus = Math.round((idaIncome / totalBudget) * minimumHouse);

    let idaLeft = Math.round(
      idaIncome - idaBudget - idaFood - idaMubbiRo - idaMubbiMy - idaHus,
    );

    let idaAmountAbove = idaLeft - maximumSelf;
    idaLeft = idaLeft - idaAmountAbove;
    let idaRest = Math.max(idaAmountAbove, 0);

    const idaRows = [
      ["Budget", idaBudget],
      ["Hus", idaHus],
      ["Mad", idaFood],
      ["Børneopsparing 1", idaMubbiRo],
      ["Børneopsparing 2", idaMubbiMy],
      ["Selv", idaLeft],
      ["Forbrug", idaRest],
    ];

    const idaHtml = `
      <h3><b>👸</b></h3>
      ${idaRows.map(([t, v]) => createHtmlElement(t, v)).join("")}
    `;
    document.getElementById("idaContainer").innerHTML = idaHtml;

    // ========== JEPPE ==========
    let jeppeBudget = Math.round((jeppeIncome / totalBudget) * minimumBudget);
    let jeppeFood = Math.round((jeppeIncome / totalBudget) * minimumFood);
    let jeppeMubbiRo = Math.round(
      (jeppeIncome / totalBudget) * minimumMubbiRo,
    );
    let jeppeMubbiMy = Math.round(
      (jeppeIncome / totalBudget) * minimumMubbiMy,
    );
    let jeppeHus = Math.round((jeppeIncome / totalBudget) * minimumHouse);

    let jeppeLeft = Math.round(
      jeppeIncome -
        jeppeBudget -
        jeppeFood -
        jeppeMubbiRo -
        jeppeMubbiMy -
        jeppeHus,
    );

    let jeppeAmountAbove = jeppeLeft - maximumSelf;
    jeppeLeft = jeppeLeft - jeppeAmountAbove;
    let jeppeRest = Math.max(jeppeAmountAbove, 0);

    const jeppeRows = [
      ["Budget", jeppeBudget],
      ["Hus", jeppeHus],
      ["Mad", jeppeFood],
      ["Børneopsparing 1", jeppeMubbiRo],
      ["Børneopsparing 2", jeppeMubbiMy],
      ["Selv", jeppeLeft],
      ["Forbrug", jeppeRest],
    ];

    const jeppeHtml = `
      <h3><b>🤴</b></h3>
      ${jeppeRows.map(([t, v]) => createHtmlElement(t, v)).join("")}
    `;
    document.getElementById("jeppeContainer").innerHTML = jeppeHtml;

    // ========== TOTAL ==========
    let totalRest = idaRest + jeppeRest;
    const totalRows = [["Rest", totalRest]];

    const totalHtml = `
      <h3><b>Samlet</b></h3>
      ${totalRows.map(([t, v]) => createHtmlElement(t, v)).join("")}
    `;
    document.getElementById("totalContainer").innerHTML = totalHtml;

    lastResult = {
      ida: { emoji: "👸", rows: idaRows },
      jeppe: { emoji: "🤴", rows: jeppeRows },
      total: { title: "Samlet", rows: totalRows },
    };
    downloadButton.classList.remove("hidden");
  }

  function createHtmlElement(title, value) {
    return `<div><span>${title}</span><span>${value}</span></div>`;
  }

  function setPredefinedValues(
    minimumBudget,
    minimumFood,
    minimumMubbiRo,
    minimumMubbiMy,
    maximumSelf,
    minimumBackup,
  ) {
    document.getElementById("minimumBudget").innerText = minimumBudget;
    document.getElementById("minimumFood").innerText = minimumFood;
    document.getElementById("minimumMubbiRo").innerText = minimumMubbiRo;
    document.getElementById("minimumMubbiMy").innerText = minimumMubbiMy;
    document.getElementById("maximumSelf").innerText = maximumSelf;
    document.getElementById("minimumBackup").innerText = minimumBackup;
  }

  function downloadImage() {
    if (!lastResult) return;

    const scale = 2;
    const padding = 60;
    const lineHeight = 56;
    const headerHeight = 70;
    const sectionGap = 70;
    const labelFont = "32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const headerFont = "bold 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const emojiFont = "44px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const blockWidth = 360;

    const sections = [lastResult.ida, lastResult.jeppe, lastResult.total];
    let contentHeight = 0;
    sections.forEach((s) => {
      contentHeight += headerHeight + s.rows.length * lineHeight + sectionGap;
    });
    contentHeight -= sectionGap;

    const width = padding * 2 + blockWidth;
    const height = padding * 2 + contentHeight;

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#000000";
    ctx.textBaseline = "middle";

    const blockLeft = padding;
    const blockRight = padding + blockWidth;
    let y = padding;

    sections.forEach((section) => {
      const header = section.emoji || section.title;
      const isEmoji = !!section.emoji;
      ctx.font = isEmoji ? emojiFont : headerFont;
      ctx.textAlign = "center";
      ctx.fillText(header, blockLeft + blockWidth / 2, y + headerHeight / 2);
      y += headerHeight;

      ctx.font = labelFont;
      section.rows.forEach(([label, value]) => {
        ctx.textAlign = "left";
        ctx.fillText(label, blockLeft, y + lineHeight / 2);
        ctx.textAlign = "right";
        ctx.fillText(String(value), blockRight, y + lineHeight / 2);
        y += lineHeight;
      });

      y += sectionGap;
    });

    canvas.toBlob(async (blob) => {
      const file = new File([blob], "budget.png", { type: "image/png" });
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      if (
        isTouch &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file], title: "Budget" });
          return;
        } catch (err) {
          if (err && err.name === "AbortError") return;
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "budget.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  }
});
