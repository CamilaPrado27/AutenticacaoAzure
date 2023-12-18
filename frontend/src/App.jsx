import { useEffect } from 'react';
import { getAccessToken, postAuthetication } from './api';

function App() {

  const initiateAuthentication = async () => {
    try {
      // Faz uma requisição GET para obter a url de autenticação
      const resposta = await getAccessToken()
      const data = await resposta.data

      // Redireciona para a URL de autenticação
      window.location.href = data.authUrl
    } catch (err) {
      console.error('Erro ao iniciar a autenticação: ', err)
    }
  };

  // Função que envia email
  const sendEmail = async () => {
    const storedToken = localStorage.getItem('accessToken')//  o token no localStorage
    
    const email = "email.mocado@outlook.com"
    if (storedToken) {
      try {
        // Faz um requisição POST com o token e email
        const resposta = await postAuthetication(storedToken, email, { headers: { 'Content-Type': 'application/json' } });

        const result = await resposta.data
        console.log(result)
      } catch (err) {
        console.error('Erro ao autenticar e enviar e-mail: ', err)
      }
    } else {
      console.error('Token não encontrado')
    }
  }

  // Monitoranto se tem token, depois do redirecionamento
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('accessToken')

    if (tokenFromUrl) {
      // coloca o token no localstorage
      localStorage.setItem('accessToken', tokenFromUrl)
      //depois redireciona para a pagina principal
      window.location.href = 'http://localhost:3000'
    }
  }, []);


  const handleAuthenticationButtonClick = () => {
    initiateAuthentication()
  };
  return (
    <div className="App">

      <button onClick={handleAuthenticationButtonClick}>
        Iniciar a autenticação
      </button>
      <button onClick={sendEmail}>
        Autenticar e Enviar E-mail
      </button>


    </div>
  );
}

export default App;