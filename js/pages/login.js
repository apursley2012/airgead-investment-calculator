/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: login.js Handles demo sign-in without persisting entered          |
  |          credentials; only a temporary, non-authenticating session flag is |
  |          stored.                                                           |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

import { toast } from "../components/toast.js";

const loginForm = document.querySelector("#loginForm");
let redirectScheduled = false;

// Demo sign-in is not authentication; retain no submitted credentials.
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (redirectScheduled) return;

    try {
        sessionStorage.setItem("airgead_demo_session", "active");
    } catch {
        toast(
            "Demo sign-in is unavailable because session storage is disabled",
        );
        return;
    }

    redirectScheduled = true;
    toast("Signed in for demo mode");

    setTimeout(() => {
        location.href = "saved-plans.html";
    }, 350);
});
