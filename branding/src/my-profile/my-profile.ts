import { User } from "oidc-client-ts";
import {
    getUser,
    getUserManagerInstance,
    isLoggedIn,
    login,
} from "../portal/auth.ts";

$(() => {
    initPage();
});

async function initPage() {
    getUserManagerInstance().events.addUserLoaded(async (user) => {
        showUserDetails(user);
    });
    if (await isLoggedIn()) {
        const user = await getUser();
        if (user) {
            showUserDetails(user);
        }
    }
}

let showDetailsRan = false;
function showUserDetails(user: User) {
    if (!showDetailsRan) {
        showDetailsRan = true;
        console.trace("User loaded", user);
        const profile = user!.profile!;

        document.getElementById("user-greeting-name")!
            .innerText = `${profile.given_name} ${profile.family_name}`;

        (document.getElementById(
            "update-profile-details",
        )! as HTMLAnchorElement).addEventListener("click", (e) => {
            e.preventDefault();
            login({ "kc_action": "UPDATE_PROFILE" });
        });

        (document.getElementById("update-password")! as HTMLAnchorElement)
            .addEventListener("click", (e) => {
                e.preventDefault();
                login({ "kc_action": "UPDATE_PASSWORD" });
            });

        (document.getElementById("my-annotated-records")! as HTMLAnchorElement)
            .href =
                `/biocache-hub/occurrences/search/?q=*:*&fq=assertion_user_id:%22${profile.sub}%22`;

        const roles: string[] = (profile.realm_access as any)?.roles || [];

        const rolesElement = document.getElementById("my-roles")!;
        roles.forEach((role) => {
            const roleElement = document.createElement("span");
            roleElement.className = "badge badge-secondary";
            roleElement.innerText = role;
            rolesElement.appendChild(roleElement);
        });

        document.getElementById("profile-login")!.classList.add("hidden");
        document.getElementById("profile-overview")!.classList.remove("hidden");
    }
}
