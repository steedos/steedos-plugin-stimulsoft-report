import fetch from 'cross-fetch';

export default async (resourceType, isProxy) => {
    let proxy = "";
    if (isProxy){
        proxy = process.env.ROOT_URL;
    }
    if (proxy.endsWith("/")){
        proxy = proxy.replace(/\/$/, "");
    }
    let url = `${proxy}/plugins/stimulsoft/api/${resourceType}`;
    let response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
};