import { User } from "oidc-client-ts";
import { login, userManagerPromise } from "../auth/auth.ts";

$(() => {
    initPage();
});

async function initPage() {
    const userManager = await userManagerPromise;
    userManager.events.addUserLoaded((user) => {
        showUserDetails(user);
    });
    (await userManagerPromise).events.addUserUnloaded(() => {
        // Reload the page to show logged out state
        window.location.reload();
    });

    const user = await userManager.getUser();
    if (user) {
        showUserDetails(user);
    }
}

let showDetailsRan = false;
function showUserDetails(user: User) {
    if (!showDetailsRan) {
        showDetailsRan = true;
        console.trace("User loaded", user);
        const profile = user!.profile!;

        document.getElementById("user-greeting-name")!.innerText =
            `${profile.given_name} ${profile.family_name}`;

        // Only allow the user to change their password if they are not an ACM IDM user
        if (!profile["acm_idm"]) {
            const changePasswordButton = document.getElementById(
                "my-profile-update-password",
            )! as HTMLAnchorElement;
            changePasswordButton.addEventListener("click", (e) => {
                e.preventDefault();
                login({ extraQueryParams: { kc_action: "UPDATE_PASSWORD" } });
            });

            document
                .getElementById("my-profile-update-password-item")!
                .classList.remove("hidden");
        } else {
            // Allow the user to update their profile details
            const acmIdmSwitchContext = document.getElementById(
                "my-profile-acm-idm-switch-context",
            )! as HTMLAnchorElement;
            acmIdmSwitchContext.addEventListener("click", (e) => {
                e.preventDefault();
                login({
                    extraQueryParams: {
                        kc_idp_hint: "acm-idm",
                        login_hint: "eyJzd2l0Y2hfaWQiOiB0cnVlfQ==",
                    },
                });
            });
            document
                .getElementById("my-profile-acm-idm-switch-context-item")!
                .classList.remove("hidden");
        }

        // Allow the user to update their profile details
        const updateProfileButton = document.getElementById(
            "my-profile-update-profile-details",
        )! as HTMLAnchorElement;
        updateProfileButton.addEventListener("click", (e) => {
            e.preventDefault();
            login({ extraQueryParams: { kc_action: "UPDATE_PROFILE" } });
        });

        // Update link to my-annotated-records
        (
            document.getElementById(
                "my-profile-my-annotated-records",
            )! as HTMLAnchorElement
        ).href =
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
