
const express = require("express");
const cors = require("cors");
const { create } = require("venom-bot");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

let client = null;

// Endpoint para escanear QRCode
app.get("/instance/qrcode", async (req, res) => {
  if (!client) {
    return res.status(400).json({ message: "Cliente ainda não inicializado" });
  }

  try {
    const qr = await client.getQRCode();
    res.send(`<img src="${qr}" />`);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter QR Code", error });
  }
});

// Endpoint de status
app.get("/", (req, res) => {
  res.json({ message: "Evolution API funcionando 🔥" });
});

// Enviar texto
app.post("/message/sendText", async (req, res) => {
  const { number, message } = req.body;

  if (!client) return res.status(500).json({ error: "Cliente não conectado" });

  try {
  await client.sendText(number + "@c.us", message);
  res.json({ success: true });
} catch (err) {
  console.error("Erro ao enviar mensagem:", err);  // 👈 isso vai mostrar o erro no terminal
  res.status(500).json({ success: false, error: err });
  }
});

// Enviar arquivo
app.post("/message/sendFile", async (req, res) => {
  const { number, fileUrl, caption } = req.body;

  if (!client) return res.status(500).json({ error: "Cliente não conectado" });

  try {
    await client.sendFile(number + "@c.us", fileUrl, "nota.pdf", caption);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// Iniciar o cliente Venom
create({
  session: "universe-session",
  multidevice: true,
  headless: false  // 👈 importante
}).then((cli) => {
  client = cli;
  console.log("✅ Cliente conectado com sucesso!");
}).catch((e) => {
  console.error("Erro ao iniciar o cliente:", e);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
