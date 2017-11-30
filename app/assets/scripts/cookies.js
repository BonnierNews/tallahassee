const cookies = loadCookies();

export function getCookie(cookieName) {
  return cookies[cookieName];
}

function loadCookies() {
  const cookiesSplit = document.cookie.split(";");
  return cookiesSplit.reduce((result, cookie) => {
    const name = cookie.substr(0, cookie.indexOf("="));
    const value = cookie.substr(cookie.indexOf("=") + 1);
    result[name.trim()] = value;

    return result;
  }, {});
}
