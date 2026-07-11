function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCircularPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  radius: number,
  fallbackText: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (img) {
    const size = radius * 2;
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  } else {
    ctx.fillStyle = "#c2760a";
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fallbackText, x, y);
  }
  ctx.restore();
}

export interface VerdictCardData {
  winnerName: string;
  winnerImage: string | null;
  userAthlete: string;
  aiAthlete: string;
  sport: string;
  userTotal: number;
  aiTotal: number;
  bestLine: string;
}

export async function renderVerdictCard(data: VerdictCardData): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background: fixed dark card regardless of site theme, for a consistent shareable look.
  const bg = ctx.createLinearGradient(0, 0, 1200, 630);
  bg.addColorStop(0, "#0a0a0b");
  bg.addColorStop(1, "#17171a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 630);

  let winnerImg: HTMLImageElement | null = null;
  try {
    if (data.winnerImage) winnerImg = await loadImage(data.winnerImage);
  } catch {
    winnerImg = null;
  }

  const initials = data.winnerName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  drawCircularPhoto(ctx, winnerImg, 600, 190, 90, initials);

  ctx.fillStyle = "#f5a524";
  ctx.font = "600 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AND THE VERDICT IS IN", 600, 320);

  ctx.fillStyle = "#f5f5f6";
  ctx.font = "bold 52px sans-serif";
  ctx.fillText(`${data.winnerName} is the GOAT`, 600, 380);

  ctx.fillStyle = "#98979f";
  ctx.font = "26px sans-serif";
  ctx.fillText(
    `${data.userAthlete} vs ${data.aiAthlete} · greatest ${data.sport} player ever`,
    600,
    425,
  );

  ctx.fillStyle = "#f5a524";
  ctx.font = "bold 40px sans-serif";
  ctx.fillText(`${data.userTotal} - ${data.aiTotal}`, 600, 480);

  ctx.fillStyle = "#c7c6cc";
  ctx.font = "italic 22px sans-serif";
  const line = data.bestLine.length > 90 ? data.bestLine.slice(0, 87) + "..." : data.bestLine;
  ctx.fillText(`"${line}"`, 600, 535);

  ctx.fillStyle = "#f5a524";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("GOAT COURT", 600, 590);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export async function shareOrDownloadVerdictCard(data: VerdictCardData): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await renderVerdictCard(data);
  if (!blob) return "failed";
  const file = new File([blob], "goat-court-verdict.png", { type: "image/png" });

  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "GOAT Court verdict" });
      return "shared";
    } catch {
      // user cancelled or share failed, fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "goat-court-verdict.png";
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
