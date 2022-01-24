import axios from "axios";

const Server_Url = "/v2/"

export const instance = axios.create({
    baseURL:Server_Url,
    timeout:120000,
    withCredentials:true
})

export default{
    getInquiries:(userSubData) =>
    instance.get("inquiry?page=1&pagesize=5&display-mode="+userSubData).then((response) =>{
        return response.data
    })
}