import Cookies from "universal-cookie";
async function ClearCookiesAndStorage() {
    const cookies = new Cookies();
    cookies.remove("*");
    localStorage.clear();
    sessionStorage.clear();
    cookies.remove("access_token", { path: "/", domain: "localhost" });
    cookies.remove("ahs_sessionuid", { path: "/", domain: "localhost" });
    cookies.remove("ahs_sessionusr", { path: "/", domain: "localhost" });
    cookies.remove("ahs_usr", { path: "/", domain: "localhost" });
    cookies.remove("access_token", { path: "/", domain: "localhost" });
    cookies.remove('hashedVal');
    // window.location.reload();
    return true;
}

export default ClearCookiesAndStorage