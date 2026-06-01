document.addEventListener("DOMContentLoaded", function () {
  const CATEGORIES = [
    { key: "budget", label: "Budget", target: 25000 },
    { key: "hus", label: "Hus", target: 7000 },
    { key: "mad", label: "Mad", target: 5000 },
    { key: "mubbiRo", label: "Børneopsparing 1", target: 100 },
    { key: "mubbiMy", label: "Børneopsparing 2", target: 100 },
    { key: "selv", label: "Selv", target: 2000, perPersonCap: true },
    { key: "forbrug", label: "Forbrug", separator: true },
  ];

  const idaIncomeInput = document.getElementById("idaIncome");
  const jeppeIncomeInput = document.getElementById("jeppeIncome");
  const idaList = document.getElementById("idaList");
  const jeppeList = document.getElementById("jeppeList");
  const totalForbrug = document.getElementById("totalForbrug");
  const calcButton = document.getElementById("calcButton");
  const downloadButton = document.getElementById("downloadButton");

  let lastResult = null;

  function checkInputs() {
    calcButton.disabled = !(
      idaIncomeInput.value.trim() && jeppeIncomeInput.value.trim()
    );
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("da-DK");
  }

  const THEMES = {
    ida: { forbrug: "text-rose-600 font-semibold" },
    jeppe: { forbrug: "text-indigo-600 font-semibold" },
  };

  function rowHtml(category, amount, theme) {
    const isForbrug = category.key === "forbrug";
    const amountClass = isForbrug
      ? theme.forbrug
      : "font-medium text-slate-900";
    const amountStr =
      amount == null
        ? `<span class="text-slate-300">—</span>`
        : formatNumber(amount);
    const rowClass = category.separator
      ? "flex items-center justify-between border-t border-slate-200 mt-2 pt-3"
      : "flex items-center justify-between py-1.5";
    return `<div class="${rowClass}">
      <dt class="text-slate-600">${category.label}</dt>
      <dd class="tabular-nums ${amountClass}">${amountStr}</dd>
    </div>`;
  }

  function renderList(el, amounts, theme) {
    el.innerHTML = CATEGORIES.map((c) => {
      const amount = amounts ? amounts[c.key] : null;
      return rowHtml(c, amount, theme);
    }).join("");
  }

  renderList(idaList, null, THEMES.ida);
  renderList(jeppeList, null, THEMES.jeppe);

  function shareOf(income, total, target) {
    return Math.round((income / total) * target);
  }

  function calcPerson(income, totalIncome) {
    const shares = {};
    CATEGORIES.forEach((c) => {
      if (c.perPersonCap || c.key === "forbrug") return;
      shares[c.key] = shareOf(income, totalIncome, c.target);
    });
    const obligations = Object.values(shares).reduce((a, b) => a + b, 0);
    let selv = Math.round(income - obligations);
    let forbrug = 0;
    if (selv > 2000) {
      forbrug = selv - 2000;
      selv = 2000;
    }
    return { ...shares, selv, forbrug };
  }

  function calculateTransfers() {
    const idaIncome = parseFloat(idaIncomeInput.value);
    const jeppeIncome = parseFloat(jeppeIncomeInput.value);
    const totalIncome = idaIncome + jeppeIncome;
    const ida = calcPerson(idaIncome, totalIncome);
    const jeppe = calcPerson(jeppeIncome, totalIncome);
    const totalRest = ida.forbrug + jeppe.forbrug;

    renderList(idaList, ida, THEMES.ida);
    renderList(jeppeList, jeppe, THEMES.jeppe);
    totalForbrug.textContent = formatNumber(totalRest);

    lastResult = { ida, jeppe, totalRest };
    downloadButton.classList.remove("hidden");
  }

  idaIncomeInput.addEventListener("input", checkInputs);
  jeppeIncomeInput.addEventListener("input", checkInputs);
  calcButton.addEventListener("click", calculateTransfers);
  downloadButton.addEventListener("click", downloadImage);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function downloadImage() {
    if (!lastResult) return;

    const scale = 2;
    const pagePad = 40;
    const cardGap = 16;
    const cardPad = 28;
    const cardRadius = 20;
    const cardWidth = 460;
    const headerHeight = 48;
    const rowHeight = 44;
    const separatorGap = 10;

    const labelFont =
      "28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const amountFont =
      "500 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const headerFont =
      "600 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    const personCardHeight =
      cardPad * 2 +
      headerHeight +
      CATEGORIES.length * rowHeight +
      separatorGap;
    const totalCardHeight = cardPad * 2 + headerHeight;

    const pageWidth = pagePad * 2 + cardWidth;
    const pageHeight =
      pagePad * 2 + personCardHeight * 2 + totalCardHeight + cardGap * 2;

    const canvas = document.createElement("canvas");
    canvas.width = pageWidth * scale;
    canvas.height = pageHeight * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    const CARD_THEMES = {
      ida: {
        bg: "#ffffff",
        border: "#e2e8f0",
        separator: "#e2e8f0",
        header: "#e11d48",
        label: "#475569",
        amount: "#0f172a",
        forbrug: "#e11d48",
      },
      jeppe: {
        bg: "#ffffff",
        border: "#e2e8f0",
        separator: "#e2e8f0",
        header: "#4f46e5",
        label: "#475569",
        amount: "#0f172a",
        forbrug: "#4f46e5",
      },
      total: {
        bg: "#ffffff",
        border: "#e2e8f0",
        header: "#059669",
        amount: "#059669",
      },
    };

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, pageWidth, pageHeight);

    let y = pagePad;

    function drawCard(height, theme) {
      ctx.fillStyle = theme.bg;
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1;
      roundRect(ctx, pagePad, y, cardWidth, height, cardRadius);
      ctx.fill();
      ctx.stroke();
    }

    function drawPersonCard(title, amounts, theme) {
      drawCard(personCardHeight, theme);
      const innerLeft = pagePad + cardPad;
      const innerRight = pagePad + cardWidth - cardPad;
      let ry = y + cardPad;

      ctx.fillStyle = theme.header;
      ctx.font = headerFont;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(title, innerLeft, ry + headerHeight / 2);
      ry += headerHeight;

      CATEGORIES.forEach((c) => {
        if (c.separator) {
          ry += separatorGap / 2;
          ctx.strokeStyle = theme.separator;
          ctx.beginPath();
          ctx.moveTo(innerLeft, ry);
          ctx.lineTo(innerRight, ry);
          ctx.stroke();
          ry += separatorGap / 2;
        }

        const cy = ry + rowHeight / 2;
        ctx.fillStyle = theme.label;
        ctx.font = labelFont;
        ctx.textAlign = "left";
        ctx.fillText(c.label, innerLeft, cy);

        const isForbrug = c.key === "forbrug";
        ctx.fillStyle = isForbrug ? theme.forbrug : theme.amount;
        ctx.font = isForbrug
          ? "600 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          : amountFont;
        ctx.textAlign = "right";
        ctx.fillText(formatNumber(amounts[c.key]), innerRight, cy);

        ry += rowHeight;
      });

      y += personCardHeight + cardGap;
    }

    drawPersonCard("👸  Ida", lastResult.ida, CARD_THEMES.ida);
    drawPersonCard("🤴  Jeppe", lastResult.jeppe, CARD_THEMES.jeppe);

    drawCard(totalCardHeight, CARD_THEMES.total);
    const innerLeft = pagePad + cardPad;
    const innerRight = pagePad + cardWidth - cardPad;
    const cy = y + cardPad + headerHeight / 2;
    ctx.font = headerFont;
    ctx.fillStyle = CARD_THEMES.total.header;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Samlet forbrug", innerLeft, cy);
    ctx.font =
      "600 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = CARD_THEMES.total.amount;
    ctx.textAlign = "right";
    ctx.fillText(formatNumber(lastResult.totalRest), innerRight, cy);

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
