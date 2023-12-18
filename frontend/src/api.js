import axios from "axios";
export const indicadorApi = axios.create({
    baseURL: "http://localhost:3001"
})

export const getAccessToken = async() =>{
    return indicadorApi.get('/')
}
export const postAuthetication = async(token, email) =>{
    //verificando se o token está chegando corretamente
    console.log(token)
    return indicadorApi.post('/authEnviaEmail', 
        {
            token: token, 
            email:email
        }
    )
}
