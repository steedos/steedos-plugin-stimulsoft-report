import fetch from 'cross-fetch';

export default async (resourceType, isProxy, userSession) => {
    let proxy = "";
    if (isProxy){
        proxy = process.env.ROOT_URL;
    }
    if (proxy.endsWith("/")){
        proxy = proxy.replace(/\/$/, "");
    }
    let url = `${proxy}/plugins/stimulsoft/api/${resourceType}`;
    let authorization = "Bearer " + userSession.spaceId + "," + userSession.authToken;
    let response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization
        }
    });
    return response.json();
};