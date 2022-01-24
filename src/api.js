import axios from "axios";

const Server_Url = "/v2/"

export const instance = axios.create({
    baseURL:Server_Url,
    timeout:120000,
    withCredentials:true
})

export default{
    getInquiries:(userSubData) =>
    instance.get("inquirypage=1&pagesize=5&display-mode="+userSubData).then((response) =>{
        return response.data
    }),

    getInquiriesWithstatus:(filterDate)=>
    instance.get("/inquiry",{params:filterDate}).then((response) => {
        console.log(JSON.stringify(response))
      return response.data;
    }),
    getShopList:()=>{
        axios.get("https://dev.my.geaviation.com/services/submitInquiry/getShopList").then((response)=>{
            console.log("response",response);
        })
    }
}

//?case-status=Received&case-status=Awaiting