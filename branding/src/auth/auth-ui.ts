import {
    getCurrentUrl,
    getUser,
    isLoggedIn,
    login,
    logout,
    userManager,
} from "./auth";
import settings from "../settings";
import Cookies from "js-cookie";
import { User } from "oidc-client-ts";

const uiReady = new Promise<void>((resolve) =>
    document.addEventListener("DOMContentLoaded", () => resolve())
);
export async function initAuthUi() {
    handleAuthCallbacks();
    addAuthButtonClickHandlers();
    setAuthMenuStatus();

    const mgr = await userManager;
    mgr.events.addUserSessionChanged(() => {
        setAuthMenuStatus();
    });
    mgr.events.addUserLoaded(() => {
        setAuthMenuStatus();
    });
}

initAuthUi();

async function handleAuthCallbacks() {
    const urlParams = new URLSearchParams(window.location.search);
    const manager = await userManager;

    if (urlParams.get("login") !== null) {
        const user = await manager.signinCallback();
        if (!user) {
            return;
        }
        setAuthMenuStatus();

        window.history.pushState(null, document.title, getCurrentUrl());
    } else if (urlParams.get("logout") !== null) {
        await manager.signoutCallback();
        setAuthMenuStatus();

        window.history.pushState(null, document.title, getCurrentUrl());
    }
}

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
                await login();
            },
        );
    }
    const logoutButtons = document.getElementsByClassName("logout-button");
    for (const button of logoutButtons) {
        button.addEventListener(
            "click",
            async (e) => {
                e.preventDefault();
                await logout();
            },
        );
    }
}

function setAlaAuthCookie(user: User) {
    Cookies.set(
        settings.auth.ala.authCookieName,
        user.profile.sub,
        {
            path: "/",
            sameSite: "strict",
            secure: window.location.protocol === "https:",
        },
    );
}
