var ServerURL = "https://eventzilla-backend.herokuapp.com";

var axios = require('axios')
const getData = async(url)=>{
    try
    {
        const response = await fetch(`${ServerURL}/${url}`,{ headers: { "Content-Type": "application/json;charset=utf-8" },})
        
        const result = await response.json();
        return result;
    }catch(e)
    {
        console.log("Error:",e)
        return null 
    }
}



const postData=async(url,body)=>{
    try{ 
        console.log(`${ServerURL}/${url}`)
        const response = await fetch(`${ServerURL}/${url}`, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json;charset=utf-8" },
            body: JSON.stringify(body),
          });
          
        const result = await response.json();
        return result;
          
    }catch(e)
    {
        console.log("Error:",e)
        return null 
    }
}

const postDataAndImage = async(url,formdata,config)=>{
    try
    {
        const response = await axios.post(`${ServerURL}/${url}`,formdata,config)
        
        const result = response.data;
        return result;

    }catch(e)
    {
        console.log("Error:",e)
        return {"status":false}
    }
}

export {ServerURL,getData,postDataAndImage,postData}
