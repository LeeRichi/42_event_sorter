let tokenData = null;

const saveToken = (token, expiresIn) => {
  const expirationTime = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds
  tokenData = { access_token: token, expires_at: expirationTime };
};

const getToken = () => {
  if (!tokenData || Date.now() > tokenData.expires_at) {
    console.log("Token expired or not available");
    return null;
  }
  return tokenData.access_token;
};

export {saveToken, getToken}
