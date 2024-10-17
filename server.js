require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const PORT = 5000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const AUTHORIZATION_URL = process.env.AUTHORIZATION_URL;
const TOKEN_URL = process.env.TOKEN_URL;

// Ruta para redirigir al usuario a Google para la autorización
app.get('/login', (req, res) => {
  const authorizationUri = `${AUTHORIZATION_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=https://www.googleapis.com/auth/userinfo.profile`;
  res.redirect(authorizationUri);
});

// Ruta de callback donde Google redirige después de la autorización
app.get('/api/app', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("Error: No se recibió ningún código de autorización");
  }

  try {
    // Intercambio del código de autorización por un token de acceso
    const tokenResponse = await axios.post(TOKEN_URL, querystring.stringify({
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;
    res.send(`Token de acceso: ${accessToken}`);
  } catch (error) {
    console.error("Error al obtener el token de acceso:", error.response?.data || error.message);
    res.status(500).send("Hubo un problema al obtener el token de acceso.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
