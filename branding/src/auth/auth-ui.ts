import { getUser, isLoggedIn, login, logout, userManagerPromise } from "./auth";
import settings from "../settings";

const uiReady = new Promise<void>((resolve) =>
    document.addEventListener("DOMContentLoaded", () => resolve())
);
export async function initAuthUi() {
    addAuthButtonClickHandlers();
    setAuthMenuStatus();

    const mgr = await userManagerPromise;
    mgr.events.addUserLoaded(async () => {
        setAuthMenuStatus();
    });
    mgr.events.addUserUnloaded(async () => {
        setAuthMenuStatus();
    });
}

initAuthUi();

async function setAuthMenuStatus() {
    await uiReady;

    Array.from(document.getElementsByClassName("login-status-dependent"))
        .forEach(async (element) => {
            const user = await getUser();
            if (user !== null && await isLoggedIn()) {
                element.classList.remove(settings.auth.ala.logoutClass);
                element.classList.add(settings.auth.ala.loginClass);

                (document.getElementById(
                    "my-annotated-records",
                )! as HTMLAnchorElement)
                    .href =
                        `/biocache-hub/occurrences/search/?q=*:*&fq=assertion_user_id:%22${user.profile.sub}%22`;
            } else {
                element.classList.remove(settings.auth.ala.loginClass);
                element.classList.add(settings.auth.ala.logoutClass);
            }
        });
}

async function addAuthButtonClickHandlers() {
    await uiReady;

    const loginButtons = document.getElementsByClassName("login-button");
    for (const button of loginButtons) {
        button.addEventListener(
            "click",
            async (e) => {
                e.preventDefault();
                const target = e.currentTarget as HTMLAnchorElement;
                if (target.href && target.href.length > 0) {
                    await logout({
                        redirectUri: modifyAlaServiceRedirectUri(target.href),
                    });
                } else {
                    await login();
                }
            },
        );
    }
    const logoutButtons = document.getElementsByClassName("logout-button");
    for (const button of logoutButtons) {
        button.addEventListener(
            "click",
            async (e) => {
                e.preventDefault();
                const target = e.currentTarget as HTMLAnchorElement;
                if (target.href && target.href.length > 0) {
                    await logout({
                        redirectUri: modifyAlaServiceRedirectUri(target.href),
                    });
                } else {
                    await logout();
                }
            },
        );
    }
}

function modifyAlaServiceRedirectUri(url: string): string {
    let serviceActionUri = new URL(url);
    let pathParam = serviceActionUri.searchParams.get("path");
    if (pathParam) {
        let redirectUri = new URL(pathParam);
        redirectUri.searchParams.set("login", "service");
        serviceActionUri.searchParams.set("path", redirectUri.href);
    }
    return serviceActionUri.href;
}
