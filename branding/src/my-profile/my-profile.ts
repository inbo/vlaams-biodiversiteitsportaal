import { getUser, isLoggedIn, login } from "../portal/auth.ts";

$(() => {
    initPage();
});

async function initPage() {
    if (isLoggedIn()) {
        const user = await getUser()!;
        document.getElementById("user-greeting-name")!
            .innerText =
                `${user?.profile.given_name} ${user?.profile.family_name}`;

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
                `/biocache-hub/occurrences/search/?q=*:*&amp;fq=assertion_user_id:%22${user?.profile.sub}%22`;

        const rolesElement = document.getElementById("my-roles")!;
        (user?.profile?.realm_access?.roles as string[]).forEach((role) => {
            const roleElement = document.createElement("span");
            roleElement.className = "badge badge-secondary";
            roleElement.innerText = role;
            rolesElement.appendChild(roleElement);
        });

        document.getElementById("profile-login")!.classList.add("hidden");
        document.getElementById("profile-overview")!.classList.remove("hidden");
    }
}
