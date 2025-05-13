import { getUser, isLoggedIn, login } from "../portal/auth.ts";

$(() => {
    initPage();
});

async function initPage() {
    if (await isLoggedIn()) {
        const user = await getUser()!;
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
                `/biocache-hub/occurrences/search/?q=*:*&amp;fq=assertion_user_id:%22${profile.sub}%22`;

        const roles: string[] = (profile.realm_access as any)?.roles || [];

        const rolesElement = document.getElementById("my-roles")!;
        roles.forEach((role) => {
            const roleElement = document.createElement("span");
            roleElement.className = "badge badge-secondary";
            roleElement.innerText = role;
            rolesElement.appendChild(roleElement);
        });

        if (roles.includes("ADMIN")) {
            Array.from(document.getElementsByClassName("admin-tooling"))
                .forEach(
                    (element) => {
                        element.classList.remove("hidden");
                    },
                );
        }

        document.getElementById("profile-login")!.classList.add("hidden");
        document.getElementById("profile-overview")!.classList.remove("hidden");
    }
}
