import { User } from "oidc-client-ts";
import { getUser, isLoggedIn, login, userManager } from "../auth/auth.ts";

$(() => {
    initPage();
});

async function initPage() {
    await userManager.then((mgr) =>
        mgr.events.addUserLoaded(async (user) => {
            showUserDetails(user);
        })
    );
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

        // Only allow the user to update their profile if they are not an ACM IDM user
        if (!profile["acm_idm"]) {
            const updateProfileButton = document.getElementById(
                "update-profile-details",
            )! as HTMLAnchorElement;
            updateProfileButton.addEventListener("click", (e) => {
                e.preventDefault();
                login({ "kc_action": "UPDATE_PROFILE" });
            });

            const changePasswordButton = document.getElementById(
                "update-password",
            )! as HTMLAnchorElement;
            changePasswordButton.addEventListener("click", (e) => {
                e.preventDefault();
                login({ "kc_action": "UPDATE_PASSWORD" });
            });

            document.getElementById("user-account-management-row")!
                .classList.remove("hidden");
        }

        // Update link to my-annotated-records
        (document.getElementById("my-annotated-records")! as HTMLAnchorElement)
            .href =
                `/biocache-hub/occurrences/search/?q=*:*&fq=assertion_user_id:%22${profile.sub}%22`;

        // Show roles as badges
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
