const express = require('express');
const msal = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');
const cors = require('cors');

const app = express();

app.use(express.json())

//configuração cors
app.use(cors({
    origin: ['http://localhost:3000', 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize', 'http://localhost:3000/authEnviaEmail' ],
    methods: 'GET,PUT,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200,
    maxAfe: 86400
}))

const config = {
    //configuração de autenticação de acordo com o azure 
    auth: {
        clientId: '', //id
        authority: 'https://login.microsoftonline.com/{tenant}', //tenant
        clientSecret: '', // client value
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        },
    },
};

const cca = new msal.ConfidentialClientApplication(config);

// rota para obter a URL de autenticação
app.get('/', async (req, res) => {
    try {
        
        const authCodeUrlParameters = {
            scopes: ['openid', 'profile', 'offline_access', 'User.Read', 'Mail.Send'],
            redirectUri: `http://localhost:3001/redirect`,
        };

        const url = await cca.getAuthCodeUrl(authCodeUrlParameters);
    
        res.json({authUrl: url})
    } catch (error) {
        res.status(500).send(error.message)
    }
});

// Rota para lidar com o redirecionamento depois da autenticação
app.get('/redirect', async (req, res) => {

    const tokenRequest = {
        code: req.query.code,
        scopes: ['openid', 'profile', 'offline_access', 'User.Read', 'Mail.Send'],
        redirectUri: `http://localhost:3001/redirect`,
    };

    try {
        const response = await cca.acquireTokenByCode(tokenRequest);

        const accessToken = response.accessToken;

        const client = Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            },
        });
        
        // Redirecionando para o front com o token de acesso 
        res.redirect(`http://localhost:3000/?accessToken=${accessToken}`)
        console.log(accessToken)
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// Rota para autenticar e enviar email
app.post('/authEnviaEmail', async (req, res) => {
    try {
        const token =  req.body.token; 

        // pengando dados do body
        const emails = req.body.email
        

        const client = Client.init({
            authProvider: (done) => {
                done(null, token);
            },
        });

        const bccRecipients = emails.map(email => ({
            emailAddress: {
                address: email,
            }
        }));

        const mailOptions = {
            subject: 'Autenticação de Usuário',
            body: {
            content: `Usuário autenticado`,
                contentType: 'Text',
            },
            bccRecipients
        };

        // API para enviar email no Outlook
        await client.api('/me/sendMail').post({
            message: mailOptions,
        });

        res.json({ message: 'E-mail enviado com sucesso!' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});


const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});