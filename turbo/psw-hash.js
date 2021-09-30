const PswHash = async psw => {
    const pswUint8 = new TextEncoder("utf-8").encode(psw);
    const hashBuffer = await crypto.subtle.digest("SHA-256", pswUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashStr = hashArray.map(b => String.fromCharCode(b)).join('');
    const hashB64 = btoa(hashStr);
    return hashB64;
};

export default PswHash;